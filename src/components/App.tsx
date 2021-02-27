import React from 'react'
import child_process from 'child_process'
import download from 'download'
import fs from 'fs'
import _ from 'lodash'
import os from 'os'
import path from 'path'
import util from 'util'
import { Intent } from '@blueprintjs/core'
import produce from 'immer'
import { Main } from './Main'
import { Toolbar } from './Toolbar'

import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'

import { AddBoxDialog } from './AddBoxDialog'
import { AppToaster } from './AppToaster'
import { InstallerAlert } from './InstallerAlert'
import { WaitOverlay } from './WaitOverlay'
import { WelcomeScreen } from './WelcomeScreen'

const exec = util.promisify(child_process.exec)

export const ROOT_DIRECTORY = `${os.homedir()}/WebBoxes`
const INSTALLER_DIRECTORY = path.normalize(`${ROOT_DIRECTORY}/.installers`)
const FIXED_INSTALLER_OPTIONS =
  '--unattendedmodeui none --mode unattended  --disable-components varnish --base_password pass  --launch_cloud 0'
const WPCONFIG_NEEDLE =
  '// ** MySQL settings - You can get this info from your web host ** //'
const WPCONFIG_REPLACEMENT = `/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true);

// ** MySQL settings - You can get this info from your web host ** //
`
type Action =
  | {
      type: 'changeBoxStatus'
      payload: { boxName: string; boxStatus: BoxStatus }
    }
  | { type: 'closeAddBoxDialog' }
  | { type: 'closeInstallerAlert' }
  | { type: 'closeWaitOverlay' }
  | { type: 'openAddBoxDialog' }
  | { type: 'openInstallerAlert' }
  | { type: 'openWaitOverlay' }
  | { type: 'updateBoxes'; payload: { boxes: Boxes } }

export interface Box {
  name: string
  port: number
  status: BoxStatus
}

export interface Boxes {
  [key: string]: Box
}
export type BoxStatus = 'starting' | 'started' | 'stopping' | 'stopped'

interface State {
  boxes: Boxes
  isOpenAddBoxDialog: boolean
  isOpenInstallerAlert: boolean
  isOpenWaitOverlay: boolean
  isStale: boolean
}

const initialState = {
  boxes: getBoxes(),
  isOpenAddBoxDialog: false,
  isOpenInstallerAlert: false,
  isOpenWaitOverlay: false,
  isStale: false,
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'changeBoxStatus':
      state.boxes[action.payload.boxName].status = action.payload.boxStatus
      break
    case 'closeAddBoxDialog':
      state.isOpenAddBoxDialog = false
      break
    case 'closeInstallerAlert':
      state.isOpenInstallerAlert = false
      break
    case 'closeWaitOverlay':
      state.isOpenWaitOverlay = false
      break
    case 'openAddBoxDialog':
      return {
        ...state,
        isOpenAddBoxDialog: true,
      }
    case 'openInstallerAlert':
      state.isOpenInstallerAlert = true
      break
    case 'openWaitOverlay':
      state.isOpenWaitOverlay = true
      break
    case 'updateBoxes':
      state.boxes = action.payload.boxes
      break
    default:
      state
  }
}

export function App() {
  const [state, dispatch] = React.useReducer(produce(reducer), initialState)
  console.log(state)

  React.useEffect(() => {
    const boxes = updateBoxes()
    dispatch({ type: 'updateBoxes', payload: { boxes } })
  }, [])

  React.useEffect(() => {
    if (!getInstaller() && !_.isEmpty(getBoxes())) {
      dispatch({ type: 'openInstallerAlert' })
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Toolbar hasInstaller={getInstaller()} onAddBox={openAddBoxDialog} />
      {_.isEmpty(updateBoxes()) ? (
        <WelcomeScreen
          hasInstaller={getInstaller()}
          onAddBox={openAddBoxDialog}
          onDownload={downloadInstaller}
        />
      ) : (
        <Main boxes={state.boxes} onClickToggleBox={onClickToggleBox} />
      )}
      <>
        <AddBoxDialog
          isOpen={state.isOpenAddBoxDialog}
          onClose={closeAddBoxDialog}
          onCreate={onCreateBox}
          takenNames={_.keys(state.boxes)}
        />
        <InstallerAlert
          isOpen={state.isOpenInstallerAlert}
          onCancel={closeInstallerAlert}
          onConfirm={downloadInstaller}
        />
        <WaitOverlay isOpen={state.isOpenWaitOverlay} />
      </>
    </div>
  )

  function closeAddBoxDialog() {
    dispatch({ type: 'closeAddBoxDialog' })
  }

  function closeInstallerAlert() {
    dispatch({ type: 'closeInstallerAlert' })
  }

  async function onClickToggleBox(boxName: string) {
    const box = state.boxes[boxName]
    if (box.status === 'started') {
      dispatch({
        type: 'changeBoxStatus',
        payload: { boxName, boxStatus: 'stopping' },
      })
      await controlBox('stop', boxName)
    } else {
      dispatch({
        type: 'changeBoxStatus',
        payload: { boxName, boxStatus: 'starting' },
      })
      await controlBox('start', boxName)
    }
    const boxes = updateBoxes()
    dispatch({ type: 'updateBoxes', payload: { boxes } })
  }

  function onCreateBox(name: string) {
    closeAddBoxDialog()
    dispatch({ type: 'openWaitOverlay' })
    setTimeout(() => {
      createBox(name, state.boxes)
      const boxes = updateBoxes()
      dispatch({ type: 'updateBoxes', payload: { boxes } })
      dispatch({ type: 'closeWaitOverlay' })
      AppToaster.show({ message: 'Box Created', intent: Intent.SUCCESS })
    }, 100)
  }

  function openAddBoxDialog() {
    if (getInstaller()) {
      dispatch({ type: 'openAddBoxDialog' })
    } else {
      dispatch({ type: 'openInstallerAlert' })
    }
  }
}

async function controlBox(
  action: 'start' | 'stop' | 'restart' | 'status',
  boxName: string
): Promise<void> {
  const ctlscript = path.normalize(
    `${ROOT_DIRECTORY}/${boxName}/bitnami/ctlscript.sh`
  )
  const { stdout } = await exec(`${ctlscript} ${action}`)
  console.log('stdout:', stdout)
}

function createBox(name: string, boxes: Boxes) {
  try {
    // Create box directory
    const bitnamiDirectory = path.normalize(`${ROOT_DIRECTORY}/${name}/bitnami`)
    fs.mkdirSync(bitnamiDirectory, { recursive: true })

    // install wordpress box
    const wordpressInstaller = path.normalize(
      `${ROOT_DIRECTORY}/.installers/${getInstaller()}`
    )
    const installerCommand = `${wordpressInstaller} --prefix ${bitnamiDirectory} --wordpress_blog_name ${name} --nginx_port ${
      8080 + _.size(boxes)
    } --nginx_ssl_port ${8043 + _.size(boxes)} --mysql_port ${
      3306 + _.size(boxes)
    } ${FIXED_INSTALLER_OPTIONS}`
    child_process.execSync(installerCommand)

    // config root directory and remove bitnami banner
    const bnConfig = path.normalize(
      `${bitnamiDirectory}/apps/wordpress/bnconfig`
    )
    const changeAppUrlCommand = `${bnConfig} --appurl /`
    child_process.execSync(changeAppUrlCommand)

    const removeBitnamiCommand = `${bnConfig} --disable_banner 1`
    child_process.execSync(removeBitnamiCommand)

    // disable opcache
    const phpIni = path.normalize(`${bitnamiDirectory}/php/etc/php.ini`)
    const phpIniData = fs.readFileSync(phpIni, 'utf-8')
    const newPhpIniData = phpIniData.replace(
      'opcache.enable=1',
      'opcache.enable=0'
    )
    fs.writeFileSync(phpIni, newPhpIniData, 'utf-8')

    // enable debug output
    const wpConfig = path.normalize(
      `${bitnamiDirectory}/apps/wordpress/htdocs/wp-config.php`
    )
    const wpConfigData = fs.readFileSync(wpConfig, 'utf-8')
    const newWpConfigData = wpConfigData.replace(
      WPCONFIG_NEEDLE,
      WPCONFIG_REPLACEMENT
    )
    fs.writeFileSync(wpConfig, newWpConfigData, 'utf-8')

    // link wp-content to app directory
    const wpContent = path.normalize(
      `${bitnamiDirectory}/apps/wordpress/htdocs/wp-content`
    )
    const app = path.normalize(`${bitnamiDirectory}/../app`)
    child_process.execSync(`ln -s ${wpContent} ${app}`)
  } catch (e) {
    alert(e)
  }
}

async function downloadInstaller() {
  // Create box directory
  fs.mkdirSync(INSTALLER_DIRECTORY, { recursive: true })
  await download(
    `https://bitnami.com/redirect/to/1364386/bitnami-wordpresspro-5.6.2-0-linux-x64-installer.run`,
    INSTALLER_DIRECTORY
  )
  fs.chmodSync(
    path.normalize(
      `${INSTALLER_DIRECTORY}/bitnami-wordpresspro-5.6.2-0-linux-x64-installer.run`
    ),
    fs.constants.S_IRWXU
  )

  AppToaster.show({ message: 'Installer downloaded', intent: Intent.SUCCESS })
}

function getInstaller(): string {
  try {
    return thread(
      '->',
      fs.readdirSync(INSTALLER_DIRECTORY),
      [
        _.reduce,
        (acc, el) =>
          el.startsWith('bitnami-wordpress') && el > acc ? el : acc,
        '',
      ],
      trace
    )
  } catch (e) {
    return ''
  }
}

function getBoxes(): Boxes {
  const boxArr = fs
    .readdirSync(ROOT_DIRECTORY)
    .filter((el) => !el.startsWith('.'))
    .map((el) => ({ name: el, status: 'stopped', port: 8080 }))
  //@ts-expect-error ts is to stupid
  return _.keyBy(boxArr, 'name')
}

function getBoxPort(boxName: string): number {
  const propertiesIni = path.normalize(
    `${ROOT_DIRECTORY}/${boxName}/bitnami/properties.ini`
  )
  const propertiesData = fs.readFileSync(propertiesIni, 'utf-8')
  const propertiesKeyValueArr = propertiesData
    .split('\n')
    .map((el) => el.split('='))
    .filter((el) => el.length === 2)
  const propertiesObj = Object.fromEntries(propertiesKeyValueArr)
  return parseInt(propertiesObj['nginx_port'])
}

function getBoxStatus(boxName: string): BoxStatus {
  const ctlscript = path.normalize(
    `${ROOT_DIRECTORY}/${boxName}/bitnami/ctlscript.sh`
  )
  const result = child_process.execSync(`${ctlscript} status nginx`)
  if (result.toString() === 'Nginx not running\n') {
    return 'stopped'
  } else {
    return 'started'
  }
}

function sanitize(input: string, replacement = '') {
  const sanitized = input.replace(/[/?<>\\:*|":]/g, replacement)
  return sanitized.slice(0, 255)
}

function updateBoxes(): Boxes {
  const boxes = getBoxes()

  return _.keyBy(
    _.values(boxes).map((el) => {
      return {
        ...el,
        status: getBoxStatus(el.name),
        port: getBoxPort(el.name),
      }
    }),
    'name'
  )
}

/**
 * Evaluates the given forms in order, the result of each form will be added last or first in the next form.
 * @example thread(
 *             '->',
 *             arr,
 *             fn1,
 *             [fn2, arg2]
 *          )
 * @param {'->' | '-->'} threadType --> for thread last and -> for thread first
 * @param {*} initialValue
 * @param  {...any} forms
 * @returns any
 */
export const thread = (threadType, initialValue, ...forms) => {
  return forms.reduce((acc, curVal) => {
    if (Array.isArray(curVal)) {
      const [head, ...rest] = curVal
      return threadType === '->'
        ? head.apply(this, [acc, ...rest])
        : head.apply(this, [...rest, acc])
    } else {
      return curVal(acc)
    }
  }, initialValue)
}

/**
 * Log a value to the console and return it again. Useful for logging a provisional result from the thread function.
 * @param {any} x the value to log
 * @return {any} the given value x
 */
export const trace = (x) => {
  console.log(x)
  return x
}

import React from 'react'
import child_process from 'child_process'
import fs from 'fs'
import _ from 'lodash'
import os from 'os'
import path from 'path'
import util from 'util'
import produce from 'immer'
import { Main } from './Main'
import { Toolbar } from './Toolbar'

import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import { AddBoxDialog } from './AddBoxDialog'

const exec = util.promisify(child_process.exec)

const ROOT_DIRECTORY = `${os.homedir()}/WebBoxes`
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
  | { type: 'openAddBoxDialog' }
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
  isStale: boolean
}

const initialState = {
  boxes: getBoxes(),
  isOpenAddBoxDialog: false,
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
    case 'openAddBoxDialog':
      return {
        ...state,
        isOpenAddBoxDialog: true,
      }
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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Toolbar onAddBox={openAddBoxDialog} />
      <Main boxes={state.boxes} onClickToggleBox={onClickToggleBox} />
      <AddBoxDialog
        isOpen={state.isOpenAddBoxDialog}
        onClose={closeAddBoxDialog}
        onCreate={onCreateBox}
        takenNames={_.keys(state.boxes)}
      />
    </div>
  )

  function closeAddBoxDialog() {
    dispatch({ type: 'closeAddBoxDialog' })
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
    createBox(name, state.boxes)
    closeAddBoxDialog()
    const boxes = updateBoxes()
    dispatch({ type: 'updateBoxes', payload: { boxes } })
  }

  function openAddBoxDialog() {
    dispatch({ type: 'openAddBoxDialog' })
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
      `${ROOT_DIRECTORY}/.installers/bitnami-wordpress-installer.run`
    )
    const installerCommand = `${wordpressInstaller} --prefix ${bitnamiDirectory} --wordpress_blog_name ${name} --apache_server_port ${
      8080 + _.size(boxes)
    } --mysql_port ${3306 + _.size(boxes)} ${FIXED_INSTALLER_OPTIONS}`
    child_process.execSync(installerCommand)

    // config root directory
    const bnConfig = path.normalize(
      `${bitnamiDirectory}/apps/wordpress/bnconfig`
    )
    const bnConfigCommand = `${bnConfig} --appurl /`
    child_process.execSync(bnConfigCommand)

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
  return parseInt(propertiesObj['apache_server_port'])
}

function getBoxStatus(boxName: string): BoxStatus {
  const ctlscript = path.normalize(
    `${ROOT_DIRECTORY}/${boxName}/bitnami/ctlscript.sh`
  )
  const result = child_process.execSync(`${ctlscript} status apache`)
  if (result.toString() === 'apache not running\n') {
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

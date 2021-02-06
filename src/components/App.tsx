import React from 'react'
import child_process from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { Main } from './Main'
import { Toolbar } from './Toolbar'

import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import { AddBoxDialog } from './AddBoxDialog'

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
  | { type: 'closeAddBoxDialog' }
  | { type: 'openAddBoxDialog' }
  | { type: 'updateBoxes' }

interface Box {
  name: string
}

interface State {
  boxes: Box[]
  isOpenAddBoxDialog: boolean
  isStale: boolean
}

const BOXES: Box[] = [
  { name: 'reactPress' },
  { name: 'dev' },
  { name: 'rockiger' },
  { name: 'probao' },
]

const initialState = {
  boxes: getBoxes(),
  isOpenAddBoxDialog: false,
  isStale: false,
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'openAddBoxDialog':
      return {
        ...state,
        isOpenAddBoxDialog: true,
      }
    case 'closeAddBoxDialog':
      return {
        ...state,
        isOpenAddBoxDialog: false,
      }
    case 'updateBoxes':
      return {
        ...state,
        boxes: getBoxes(),
      }
    default:
      state
  }
}

export function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Toolbar onAddBox={openAddBoxDialog} />
      <Main boxes={state.boxes} />
      <AddBoxDialog
        isOpen={state.isOpenAddBoxDialog}
        onClose={closeAddBoxDialog}
        onCreate={onCreateBox}
      />
    </div>
  )

  function closeAddBoxDialog() {
    dispatch({ type: 'closeAddBoxDialog' })
  }

  function onCreateBox(name: string) {
    createBox(name, state.boxes)
    dispatch({ type: 'updateBoxes' })
  }

  function createBox(name: string, boxes: Box[]) {
    try {
      // Create box directory
      const bitnamiDirectory = path.normalize(
        `${ROOT_DIRECTORY}/${name}/bitnami`
      )
      fs.mkdirSync(bitnamiDirectory, { recursive: true })

      // install wordpress box
      const wordpressInstaller = path.normalize(
        `${ROOT_DIRECTORY}/.installers/bitnami-wordpress-installer.run`
      )
      const installerCommand = `${wordpressInstaller} --prefix ${bitnamiDirectory} --wordpress_blog_name ${name} --apache_server_port ${
        8080 + boxes.length
      } --mysql_port ${3306 + boxes.length} ${FIXED_INSTALLER_OPTIONS}`
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
    } finally {
      closeAddBoxDialog()
    }
  }

  function openAddBoxDialog() {
    dispatch({ type: 'openAddBoxDialog' })
  }
}

function getBoxes(): Box[] {
  return fs
    .readdirSync(ROOT_DIRECTORY)
    .filter((el) => !el.startsWith('.'))
    .map((el) => ({ name: el }))
}

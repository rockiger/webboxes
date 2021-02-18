import React from 'react'
import { Intent, Overlay, Spinner, Text } from '@blueprintjs/core'

import './WaitOverlay.css'

export function WaitOverlay({ isOpen }) {
  return (
    <Overlay
      isOpen={isOpen}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <div className="WaitOverlay">
        <Text className="WaitOverlay__Text">
          Creating your box. This will take a view minutes. We have to setup the
          web server, mySql, PHP and more...
        </Text>
        <Spinner intent={Intent.PRIMARY} size={75} />
      </div>
    </Overlay>
  )
}

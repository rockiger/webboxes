import React from 'react'
import {
  Button,
  Classes,
  H1,
  H2,
  H3,
  InputGroup,
  Intent,
  NonIdealState,
  Switch,
} from '@blueprintjs/core'

import { Boxes } from '../App'

import './WelcomeScreen.css'

interface Props {
  hasInstaller: string
  onAddBox: () => void
  onDownload: () => void
}

export function WelcomeScreen(props: Props) {
  const [isLoading, setIsLoading] = React.useState(false)
  const hasInstaller = !!props.hasInstaller

  React.useEffect(() => {
    const confirm = async () => {
      if (isLoading) {
        await props.onDownload()
        setIsLoading(false)
      }
    }
    confirm()
  }, [isLoading, props.onDownload])

  return (
    <NonIdealState
      description={
        <>
          <H1>Welcome to Web-Boxes</H1>
          <H2>Setup Web-Boxes to start managing WordPress installations.</H2>
          <div className="WelcomeScreen__actions">
            <div>
              <Button
                disabled={hasInstaller}
                icon={hasInstaller ? 'tick' : 'import'}
                intent={hasInstaller ? Intent.SUCCESS : Intent.NONE}
                large
                minimal
                onClick={() => setIsLoading(true)}
              >
                <H3>Download Installer</H3>
                <p>Download the Bitnami installer for WordPress (250 MB).</p>
              </Button>
            </div>
            <div>
              <Button
                disabled={!hasInstaller}
                icon="plus"
                large
                minimal
                onClick={props.onAddBox}
              >
                <H3>Install Web-Box</H3>
                <p>Install your first WordPress installation with Web-Boxes.</p>
              </Button>
            </div>
          </div>
        </>
      }
    />
  )
}

import React from 'react'
import { Alert, Intent } from '@blueprintjs/core'

interface InstallerAlertProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function InstallerAlert({
  isOpen,
  onCancel,
  onConfirm,
}: InstallerAlertProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const confirm = async () => {
      if (isLoading) {
        await onConfirm()
        setIsLoading(false)
        onCancel()
      }
    }
    confirm()
  }, [isLoading, onCancel, onConfirm])

  return (
    <Alert
      cancelButtonText={isLoading ? null : 'Download later'}
      confirmButtonText="Download now"
      icon="import"
      intent={Intent.PRIMARY}
      isOpen={isOpen}
      loading={isLoading}
      onCancel={() => (isLoading ? null : onCancel())}
      onConfirm={() => {
        setIsLoading(true)
      }}
    >
      <p>
        We need to download the <b>Bitnami WordPress installer</b>, to be able
        to install WordPress boxes. This will take a while. The installer has a
        size of about <b>250 MB</b>.
      </p>
    </Alert>
  )
}

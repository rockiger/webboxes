import * as React from 'react'
import { shell } from 'electron'

import { Button, Card, H5, Icon, Intent, Tag, Text } from '@blueprintjs/core'
import { BoxStatus } from '../App'
import './BoxCard.css'

interface PropType {
  name: string
  port: number
  status: BoxStatus
  onClick: (boxName: string) => void
}

const statusColors = {
  started: Intent.SUCCESS,
  stopped: Intent.DANGER,
  starting: Intent.WARNING,
  stopping: Intent.WARNING,
}

const buttonColors = {
  started: Intent.DANGER,
  starting: Intent.WARNING,
  stopped: Intent.SUCCESS,
  stopping: Intent.WARNING,
}

const buttonText = {
  started: 'Stop Box',
  starting: '',
  stopped: 'Start Box',
  stopping: '',
}

const statusText = {
  started: 'Running',
  starting: 'Starting...',
  stopped: 'Stopped',
  stopping: 'Stopping...',
}

export function BoxCard({ name, port, status, onClick }: PropType) {
  console.log(statusColors[status])
  return (
    <Card className="BoxCard">
      <H5 className="BoxCard__Text">
        <Tag intent={statusColors[status]} round></Tag>
        {status === 'started' ? (
          <a
            href={`http://localhost:${port}`}
            title="Go to box"
            onClick={(ev) => {
              ev.preventDefault()
              //@ts-expect-error type inference is a joke
              shell.openExternal(ev.target.href)
            }}
          >
            {name}
          </a>
        ) : (
          <span>{name}</span>
        )}
      </H5>
      <p>
        <b>Status: </b>
        {statusText[status]}
      </p>
      <Button
        intent={buttonColors[status]}
        loading={status === 'starting' || status === 'stopping'}
        onClick={() => onClick(name)}
      >
        {buttonText[status]}
      </Button>
    </Card>
  )
}

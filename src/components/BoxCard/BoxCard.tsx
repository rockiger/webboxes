import * as React from 'react'
import { shell } from 'electron'

import { Button, Card, H5, Intent, Tag } from '@blueprintjs/core'
import { BoxStatus, ROOT_DIRECTORY } from '../App'
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
  const baselink = `http://localhost:${port}`
  return (
    <Card className="BoxCard">
      <H5 className="BoxCard__Text">
        <Tag intent={statusColors[status]} round></Tag>
        {status === 'started' ? (
          <a href={baselink} title="Go to box" onClick={onClickLink}>
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
      <p>
        <b>Port: </b>
        {port}
      </p>
      <Button
        intent={buttonColors[status]}
        loading={status === 'starting' || status === 'stopping'}
        onClick={() => onClick(name)}
      >
        {buttonText[status]}
      </Button>

      <div>
        {status === 'started' && (
          <>
            <Button
              minimal
              onClick={() => shell.openExternal(baselink)}
              text="Go to site"
            />
            <Button
              minimal
              onClick={() => shell.openExternal(`${baselink}/wp-admin`)}
              text="Go to admin"
            />
            <Button
              minimal
              onClick={() => shell.openExternal(`${baselink}/phpmyadmin`)}
              text="Go to database"
            />
          </>
        )}
      </div>
      <Button
        minimal
        onClick={() => shell.openPath(`${ROOT_DIRECTORY}/${name}/app`)}
        text="Open app folder"
      />
    </Card>
  )
}

function onClickLink(ev: React.MouseEvent<HTMLAnchorElement>) {
  console.log(ev)
  ev.preventDefault()
  shell.openExternal((ev.target as HTMLAnchorElement).href)
}

import * as React from 'react'

import { Button, Card, Icon, Text } from '@blueprintjs/core'
import './BoxCard.css'

interface PropType {
  name: string
  onClick: (ev: any) => void
}
export function BoxCard({ name, onClick }: PropType) {
  return (
    <Button className="BoxCard" large outlined onClick={onClick}>
      <Icon icon="power" iconSize={32} />
      <Text className="BoxCard__Text">{name}</Text>
    </Button>
  )
}

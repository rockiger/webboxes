import React from 'react'
import _ from 'lodash'
import { Boxes } from '../App'
import { BoxCard } from '../BoxCard'

import './Main.css'

interface Props {
  boxes: Boxes
  onClickToggleBox: (boxName: string) => void
}
export function Main({ boxes, onClickToggleBox }: Props) {
  return (
    <main className="main">
      {_.values(boxes).map((box: any) => (
        <BoxCard
          key={box.name}
          name={box.name}
          onClick={onClickToggleBox}
          port={box.port}
          status={box.status}
        />
      ))}
    </main>
  )
}

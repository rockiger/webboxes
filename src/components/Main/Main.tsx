import React from 'react'
import { BoxCard } from '../BoxCard'

import './Main.css'

interface Props {
  boxes: any[]
}
export function Main({ boxes }: Props) {
  return (
    <main className="main">
      {boxes.map((box: any, index: number) => (
        <BoxCard
          key={index}
          name={box.name}
          onClick={(ev) => console.log('tabbed')}
        />
      ))}
    </main>
  )
}

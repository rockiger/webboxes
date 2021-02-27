import React from 'react'
import { Alignment, Button, Navbar } from '@blueprintjs/core'

interface ToolbarProps {
  hasInstaller: string
  onAddBox: () => void
}
export function Toolbar({ onAddBox, hasInstaller }: ToolbarProps) {
  return (
    <>
      <Navbar fixedToTop>
        <Navbar.Group align={Alignment.LEFT}>
          <Button
            className="bp3-minimal"
            disabled={!hasInstaller}
            icon="plus"
            onClick={onAddBox}
          />
        </Navbar.Group>
        <Navbar.Group align={Alignment.CENTER}></Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button className="bp3-minimal" icon="menu" />
        </Navbar.Group>
      </Navbar>
      <style>{`
      .bp3-navbar {
        display: grid;
        grid-template-columns: 1fr 4fr 1fr;
        grid-template-areas: "left middle right";
      }
      .bp3-navbar .bp3-navbar-group {
        justify-content: center;
      }
      .bp3-navbar .bp3-navbar-group.bp3-align-left {
        justify-content: flex-start;
      }
      .bp3-navbar .bp3-navbar-group.bp3-align-right {
        justify-content: flex-end;
      }
    `}</style>
    </>
  )
}

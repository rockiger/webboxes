import * as React from 'react'
import { Main } from './Main'
import { Toolbar } from './Toolbar'

import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import { AddBoxDialog } from './AddBoxDialog'

type Action = { type: 'closeAddBoxDialog' } | { type: 'openAddBoxDialog' }

interface Box {
  name: string
}

interface State {
  isOpenAddBoxDialog: boolean
  boxes: Box[]
}

const BOXES: Box[] = [
  { name: 'reactPress' },
  { name: 'dev' },
  { name: 'rockiger' },
  { name: 'probao' },
]

const initialState = { isOpenAddBoxDialog: false, boxes: BOXES }

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
    default:
      state
  }
}

export function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Toolbar onAddBox={openAddBoxDialog} />
      <Main boxes={BOXES} />
      <AddBoxDialog
        isOpen={state.isOpenAddBoxDialog}
        onClose={closeAddBoxDialog}
        onCreate={(name: string) => console.log('Create Box: ' + name)}
      />
    </div>
  )

  function closeAddBoxDialog() {
    dispatch({ type: 'closeAddBoxDialog' })
  }

  function openAddBoxDialog() {
    dispatch({ type: 'openAddBoxDialog' })
  }
}

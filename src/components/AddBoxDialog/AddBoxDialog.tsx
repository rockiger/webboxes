import React, { SyntheticEvent } from 'react'
import {
  Button,
  Classes,
  Dialog,
  FormGroup,
  InputGroup,
  Intent,
} from '@blueprintjs/core'

interface AddBoxDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
}
export function AddBoxDialog({ isOpen, onClose, onCreate }: AddBoxDialogProps) {
  const [boxName, setBoxName] = React.useState<string>('')

  return (
    <Dialog
      isOpen={isOpen}
      isCloseButtonShown={true}
      onClose={onClose}
      title={'Create new Web Box'}
    >
      <div className={Classes.DIALOG_BODY}>
        <p>
          <strong>A new web box for local development will be created.</strong>
        </p>
        <div>
          <FormGroup
            label="Box Title"
            labelFor="box-name-input"
            labelInfo="(required)"
          >
            <InputGroup
              id="box-name-input"
              onChange={(ev) => setBoxName(ev.target.value)}
              onKeyDown={(ev) =>
                handleKeyDown(ev, {
                  onEnter: () => {
                    if (boxName) {
                      onCreate(boxName)
                      onClose()
                    } else {
                      console.log('no box name')
                    }
                  },
                })
              }
              placeholder="Your box's name."
              value={boxName}
            />
          </FormGroup>
        </div>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
          <Button
            disabled={!boxName.length}
            intent={Intent.PRIMARY}
            onClick={() => onCreate(boxName)}
          >
            Create Box
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

const handleKeyDown = (
  ev: React.BaseSyntheticEvent,
  handlers = { onEnter: () => console.log('onEnter') }
) => {
  console.log(ev)
  //@ts-expect-error key exists on BaseSyntheticEvent "onKeyDown"
  if (ev.key === 'Enter') {
    handlers.onEnter()
  }
}

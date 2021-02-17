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
  takenNames: string[]
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
}
export function AddBoxDialog({
  takenNames,
  isOpen,
  onClose,
  onCreate,
}: AddBoxDialogProps): JSX.Element {
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
            helperText={
              <HelperText boxName={boxName} takenNames={takenNames} />
            }
            intent={Intent.WARNING}
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

const HelperText = ({ boxName, takenNames }) => {
  console.log(boxName.length)
  if (boxName.length < 1) {
    return <br />
  } else if (boxName.length < 3) {
    return <span>Minimum name length is 3.</span>
  } else if (takenNames.includes(boxName)) {
    return <span>Name already taken.</span>
  } else if (!/^[0-9a-zA-Z_][0-9a-zA-Z_-]*[0-9a-zA-Z_]{0,1}$/.test(boxName)) {
    return (
      <span>
        Box tiles must contain only letters, numbers, underscores and hyphens:{' '}
        <b>0-9a-zA-Z_-</b> Hyphens can't be at the beginning or end of the name.
      </span>
    )
  } else {
    return <br />
  }
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

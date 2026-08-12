import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Text
} from '@fluentui/react-components'

import { AlertIcon } from './Icons'

type ConfirmRemoveDialogProps = {
    cameraLabel?: string
    isOpen: boolean
    isSaving: boolean
    userName?: string
    onCancel: () => void
    onConfirm: () => void
}

export const ConfirmRemoveDialog = ({
    cameraLabel,
    isOpen,
    isSaving,
    userName,
    onCancel,
    onConfirm
}: ConfirmRemoveDialogProps) => (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onCancel()}>
        <DialogSurface className="confirm-dialog-surface">
            <DialogBody>
                <DialogTitle>
                    <span className="dialog-title confirm-dialog-title">
                        <AlertIcon className="message-icon" />
                        Remove camera?
                    </span>
                </DialogTitle>
                <DialogContent className="confirm-dialog-content">
                    <Text>
                        Remove {cameraLabel ?? 'this camera'} from {userName ?? 'this user'}? The camera will remain
                        available for future assignments.
                    </Text>
                </DialogContent>
                <DialogActions className="confirm-dialog-actions">
                    <Button className="confirm-dialog-cancel" disabled={isSaving} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        className="confirm-dialog-confirm"
                        disabled={isSaving}
                        onClick={onConfirm}
                    >
                        Remove camera
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </Dialog>
)

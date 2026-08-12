import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  makeStyles,
  Text,
} from "@fluentui/react-components";

import { AlertIcon } from "./Icons";

type ConfirmRemoveDialogProps = {
  cameraLabel?: string;
  isOpen: boolean;
  isSaving: boolean;
  userName?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmRemoveDialog = ({
  cameraLabel,
  isOpen,
  isSaving,
  userName,
  onCancel,
  onConfirm,
}: ConfirmRemoveDialogProps) => {
  const styles = useStyles();

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onCancel()}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            <span className={styles.title}>
              <AlertIcon className={styles.icon} />
              Remove camera?
            </span>
          </DialogTitle>
          <DialogContent className={styles.content}>
            <Text>
              Remove {cameraLabel ?? "this camera"} from{" "}
              {userName ?? "this user"}? The camera will remain available for
              future assignments.
            </Text>
          </DialogContent>
          <DialogActions className={styles.actions}>
            <Button
              className={styles.button}
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              className={styles.button}
              disabled={isSaving}
              onClick={onConfirm}
            >
              Remove camera
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

const useStyles = makeStyles({
  surface: {
    backgroundColor: "#f5f4f2",
    border: "1px solid #d7d3cc",
    borderRadius: "4px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.22)",
  },
  title: {
    alignItems: "center",
    borderBottom: "1px solid #d7d3cc",
    color: "#333",
    display: "flex",
    gap: "0.8rem",
    margin: "0 -4px",
    paddingBottom: "0.8rem",
  },
  icon: {
    color: "#4a4a4a",
    flexShrink: 0,
  },
  content: {
    color: "#4a4a4a",
    paddingTop: "0.5rem",
  },
  actions: {
    paddingTop: "0.8rem",
  },
  button: {
    borderRadius: "4px",
  },
});

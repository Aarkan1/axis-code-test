import {
  Button,
  Card,
  Input,
  makeStyles,
  Text,
} from "@fluentui/react-components";
import type { FormEvent } from "react";

import type { AdminDataResponse } from "../api/graphql";
import { AdminSelect } from "./AdminSelect";
import { CameraIcon, NetworkIcon, ShieldIcon } from "./Icons";

type AdminActionsProps = {
  adminData: AdminDataResponse;
  createUserId: string;
  existingCameraId: string;
  existingUserId: string;
  name: string;
  niceName: string;
  address: string;
  isSaving: boolean;
  onAddExistingCamera: (event: FormEvent<HTMLFormElement>) => void;
  onCreateCamera: (event: FormEvent<HTMLFormElement>) => void;
  onSetAddress: (value: string) => void;
  onSetCreateUserId: (value: string) => void;
  onSetExistingCameraId: (value: string) => void;
  onSetExistingUserId: (value: string) => void;
  onSetName: (value: string) => void;
  onSetNiceName: (value: string) => void;
};

type AdminUsersProps = {
  adminData: AdminDataResponse;
  isSaving: boolean;
  onRemoveCamera: (
    userId: string,
    cameraId: string,
    cameraLabel: string,
    userName: string,
  ) => void;
};

export const AdminActions = ({
  adminData,
  createUserId,
  existingCameraId,
  existingUserId,
  name,
  niceName,
  address,
  isSaving,
  onAddExistingCamera,
  onCreateCamera,
  onSetAddress,
  onSetCreateUserId,
  onSetExistingCameraId,
  onSetExistingUserId,
  onSetName,
  onSetNiceName,
}: AdminActionsProps) => {
  const styles = useStyles();

  return (
    <section className={styles.actions}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <CameraIcon className={styles.cardIcon} />
          <Text as="h2" size={500} weight="semibold">
            Create camera
          </Text>
        </div>
        <form className={styles.form} onSubmit={onCreateCamera}>
          <UserSelect
            label="User"
            onChange={onSetCreateUserId}
            users={adminData.users}
            value={createUserId}
          />
          <label className={styles.formField}>
            <Text weight="semibold">Camera name</Text>
            <Input
              className={styles.input}
              onChange={(_, data) => onSetName(data.value)}
              required
              value={name}
            />
          </label>
          <label className={styles.formField}>
            <Text weight="semibold">Nice name</Text>
            <Input
              className={styles.input}
              onChange={(_, data) => onSetNiceName(data.value)}
              value={niceName}
            />
          </label>
          <label className={styles.formField}>
            <Text weight="semibold">Address</Text>
            <Input
              className={styles.input}
              onChange={(_, data) => onSetAddress(data.value)}
              required
              value={address}
            />
          </label>
          <Button appearance="primary" disabled={isSaving} type="submit">
            Create camera
          </Button>
        </form>
      </Card>

      <Card className={styles.card}>
        <div className={styles.header}>
          <NetworkIcon className={styles.cardIcon} />
          <Text as="h2" size={500} weight="semibold">
            Assign camera
          </Text>
        </div>
        <form className={styles.form} onSubmit={onAddExistingCamera}>
          <UserSelect
            label="User"
            onChange={onSetExistingUserId}
            users={adminData.users}
            value={existingUserId}
          />
          <AdminSelect
            label="Camera"
            onChange={onSetExistingCameraId}
            options={adminData.allCameras.map((camera) => ({
              label: camera.niceName ?? camera.name,
              value: camera.id,
            }))}
            value={existingCameraId}
          />
          <Button appearance="primary" disabled={isSaving} type="submit">
            Assign to user
          </Button>
        </form>
      </Card>
    </section>
  );
};

export const AdminUsers = ({
  adminData,
  isSaving,
  onRemoveCamera,
}: AdminUsersProps) => {
  const styles = useStyles();

  return (
    <section className={styles.users}>
      {adminData.users.map((user) => (
        <Card className={styles.card} key={user.id}>
          <div className={styles.header}>
            <ShieldIcon className={styles.cardIcon} />
            <Text as="h2" size={500} weight="semibold">
              {user.name}
            </Text>
          </div>
          {user.cameras.length === 0 ? (
            <Text>No cameras assigned.</Text>
          ) : (
            <div className={styles.cameraList}>
              {user.cameras.map((camera) => (
                <div className={styles.cameraRow} key={camera.id}>
                  <Text>{camera.niceName ?? camera.name}</Text>
                  <Button
                    appearance="primary"
                    disabled={isSaving}
                    onClick={() =>
                      onRemoveCamera(
                        user.id,
                        camera.id,
                        camera.niceName ?? camera.name,
                        user.name,
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </section>
  );
};

const UserSelect = ({
  label,
  onChange,
  users,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  users: AdminDataResponse["users"];
  value: string;
}) => (
  <AdminSelect
    label={label}
    onChange={onChange}
    options={users.map((user) => ({ label: user.name, value: user.id }))}
    value={value}
  />
);

const useStyles = makeStyles({
  actions: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  users: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  card: {
    backdropFilter: "blur(14px)",
    backgroundColor: "var(--surface)",
    border: "1px solid #ddd9d2",
    borderRadius: "6px",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
    overflow: "visible",
    padding: "1rem",
    transitionDuration: "160ms",
    transitionProperty: "border-color, box-shadow, transform",
    transitionTimingFunction: "ease",
    ":hover": {
      borderBottomColor: "rgba(15, 108, 189, 0.32)",
      borderLeftColor: "rgba(15, 108, 189, 0.32)",
      borderRightColor: "rgba(15, 108, 189, 0.32)",
      borderTopColor: "rgba(15, 108, 189, 0.32)",
      boxShadow: "0 12px 34px rgba(36, 55, 79, 0.1)",
      transform: "translateY(-1px)",
    },
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#d7d3cc",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    display: "flex",
    gap: "0.8rem",
    margin: "0 -1rem",
    padding: "0 1rem 0.9rem",
  },
  cardIcon: {
    color: "#4a4a4a",
    flexShrink: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  input: {
    backgroundColor: "#edecea",
    borderBottomColor: "#b8b5ae",
    borderLeftColor: "#b8b5ae",
    borderRightColor: "#b8b5ae",
    borderTopColor: "#b8b5ae",
    borderRadius: "4px",
  },
  cameraList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  cameraRow: {
    alignItems: "center",
    borderBottomColor: "#d7d3cc",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    display: "flex",
    gap: "0.8rem",
    justifyContent: "space-between",
    margin: "0 -1rem",
    padding: "0 1rem 0.8rem",
  },
});

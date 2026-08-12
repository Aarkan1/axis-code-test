import {
  Button,
  Card,
  makeStyles,
  mergeClasses,
  Spinner,
  Text,
} from "@fluentui/react-components";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addCamera,
  addCameraToUser,
  fetchAdminData,
  removeCameraFromUser,
  type AdminDataResponse,
} from "../api/graphql";
import type { StoredSession } from "../auth";
import { AdminActions, AdminUsers } from "../components/AdminPanelSections";
import { ConfirmRemoveDialog } from "../components/ConfirmRemoveDialog";
import { AlertIcon, ShieldIcon, SuccessIcon } from "../components/Icons";

type AdminPageProps = {
  session: StoredSession;
  onLogout: () => void;
};

type PendingRemoval = {
  cameraId: string;
  cameraLabel: string;
  userId: string;
  userName: string;
};

export const AdminPage = ({ session, onLogout }: AdminPageProps) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<AdminDataResponse | null>(null);
  const [createUserId, setCreateUserId] = useState("");
  const [existingUserId, setExistingUserId] = useState("");
  const [existingCameraId, setExistingCameraId] = useState("");
  const [name, setName] = useState("");
  const [niceName, setNiceName] = useState("");
  const [address, setAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );

  const loadAdminData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setErrorMessage(null);

    try {
      const data = await fetchAdminData(session.token);
      const firstUserId = data.users[0]?.id ?? "";
      const firstCameraId = data.allCameras[0]?.id ?? "";

      setAdminData(data);
      setCreateUserId((currentUserId) => currentUserId || firstUserId);
      setExistingUserId((currentUserId) => currentUserId || firstUserId);
      setExistingCameraId(
        (currentCameraId) => currentCameraId || firstCameraId,
      );
    } catch (error) {
      if (showLoading) {
        setAdminData(null);
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Could not load admin data.",
      );
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, [session.token]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      setHasShownNotification(true);
    }
  }, [errorMessage, successMessage]);

  const runAdminAction = async (
    action: () => Promise<unknown>,
    message: string,
  ) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await action();
      await loadAdminData(false);
      setSuccessMessage(message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Admin action failed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  const handleCreateCamera = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAdminAction(
      () =>
        addCamera(session.token, {
          userId: createUserId,
          name,
          niceName: niceName || null,
          address,
        }),
      "Camera created.",
    );

    setName("");
    setNiceName("");
    setAddress("");
  };

  const handleAddExistingCamera = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void runAdminAction(
      () => addCameraToUser(session.token, existingUserId, existingCameraId),
      "Camera assigned to user.",
    );
  };

  const handleRequestRemoveCamera = (
    userId: string,
    cameraId: string,
    cameraLabel: string,
    userName: string,
  ) => {
    setPendingRemoval({ userId, cameraId, cameraLabel, userName });
  };

  const handleConfirmRemoveCamera = () => {
    if (!pendingRemoval) {
      return;
    }

    const { userId, cameraId } = pendingRemoval;
    setPendingRemoval(null);

    void runAdminAction(
      () => removeCameraFromUser(session.token, userId, cameraId),
      "Camera removed from user.",
    );
  };

  const notificationMessage = errorMessage ?? successMessage;
  const isErrorNotification = Boolean(errorMessage);
  const shouldShowNotificationSlot =
    hasShownNotification || Boolean(notificationMessage);

  return (
    <main className={styles.shell}>
      <section className={styles.dashboardHeader}>
        <div className={styles.hero}>
          <div className={styles.heroTitle}>
            <ShieldIcon className={styles.heroIcon} />
            <Text as="h1" size={800} weight="semibold">
              Camera administration
            </Text>
          </div>
          <Text className={styles.subtleText} size={400}>
            Manage users and their camera assignments.
          </Text>
        </div>

        <div className={styles.headerActions}>
          <Button onClick={() => navigate("/")}>Home</Button>
          <Button onClick={handleLogout}>Log out</Button>
        </div>
      </section>

      {isLoading && !adminData && (
        <div className={styles.stateMessage}>
          <Spinner label="Loading admin data" />
        </div>
      )}

      {shouldShowNotificationSlot && (
        <div className={styles.notificationSlot}>
          <Card
            aria-hidden={!notificationMessage}
            className={mergeClasses(
              styles.messageCard,
              isErrorNotification ? styles.messageError : styles.messageSuccess,
              !notificationMessage && styles.messageHidden,
            )}
            role={
              notificationMessage
                ? isErrorNotification
                  ? "alert"
                  : "status"
                : undefined
            }
          >
            {isErrorNotification ? (
              <AlertIcon
                className={mergeClasses(styles.messageIcon, styles.errorText)}
              />
            ) : (
              <SuccessIcon
                className={mergeClasses(styles.messageIcon, styles.successText)}
              />
            )}
            <Text
              className={isErrorNotification ? styles.errorText : undefined}
              weight="semibold"
            >
              {notificationMessage ?? "No notification"}
            </Text>
          </Card>
        </div>
      )}

      {adminData && (
        <section className={styles.selectorLayout}>
          <aside className={styles.sidebar}>
            <AdminActions
              address={address}
              adminData={adminData}
              createUserId={createUserId}
              existingCameraId={existingCameraId}
              existingUserId={existingUserId}
              isSaving={isSaving}
              name={name}
              niceName={niceName}
              onAddExistingCamera={handleAddExistingCamera}
              onCreateCamera={handleCreateCamera}
              onSetAddress={setAddress}
              onSetCreateUserId={setCreateUserId}
              onSetExistingCameraId={setExistingCameraId}
              onSetExistingUserId={setExistingUserId}
              onSetName={setName}
              onSetNiceName={setNiceName}
            />
          </aside>
          <section className={styles.results}>
            <Text as="h2" size={700}>
              Users and cameras
            </Text>
            <AdminUsers
              adminData={adminData}
              isSaving={isSaving}
              onRemoveCamera={handleRequestRemoveCamera}
            />
          </section>
        </section>
      )}
      <ConfirmRemoveDialog
        cameraLabel={pendingRemoval?.cameraLabel}
        isOpen={Boolean(pendingRemoval)}
        isSaving={isSaving}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={handleConfirmRemoveCamera}
        userName={pendingRemoval?.userName}
      />
    </main>
  );
};

const useStyles = makeStyles({
  shell: {
    animationName: "page-in",
    animationDuration: "260ms",
    animationTimingFunction: "ease-out",
    boxSizing: "border-box",
    color: "#383838",
    display: "flex",
    flexDirection: "column",
    gap: "1.6rem",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "1180px",
    minHeight: "100vh",
    padding: "1.8rem 0.6rem 3rem",
    position: "relative",
  },
  dashboardHeader: {
    alignItems: "flex-start",
    display: "flex",
    gap: "1rem",
    justifyContent: "space-between",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  heroTitle: {
    alignItems: "center",
    display: "flex",
    gap: "0.8rem",
  },
  heroIcon: {
    color: "#4a4a4a",
    flexShrink: 0,
  },
  subtleText: {
    color: "var(--muted)",
  },
  headerActions: {
    display: "flex",
    gap: "0.8rem",
    justifyContent: "space-between",
  },
  stateMessage: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "160px",
  },
  notificationSlot: {
    height: "90px",
  },
  messageCard: {
    alignItems: "flex-start",
    boxSizing: "border-box",
    display: "flex",
    gap: "12px",
    height: "90px",
    overflow: "hidden",
    padding: "16px",
    border: `1px solid #ddd9d2`,
    borderRadius: "6px",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
  },
  messageError: {
    backgroundColor: "var(--error-bg)",
    borderBottomColor: "rgba(177, 14, 28, 0.32)",
    borderLeftColor: "rgba(177, 14, 28, 0.32)",
    borderRightColor: "rgba(177, 14, 28, 0.32)",
    borderTopColor: "rgba(177, 14, 28, 0.32)",
  },
  messageSuccess: {
    backgroundColor: "var(--success-bg)",
    borderBottomColor: "rgba(16, 124, 16, 0.28)",
    borderLeftColor: "rgba(16, 124, 16, 0.28)",
    borderRightColor: "rgba(16, 124, 16, 0.28)",
    borderTopColor: "rgba(16, 124, 16, 0.28)",
  },
  messageHidden: {
    visibility: "hidden",
  },
  messageIcon: {
    flexShrink: 0,
  },
  errorText: {
    color: "var(--error)",
  },
  successText: {
    color: "var(--success)",
  },
  selectorLayout: {
    alignItems: "start",
    display: "grid",
    gap: "1.1rem",
    gridTemplateColumns: "350px minmax(0, 1fr)",
  },
  sidebar: {
    borderRadius: "4px",
    position: "sticky",
    top: "1.2rem",
    borderRight: "3px solid #ddd9d2",
    paddingRight: "1rem",
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
});

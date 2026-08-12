import { Button, Card, Spinner, Text } from "@fluentui/react-components";
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

  return (
    <main className="app-shell admin-selector-page">
      <section className="dashboard-header admin-selector-header">
        <div className="hero">
          <div className="hero-title">
            <ShieldIcon className="hero-icon" />
            <Text as="h1" size={800} weight="semibold">
              Camera administration
            </Text>
          </div>
          <Text className="subtle-text" size={400}>
            Manage users and their camera assignments.
          </Text>
        </div>

        <div className="header-actions">
          <Button onClick={() => navigate("/")}>Home</Button>
          <Button onClick={handleLogout}>Log out</Button>
        </div>
      </section>

      {isLoading && !adminData && (
        <div className="state-message">
          <Spinner label="Loading admin data" />
        </div>
      )}

      <div className="notification-slot">
        {errorMessage && (
          <Card className="message-card message-card--error">
            <AlertIcon className="message-icon" />
            <Text className="error-text" weight="semibold">
              {errorMessage}
            </Text>
          </Card>
        )}

        {!errorMessage && successMessage && (
          <Card className="message-card message-card--success">
            <SuccessIcon className="message-icon" />
            <Text weight="semibold">{successMessage}</Text>
          </Card>
        )}
      </div>

      {adminData && (
        <section className="admin-selector-layout">
          <aside className="admin-sidebar">
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
          <section className="admin-results">
            <Text as="h2" className="admin-series-title" size={700}>
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

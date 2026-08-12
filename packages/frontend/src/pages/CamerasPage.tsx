import {
  Button,
  Card,
  Image,
  makeStyles,
  mergeClasses,
  Spinner,
  Text,
  Tooltip,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchCurrentUserCameras, type CamerasResponse } from "../api/graphql";
import { AlertIcon, CameraIcon, InfoIcon } from "../components/Icons";
import type { StoredSession } from "../auth";

const cameraDeviceImageUrl =
  "https://www.axis.com/sites/axis/files/styles/standard_1360_x_auto/public/2023-05/m4218_lv_wall_angle_left_2301-Productimageswithcropping.png.webp?itok=jVaylaKQ";

type CamerasPageProps = {
  session: StoredSession;
  onLogout: () => void;
};

export const CamerasPage = ({ session, onLogout }: CamerasPageProps) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [cameraData, setCameraData] = useState<CamerasResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let isCurrentRequest = true;

    const loadCameras = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchCurrentUserCameras(session.token);

        if (isCurrentRequest) {
          setCameraData(data);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setCameraData(null);
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load cameras.",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    };

    void loadCameras();

    return () => {
      isCurrentRequest = false;
    };
  }, [session.token]);

  return (
    <main className={styles.shell}>
      <section className={styles.dashboardHeader}>
        <div className={styles.hero}>
          <div className={styles.heroTitle}>
            <CameraIcon className={styles.heroIcon} />
            <Text as="h1" size={800} weight="semibold">
              Network cameras
            </Text>
          </div>
          <Text className={styles.subtleText} size={400}>
            Signed in as {session.user.name}.
          </Text>
        </div>

        <div className={styles.headerActions}>
          {session.user.isAdmin && (
            <Button onClick={() => navigate("/admin")}>Admin</Button>
          )}
          <Button onClick={handleLogout}>Log out</Button>
        </div>
      </section>

      {isLoading && (
        <div className={styles.stateMessage}>
          <Spinner label="Loading cameras" />
        </div>
      )}

      {!isLoading && errorMessage && (
        <Card className={mergeClasses(styles.messageCard, styles.messageError)}>
          <AlertIcon className={styles.messageIcon} />
          <div className={styles.hero}>
            <Text weight="semibold">Could not load cameras</Text>
            <Text>{errorMessage}</Text>
          </div>
        </Card>
      )}

      {!isLoading && cameraData && (
        <section className={styles.cameraSection}>
          <Text
            as="h2"
            className={styles.sectionTitle}
            size={500}
            weight="semibold"
          >
            Cameras for {cameraData.me.name}
          </Text>

          {cameraData.cameras.length === 0 ? (
            <Card
              className={mergeClasses(styles.messageCard, styles.messageInfo)}
            >
              <InfoIcon className={styles.messageIcon} />
              <Text>This user does not have any cameras yet.</Text>
            </Card>
          ) : (
            <>
              <Text className={styles.subtleText} size={400}>
                Your assigned Axis camera devices.
              </Text>
              <div className={styles.cameraGrid}>
                {cameraData.cameras.map((camera) => (
                  <Card
                    className={mergeClasses(
                      styles.cameraCard,
                      styles.productCard,
                    )}
                    key={camera.id}
                  >
                    <Image
                      alt=""
                      className={styles.productImage}
                      src={cameraDeviceImageUrl}
                    />
                    <Text
                      className={styles.productName}
                      size={500}
                      weight="semibold"
                    >
                      {camera.niceName ?? camera.name}
                    </Text>
                    {camera.niceName && (
                      <Tooltip
                        content="Device name"
                        positioning="above"
                        relationship="label"
                      >
                        <Text className={styles.productDetail}>
                          {camera.name}
                        </Text>
                      </Tooltip>
                    )}
                    <Tooltip
                      content="Device address"
                      positioning="above"
                      relationship="label"
                    >
                      <Text className={styles.cameraAddress}>
                        {camera.address}
                      </Text>
                    </Tooltip>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
};

const useStyles = makeStyles({
  shell: {
    animationName: "page-in",
    animationDuration: "260ms",
    animationTimingFunction: "ease-out",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "1.6rem",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "1160px",
    minHeight: "100vh",
    padding: "1.8rem 0 3rem",
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
    minHeight: "10rem",
  },
  messageCard: {
    alignItems: "flex-start",
    display: "flex",
    gap: "0.8rem",
    padding: "1rem",
  },
  messageError: {
    backgroundColor: "var(--error-bg)",
    borderBottomColor: "rgba(177, 14, 28, 0.32)",
    borderLeftColor: "rgba(177, 14, 28, 0.32)",
    borderRightColor: "rgba(177, 14, 28, 0.32)",
    borderTopColor: "rgba(177, 14, 28, 0.32)",
  },
  messageInfo: {
    backgroundColor: "rgb(222, 231, 239)",
    borderBottomColor: "var(--border)",
    borderLeftColor: "var(--border)",
    borderRightColor: "var(--border)",
    borderTopColor: "var(--border)",
  },
  messageIcon: {
    color: "var(--accent)",
    flexShrink: 0,
  },
  cameraSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  sectionTitle: {
    borderBottomColor: "#d8d8d8",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    paddingBottom: "0.8rem",
  },
  cameraGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  cameraCard: {
    backdropFilter: "blur(14px)",
    backgroundColor: "var(--surface)",
    border: `1px solid var(--border)`,
    boxShadow: "0 10px 28px rgba(36, 55, 79, 0.08)",
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
  productCard: {
    alignItems: "center",
    minHeight: "16.3rem",
    maxWidth: "18.8rem",
    padding: "1.4rem 1rem 1.1rem",
    position: "relative",
    textAlign: "center",
  },
  productImage: {
    alignSelf: "center",
    height: "8.2rem",
    objectFit: "contain",
    width: "10.8rem",
  },
  productName: {
    maxWidth: "11.9rem",
  },
  productDetail: {
    color: "#444",
    fontSize: "0.8rem",
  },
  cameraAddress: {
    color: "var(--muted)",
  },
});

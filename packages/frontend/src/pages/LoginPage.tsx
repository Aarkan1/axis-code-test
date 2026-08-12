import {
  Button,
  Card,
  Input,
  makeStyles,
  Text,
} from "@fluentui/react-components";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login, type AuthPayload } from "../api/graphql";
import { AlertIcon } from "../components/Icons";

type LoginPageProps = {
  onLogin: (session: AuthPayload) => void;
};

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await login(username, password);

      onLogin(session);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.shell}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.hero}>
            <Text
              as="h1"
              className={styles.heroTitle}
              size={800}
              weight="semibold"
            >
              Sign in
            </Text>
            <Text className={styles.subtleText} size={400}>
              Use your camera dashboard account to continue.
            </Text>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.formField}>
            <Text weight="semibold">Username</Text>
            <Input
              className={styles.input}
              autoComplete="username"
              onChange={(_, data) => setUsername(data.value)}
              required
              value={username}
            />
          </label>

          <label className={styles.formField}>
            <Text weight="semibold">Password</Text>
            <Input
              className={styles.input}
              autoComplete="current-password"
              onChange={(_, data) => setPassword(data.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {errorMessage && (
            <Card className={styles.messageCard}>
              <AlertIcon className={styles.errorText} />
              <Text className={styles.errorText} weight="semibold">
                {errorMessage}
              </Text>
            </Card>
          )}

          <Button
            appearance="primary"
            className={styles.button}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
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
    justifyContent: "center",
    minHeight: "100vh",
    padding: "2rem",
    position: "relative",
  },
  card: {
    backdropFilter: "blur(14px)",
    backgroundColor: "var(--surface)",
    border: "1px solid #ddd9d2",
    borderRadius: "6px",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
    maxWidth: "440px",
    overflow: "visible",
    padding: "1.8rem",
    transitionDuration: "160ms",
    transitionProperty: "border-color, box-shadow, transform",
    transitionTimingFunction: "ease",
    width: "100%",
    height: "fit-content",
    marginTop: "15rem",
  },
  brand: {
    alignItems: "center",
    backgroundColor: "#f5f4f2",
    border: "1px solid #d7d3cc",
    borderRadius: "4px",
    display: "flex",
    gap: "0.8rem",
    padding: "0.8rem",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  heroTitle: {
    fontSize: "1.8rem",
    marginTop: 0,
  },
  subtleText: {
    color: "var(--muted)",
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
  messageCard: {
    alignItems: "flex-start",
    backgroundColor: "var(--error-bg)",
    border: `1px solid rgba(177, 14, 28, 0.32)`,
    display: "flex",
    gap: "0.8rem",
    padding: "1rem",
  },
  errorText: {
    color: "var(--error)",
  },
  button: {
    marginTop: "1.4rem",
  },
});

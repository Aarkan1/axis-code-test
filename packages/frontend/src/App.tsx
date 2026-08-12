import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  clearSession,
  getStoredSession,
  saveSession,
  type StoredSession,
} from "./auth";
import { AdminPage } from "./pages/AdminPage";
import { CamerasPage } from "./pages/CamerasPage";
import { LoginPage } from "./pages/LoginPage";

export const App = () => {
  const [session, setSession] = useState<StoredSession | null>(() =>
    getStoredSession(),
  );

  const handleLogin = (nextSession: StoredSession) => {
    saveSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <Routes>
      <Route
        element={
          session ? (
            <Navigate replace to="/" />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
        path="/login"
      />
      <Route
        element={
          session ? (
            <CamerasPage onLogout={handleLogout} session={session} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
        path="/"
      />
      <Route
        element={
          session?.user.isAdmin ? (
            <AdminPage onLogout={handleLogout} session={session} />
          ) : (
            <Navigate replace to={session ? "/" : "/login"} />
          )
        }
        path="/admin"
      />
      <Route
        element={<Navigate replace to={session ? "/" : "/login"} />}
        path="*"
      />
    </Routes>
  );
};

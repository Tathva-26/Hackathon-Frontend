"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { exchangeGoogleCredential } from "../lib/auth";
import { useAuth } from "./AuthProvider";

// Drop-in Google button with backend exchange + actionable error messages.
// Handles the errors that surface as flowName=GeneralOAuthFlow in raw GIS.
export default function GoogleSignIn() {
  const { login, setError } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const fail = (message, hint) => {
    const full = hint ? `${message} ${hint}` : message;
    setLocalError(full);
    setError(full);
    setBusy(false);
  };

  return (
    <div>
      <GoogleLogin
        theme="filled_black"
        size="large"
        shape="rectangular"
        text="continue_with"
        width={340}
        useOneTap={false}
        onSuccess={async (response) => {
          if (!response.credential) {
            fail("Google did not return a sign-in token. Try again.");
            return;
          }
          setBusy(true);
          setLocalError("");
          try {
            const data = await exchangeGoogleCredential(response.credential);
            login(data.token, data.user);
          } catch (e) {
            // Map backend error codes to what the user should actually do.
            if (e.code === "WRONG_AUDIENCE") {
              fail(
                "Google token was issued for a different Client ID.",
                "Frontend NEXT_PUBLIC_GOOGLE_CLIENT_ID must exactly match backend GOOGLE_CLIENT_ID."
              );
            } else if (e.code === "SERVER_MISCONFIGURED") {
              fail("Server is misconfigured.", e.message);
            } else if (e.status === 409 || e.code === "ACCOUNT_EXISTS") {
              fail(e.message);
            } else {
              fail(e.message || "Google authentication failed. Try again.", e.hint || "");
            }
          } finally {
            setBusy(false);
          }
        }}
        onError={() => {
          // This is the React wrapper for the GeneralOAuthFlow popup failure:
          // 99% of the time = Authorized JavaScript origins mismatch in Cloud Console.
          fail(
            "Google blocked the sign-in popup.",
            "In Google Cloud Console > Credentials, add this page's exact origin (scheme + host + port, e.g. http://localhost:3000) to Authorized JavaScript origins for this Client ID, wait ~5 min, and retry. Also allow third-party cookies and disable ad-block."
          );
        }}
      />
      {busy && <p style={{ marginTop: 12, opacity: 0.8 }}>SIGNING YOU IN WITH GOOGLE...</p>}
      {localError && (
        <p role="alert" style={{ marginTop: 12, color: "#ff7b7b", maxWidth: 340 }}>
          {localError}
        </p>
      )}
    </div>
  );
}

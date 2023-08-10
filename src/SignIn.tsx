import React, { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { generateRandomChallenge } from "./helper";

const defaultTheme = createTheme();

export default function SignIn() {
  const [msgText, setMsgText] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      username: data.get("username"),
      password: data.get("password"),
    });
  };

  const handleRegister = async () => {
    try {
      if (PublicKeyCredential?.isConditionalMediationAvailable) {
        const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
        if (isCMA) {
          const abortController = new AbortController();
          const challenge = generateRandomChallenge();
          const credential = (await navigator.credentials.create({
            publicKey: {
              challenge: new Uint8Array([117, 61, 252, 231, 191, 241]), //Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0)),
              rp: {
                name: "WebAuthn Demo",
              },
              user: {
                id: new Uint8Array(16),
                name: username,
                displayName: username,
              },
              authenticatorSelection: { userVerification: "preferred" },
              attestation: "direct",
              pubKeyCredParams: [
                {
                  type: "public-key",
                  alg: -7,
                },
              ],
            },
            signal: abortController.signal,
          })) as PublicKeyCredential;

          // Extract the attestation object and client data JSON from the response
          const attestationObject = new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject);
          const clientDataJSON = new Uint8Array(credential.response.clientDataJSON);

          const authenticatorBase64 = btoa(String.fromCharCode(...attestationObject));
          const clientDataJSONBase64 = btoa(String.fromCharCode(...clientDataJSON));

          const response = await fetch("http://localhost:3030/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ attestationObject: authenticatorBase64, clientDataJSON: clientDataJSONBase64, username }),
          });
          const result = await response.text();

          setMsgText(result);
          console.log("credential", credential);
        } else {
          setMsgText("not support, switch to typical register flow");
        }
      } else {
        setMsgText("Error");
      }
    } catch (error) {
      setMsgText("Invalid handling");
    }
  };
  const handleLogin = async () => {
    try {
      if (PublicKeyCredential?.isConditionalMediationAvailable) {
        const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
        if (isCMA) {
          const abortController = new AbortController();

          const challenge = generateRandomChallenge(); // Generate a cryptographically secure random challenge

          // Request user's credentials for login
          const credential = (await navigator.credentials.get({
            publicKey: {
              rpId: "localhost",
              challenge: new Uint8Array([117, 61, 252, 231, 191, 241]), //new Uint8Array([...atob(challenge)].map((c) => c.charCodeAt(0))),
            },
            signal: abortController.signal,
            mediation: "optional",
          })) as PublicKeyCredential;

          // Extract the authenticatorData from the response
          const response = credential.response as AuthenticatorAssertionResponse;
          const authenticatorData = new Uint8Array(response.authenticatorData);

          // Convert the authenticatorData to base64 for sending to the server
          const authenticatorDataBase64 = btoa(String.fromCharCode(...authenticatorData));

          const loginResponse = await fetch("http://localhost:3030/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, authenticatorData: authenticatorDataBase64 }),
          });

          if (loginResponse.ok) {
            const result = await loginResponse.text();
            setMsgText(result);
          } else {
            setMsgText(`Login failed: ${loginResponse.statusText}`);
          }
          console.log("credential", credential);
        } else {
          setMsgText("not support, switch to typical login flow");
        }
      } else {
        setMsgText("Error");
      }
    } catch (error) {
      setMsgText("Invalid handling");
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            WebAuthn Demo
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
              autoComplete="webauthn"
              autoFocus
            />
            {/* <TextField fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" /> */}
            <Grid container spacing={2}>
              <Grid item>
                <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleRegister}>
                  Register
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleLogin}>
                  Authenticate
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Box color="danger">{msgText}</Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

import React, { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const defaultTheme = createTheme();

export default function SignIn() {
  const [errorText, setErrorText] = useState("");
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
          const newCredential = await navigator.credentials.create({
            publicKey: {
              challenge: new Uint8Array([117, 61, 252, 231, 191, 241]),
              rp: {
                name: username,
              },
              user: {
                id: new Uint8Array([11, 11, 25, 11, 11, 21]),
                name: username,
                displayName: "test account",
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
          });
          console.log("credential", newCredential);
          // Then send credential to RP server
        } else {
          setErrorText("not support, switch to typical register flow");
        }
      } else {
        setErrorText("Error");
      }
    } catch (error) {
      setErrorText("Invalid handling");
    }
  };
  const handleLogin = async () => {
    try {
      if (PublicKeyCredential?.isConditionalMediationAvailable) {
        const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
        if (isCMA) {
          const abortController = new AbortController();

          const credential = await navigator.credentials.get({
            publicKey: { challenge: new Uint8Array([117, 61, 252, 231, 191, 241]), rpId: "localhost" },
            signal: abortController.signal,
            mediation: "optional",
          });
          console.log("credential", credential);
          // Then send credential to RP server
        } else {
          setErrorText("not support, switch to typical login flow");
        }
      } else {
        setErrorText("Error");
      }
    } catch (error) {
      setErrorText("Invalid handling");
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
          <Box color="danger">{errorText}</Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

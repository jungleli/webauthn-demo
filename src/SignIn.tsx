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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      username: data.get("username"),
      password: data.get("password"),
    });
  };

  const handleRegister = async () => {
    // Availability of `window.PublicKeyCredential` means WebAuthn is usable.
    if (window.PublicKeyCredential && PublicKeyCredential.isConditionalMediationAvailable) {
      const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
      if (isCMA) {
        const abortController = new AbortController();

        const credential = await navigator.credentials.get({
          publicKey: { challenge: new Uint8Array([117, 61, 252, 231, 191, 241]), rpId: "localhost" },
          signal: abortController.signal,
          mediation: "optional",
        });
        console.log("credential", credential);
      } else {
        setErrorText("not support");
      }
    } else {
      setErrorText("Error");
    }
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
            <TextField margin="normal" required fullWidth id="username" label="username" name="username" autoComplete="webauthn" autoFocus />
            {/* <TextField fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" /> */}
            <Grid container spacing={2}>
              <Grid item>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleRegister}>
                  Register
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
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

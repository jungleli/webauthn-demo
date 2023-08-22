import React, { useRef, useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { base64URLToArrayBuffer, bufferToBase64URLString } from "./helper";
import { fetchOptions, parsedRegisterOptions } from "./api";
import { TextareaAutosize } from "@mui/material";

const defaultTheme = createTheme();

const outputLog = (element: any, title: string, output: string) => {
  if (!element) {
    return;
  }
  let str = "============================\n";
  str += `${title}\n`;
  str += `${output}\n`;

  element.innerHTML += `${str}\n`;
};

const resetLog = (element: any) => {
  if (!element) {
    return;
  }
  element.innerHTML = "";
};

export default function SignIn() {
  const [msgText, setMsgText] = useState("");
  const [username, setUsername] = useState("");
  const logRefRegistration = useRef(null);
  const logRefLogin = useRef(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      username: data.get("username"),
      password: data.get("password"),
    });
  };

  const handleRegister = async () => {
    resetLog(logRefRegistration.current);
    setMsgText("");

    const response = await fetchOptions({ username, type: "register" });
    if (!response.ok) {
      setMsgText(await response.text());
      return;
    }
    const { publicKeyOptions, challengeId } = await response.json();
    outputLog(logRefRegistration.current, "1. Registration Options", JSON.stringify(publicKeyOptions, null, 2));

    try {
      if (PublicKeyCredential?.isConditionalMediationAvailable) {
        const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
        if (!isCMA) {
          setMsgText("not support, switch to typical register flow");
          return;
        }

        const credential = (await navigator.credentials.create({
          publicKey: parsedRegisterOptions(publicKeyOptions),
          signal: new AbortController().signal,
        })) as PublicKeyCredential;

        const credentialResponse = credential.response as AuthenticatorAttestationResponse;
        const { id, rawId, type } = credential;
        const requestData = {
          username,
          challengeId,
          authData: {
            id,
            rawId: bufferToBase64URLString(rawId),
            type,
            attestationObject: bufferToBase64URLString(credentialResponse.attestationObject),
            clientDataJSON: bufferToBase64URLString(credentialResponse.clientDataJSON),
            publicKeyAlgorithm: credentialResponse.getPublicKeyAlgorithm(),
            publicKey: bufferToBase64URLString(credentialResponse.getPublicKey()),
            authenticatorData: bufferToBase64URLString(credentialResponse.getAuthenticatorData()),
          },
        };

        outputLog(logRefRegistration.current, "2. Registration credential request data", JSON.stringify(requestData, null, 2));

        const response = await fetch("http://localhost:3030/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
        const result = await response.text();

        setMsgText(result);
      } else {
        setMsgText("Error");
      }
    } catch (error) {
      setMsgText("Invalid handling");
    }
  };
  const handleLogin = async () => {
    resetLog(logRefLogin.current);
    setMsgText("");
    const response = await fetchOptions({ username, type: "login" });
    if (!response.ok) {
      setMsgText(await response.text());
      return;
    }
    const { publicKeyOptions, challengeId } = await response.json();
    outputLog(logRefLogin.current, "1. Login Options", JSON.stringify(publicKeyOptions, null, 2));
    try {
      if (PublicKeyCredential?.isConditionalMediationAvailable) {
        const isCMA = await PublicKeyCredential.isConditionalMediationAvailable();
        if (isCMA) {
          const abortController = new AbortController();
          const credential = (await navigator.credentials.get({
            publicKey: { ...publicKeyOptions, challenge: base64URLToArrayBuffer(publicKeyOptions.challenge) },
            signal: abortController.signal,
            mediation: "optional",
          })) as PublicKeyCredential;
          // Extract the authenticatorData from the response
          const { authenticatorData, clientDataJSON, signature } = credential.response as AuthenticatorAssertionResponse;

          const bodyData = {
            username,
            authenticatorData: bufferToBase64URLString(authenticatorData),
            clientDataJSON: bufferToBase64URLString(clientDataJSON),
            signature: bufferToBase64URLString(signature),
            challengeId,
          };
          const loginResponse = await fetch("http://localhost:3030/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
          });

          outputLog(logRefLogin.current, "2. Login post bodyData", JSON.stringify(bodyData, null, 2));

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
          <Box color="red" fontWeight="bold">
            {msgText}
          </Box>

          <Grid container spacing={2} width="1000px">
            <Grid item xs={6}>
              <TextareaAutosize style={{ width: "100%" }} minRows={3} ref={logRefRegistration}></TextareaAutosize>
            </Grid>
            <Grid item xs={6}>
              <TextareaAutosize style={{ width: "100%" }} minRows={3} ref={logRefLogin}></TextareaAutosize>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

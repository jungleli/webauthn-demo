import { base64URLDecode } from "./helper";

export async function fetchOptions({ username, type }: { username: string; type: string }) {
  const response = await fetch(`http://localhost:3030/generate-options?username=${username}&type=${type}`);

  return response;
}

export const parsedRegisterOptions = (options) => ({
  ...options,
  challenge: base64URLDecode(options.challenge),
  user: { ...options.user, id: base64URLDecode(options.user.id) },
});

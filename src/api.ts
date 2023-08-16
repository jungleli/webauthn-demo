export async function fetchChallenge(bodyData: { username: string }) {
  const response = await fetch("http://localhost:3030/generate-challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });
  const data = await response.json();
  return data;
}

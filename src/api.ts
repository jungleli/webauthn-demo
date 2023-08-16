export async function fetchChallenge() {
  const response = await fetch("http://localhost:3030/generate-challenge");
  const data = await response.json();
  return data;
}

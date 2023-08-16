const generateRandomChallenge = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  // return btoa(String.fromCharCode.apply(null, [...array]));
  return btoa(String.fromCharCode(...array));
};

function base64URLDecode(base64URL: string): ArrayBuffer {
  let base64 = base64URL.replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  const binary = atob(base64);

  // Convert the binary string to a Uint8Array
  const byteArray = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    byteArray[i] = binary.charCodeAt(i);
  }

  return byteArray;
}

export { generateRandomChallenge, base64URLDecode };

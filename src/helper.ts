const generateRandomChallenge = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  // return btoa(String.fromCharCode.apply(null, [...array]));
  return btoa(String.fromCharCode(...array));
};

function base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
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

export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";

  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }

  const base64String = btoa(str);

  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export { generateRandomChallenge, base64URLToArrayBuffer };

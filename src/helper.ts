const generateRandomChallenge = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    // return btoa(String.fromCharCode.apply(null, [...array]));
    return btoa(String.fromCharCode(...array));
  }
export { generateRandomChallenge }

const STORAGE_KEYS = {
  encPat: "enc-pat",
  repos: "repos-list",
  gallery: "gallery",
};

function getRepos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.repos)) || [];
  } catch {
    return [];
  }
}

function setRepos(repos) {
  localStorage.setItem(STORAGE_KEYS.repos, JSON.stringify(repos));
}

function hasEncryptedPAT() {
  const value = localStorage.getItem(STORAGE_KEYS.encPat);
  return !!value && value.trim() !== "";
}

function clearEncryptedPAT() {
  localStorage.removeItem(STORAGE_KEYS.encPat);
}

function setGallery(repo, image_urls) {
  localStorage.setItem(`${STORAGE_KEYS.gallery}_${repo}`, JSON.stringify(image_urls));
}

function getGallery(repo) {
  const data = localStorage.getItem(`${STORAGE_KEYS.gallery}_${repo}`);
  console.log(data);
  if (!data) return undefined;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse gallery for repo:", repo, e);
    return [];
  }
}

function deleteGallery(repo) {
  localStorage.removeItem(`${STORAGE_KEYS.gallery}_${repo}`);
}

//Encryption (& Decryption) of PAT from here

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptAndSavePAT(pat, passphrase) {
  const encoder = new TextEncoder();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(pat),
  );

  const payload = {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(new Uint8Array(encrypted)),
  };

  localStorage.setItem(STORAGE_KEYS.encPat, JSON.stringify(payload));

  // return {
  //   salt: bufferToBase64(salt),
  //   iv: bufferToBase64(iv),
  //   ciphertext: bufferToBase64(encrypted),
  // };
}

async function retrieveAndDecryptPAT(passphrase) {
  const stored = localStorage.getItem(STORAGE_KEYS.encPat);
  if (!stored) return null;

  const payload = JSON.parse(stored);

  const key = await deriveKey(passphrase, base64ToUint8Array(payload.salt));

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToUint8Array(payload.iv),
    },
    key,
    base64ToUint8Array(payload.ciphertext),
  );

  return new TextDecoder().decode(decrypted);
}

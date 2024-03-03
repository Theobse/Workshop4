import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};

export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const keys = await webcrypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a public key
  // Extract the raw key data
  const exportedKey = await crypto.subtle.exportKey("spki", key);

  // Convert the raw key data to base64
  const exportedKeyArray = new Uint8Array(exportedKey);
  const exportedKeyBase64 = btoa(String.fromCharCode(...exportedKeyArray));

  return exportedKeyBase64;
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(key: webcrypto.CryptoKey | null): Promise<string | null> {
  try {
    if (key) {
      // Extract the raw key data
      const exportedKey = await crypto.subtle.exportKey("pkcs8", key);

      // Convert the raw key data to base64
      const exportedKeyArray = new Uint8Array(exportedKey);
      const exportedKeyBase64 = btoa(String.fromCharCode(...exportedKeyArray));

      return exportedKeyBase64;
    } 
    else {
      return null;
    }
  } 
  catch (error) {
    console.error('Error exporting private key:', error);
    throw error;
  }
}

// Import a base64 string public key to its native format
export async function importPubKey(strKey: string): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportPubKey function to it's native crypto key object
  try {
    const arrayBufferKey = base64ToArrayBuffer(strKey);
    const importedKey = await crypto.subtle.importKey(
      'spki',
      arrayBufferKey,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );

    return importedKey;
  } catch (error) {
    console.error('Error importing public key:', error);
    throw error;
  }
}

// Import a base64 string private key to its native format
export async function importPrvKey(strKey: string): Promise<webcrypto.CryptoKey> {
  try {
    const arrayBufferKey = base64ToArrayBuffer(strKey);
    const importedKey = await crypto.subtle.importKey(
      'pkcs8',
      arrayBufferKey,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt']
    );

    return importedKey;
  } catch (error) {
    console.error('Error importing private key:', error);
    throw error;
  }
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(b64Data: string, strPublicKey: string): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  try {
    const publicKey = await importPubKey(strPublicKey);
    const dataBuffer = base64ToArrayBuffer(b64Data);
    const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      dataBuffer
    );
    const encryptedDataB64 = arrayBufferToBase64(new Uint8Array(encryptedData));
    // console.log({rsaEncrypt1: encryptedDataB64});
    return encryptedDataB64;
  } 
  catch (error) {
    console.error('Error encrypting with RSA public key:', error);
    throw error;
  }
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(data: string, privateKey: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to decrypt a base64 encoded message with a private key
  try {
    const encryptedDataBuffer = base64ToArrayBuffer(data);
    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedDataBuffer
    );
    const decryptedDataB64 = arrayBufferToBase64(new Uint8Array(decryptedData));
    return decryptedDataB64;
  } 
  catch (error) {
    console.error('Error decrypting with RSA private key:', error);
    throw error;
  }
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256,
      },
      true, // key is extractable
      ['encrypt', 'decrypt']
    );

    return key;
  } catch (error) {
    console.error('Error generating symmetric key:', error);
    throw error;
  }
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a symmetric key
  try {
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const base64String = arrayBufferToBase64(exportedKey);

    return base64String;
  } catch (error) {
    console.error('Error exporting symmetric key:', error);
    throw error;
  }
}

// Import a base64 string format to its crypto native format
export async function importSymKey(strKey: string): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportSymKey function to it's native crypto key object
  try {
    const arrayBufferKey = base64ToArrayBuffer(strKey);
    const importedKey = await crypto.subtle.importKey(
      'raw',
      arrayBufferKey,
      { name: 'AES-CBC', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return importedKey;
  } catch (error) {
    console.error('Error importing symmetric key:', error);
    throw error;
  }
}

// Encrypt a message using a symmetric key
export async function symEncrypt(key: webcrypto.CryptoKey, data: string): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  try {
    const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialization Vector (IV) for AES-CBC
    const dataBuffer = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      dataBuffer
    );

    const combinedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
    combinedBuffer.set(iv);
    combinedBuffer.set(new Uint8Array(encryptedData), iv.length);

    const encryptedDataB64 = arrayBufferToBase64(combinedBuffer);

    return encryptedDataB64;
  } 
  catch (error) {
    console.error('Error encrypting with symmetric key:', error);
    throw error;
  }
}

// Decrypt a message using a symmetric key
export async function symDecrypt(strKey: string, encryptedData: string): Promise<string> {
  // TODO implement this function to decrypt a base64 encoded message with a private key
  try {
    const key = await importSymKey(strKey);
    const combinedBuffer = base64ToArrayBuffer(encryptedData);
    const iv = combinedBuffer.slice(0, 16);
    const encryptedDataBuffer = combinedBuffer.slice(16);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encryptedDataBuffer
    );

    const decryptedDataStr = new TextDecoder().decode(new Uint8Array(decryptedData));

    return decryptedDataStr;
  } catch (error) {
    console.error('Error decrypting with symmetric key:', error);
    throw error;
  }
}
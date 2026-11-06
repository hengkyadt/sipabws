/**
 * Secure password hashing utility using Web Crypto API (SHA-256) with random salt.
 * Ensures plain-text passwords are never stored in localStorage or Google Sheets.
 */

export async function hashPassword(password: string, customSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = customSalt || generateSalt(16);
  const textToHash = `${salt}:${password}:SIPAB_PTKI_SECRET_KEY`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash, salt };
  } else {
    // Simple fallback hash for environments without Web Crypto
    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      const char = textToHash.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return { hash: Math.abs(hash).toString(16), salt };
  }
}

export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

export function generateSalt(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const randomVals = new Uint8Array(length);
    window.crypto.getRandomValues(randomVals);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomVals[i] % chars.length);
    }
    return result;
  }
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

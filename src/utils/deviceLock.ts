const DEVICE_LOCK_KEY = 'different-minds-device-lock-credential';

function randomBytes(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

export function deviceLockAvailable() {
  return typeof window !== 'undefined' && window.isSecureContext && 'PublicKeyCredential' in window && !!navigator.credentials;
}

export function deviceLockEnabled() {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(DEVICE_LOCK_KEY);
}

export async function enableDeviceLock(userId: string, email: string) {
  if (!deviceLockAvailable()) throw new Error('Device security is not supported in this browser.');
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(),
      rp: { name: 'Different Minds', id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(userId).slice(0, 64),
        name: email || 'Different Minds user',
        displayName: email || 'Different Minds user',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    },
  }) as PublicKeyCredential | null;
  if (!credential) throw new Error('Device-lock setup was cancelled.');
  localStorage.setItem(DEVICE_LOCK_KEY, toBase64Url(new Uint8Array(credential.rawId)));
}

export function disableDeviceLock() {
  localStorage.removeItem(DEVICE_LOCK_KEY);
}

export async function unlockWithDevice() {
  const saved = localStorage.getItem(DEVICE_LOCK_KEY);
  if (!saved || !deviceLockAvailable()) return false;
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(),
      rpId: window.location.hostname,
      allowCredentials: [{ id: fromBase64Url(saved), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  }) as PublicKeyCredential | null;
  return !!credential && toBase64Url(new Uint8Array(credential.rawId)) === saved;
}

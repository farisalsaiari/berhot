import type { CheckUserResult } from '@berhot/ui';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface OTPSendResponse {
  sent: boolean;
  destination: string;
  expiresIn: number;
}

interface OTPVerifyResponse {
  verified: boolean;
  userExists: boolean;
  needsRegistration?: boolean;
  identifier?: string;
  user?: AuthResponse['user'];
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export async function checkUser(identifier: string): Promise<CheckUserResult> {
  return apiFetch<CheckUserResult>('/v1/auth/check-user', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function sendOtp(identifier: string): Promise<OTPSendResponse> {
  return apiFetch<OTPSendResponse>('/v1/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export async function verifyOtp(identifier: string, code: string): Promise<OTPVerifyResponse> {
  return apiFetch<OTPVerifyResponse>('/v1/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ identifier, code }),
  });
}

export async function signUp(data: {
  identifier: string;
  firstName: string;
  lastName: string;
  businessName: string;
  password: string;
  googleId?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  return apiFetch('/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  });
}

export function getGoogleAuthUrl(langCode: string, redirectUri: string): string {
  return `${API_BASE}/v1/auth/oauth/google?lang_code=${langCode}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// ── Passkey / WebAuthn ──────────────────────────────────────

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function passkeyLogin(): Promise<AuthResponse> {
  // Step 1: Begin — get challenge from server
  const beginRes = await fetch(`${API_BASE}/v1/auth/passkey/login/begin`, { method: 'POST' });
  const beginData = await beginRes.json();
  if (!beginRes.ok) throw new Error(beginData.error || 'Failed to begin passkey login');

  const { publicKey, sessionKey } = beginData;

  // Convert base64url fields to ArrayBuffer for WebAuthn API
  const credentialRequestOptions: CredentialRequestOptions = {
    publicKey: {
      challenge: base64urlToBuffer(publicKey.challenge),
      timeout: publicKey.timeout,
      rpId: publicKey.rpId,
      userVerification: publicKey.userVerification,
      allowCredentials: (publicKey.allowCredentials || []).map((c: { id: string; type: string; transports?: string[] }) => ({
        id: base64urlToBuffer(c.id),
        type: c.type,
        transports: c.transports,
      })),
    },
  };

  // Step 2: Browser prompt — user touches passkey
  const assertion = await navigator.credentials.get(credentialRequestOptions) as PublicKeyCredential;
  if (!assertion) throw new Error('Passkey authentication was cancelled');

  const response = assertion.response as AuthenticatorAssertionResponse;

  // Step 3: Finish — send assertion to server
  const finishBody = {
    id: assertion.id,
    rawId: bufferToBase64url(assertion.rawId),
    type: assertion.type,
    response: {
      authenticatorData: bufferToBase64url(response.authenticatorData),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : '',
    },
  };

  const finishRes = await fetch(`${API_BASE}/v1/auth/passkey/login/finish?sessionKey=${sessionKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finishBody),
  });
  const finishData = await finishRes.json();
  if (!finishRes.ok) throw new Error(finishData.error || 'Passkey authentication failed');

  return finishData as AuthResponse;
}

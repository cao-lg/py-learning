const API_BASE = '';

export interface BindResponse {
  ok: boolean;
  userId?: string;
  error?: string;
}

export interface SyncResponse {
  ok: boolean;
  syncedAt?: number;
  error?: string;
}

export async function bindUser(name: string): Promise<BindResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return await response.json();
  } catch (error) {
    console.error('Bind error:', error);
    return { ok: false, error: 'Network error' };
  }
}

export async function syncData(data: {
  userId: string;
  practice?: Record<string, unknown>;
  exam?: Record<string, unknown>;
  audit?: Record<string, unknown>;
}): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Sync error:', error);
    return { ok: false, error: 'Network error' };
  }
}

export function getUserId(): string | null {
  return localStorage.getItem('userId');
}

export function setUserId(userId: string): void {
  localStorage.setItem('userId', userId);
}

export function getUserName(): string | null {
  return localStorage.getItem('userName');
}

export function setUserName(name: string): void {
  localStorage.setItem('userName', name);
}

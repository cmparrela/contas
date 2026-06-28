import type { ConnectionResponse, InviteConnectionInput } from '@contas/shared';
import { authedFetch } from '../api-client';

export interface ConnectionsResponse {
  accepted: ConnectionResponse[];
  pending: ConnectionResponse[];
  sent: ConnectionResponse[];
}

export async function listConnections(token: string): Promise<ConnectionsResponse> {
  const res = await authedFetch(token, '/api/connections');
  if (!res.ok) throw new Error(`GET /api/connections failed: ${res.status}`);
  return res.json() as Promise<ConnectionsResponse>;
}

export async function inviteConnection(
  token: string,
  body: InviteConnectionInput,
): Promise<ConnectionResponse> {
  const res = await authedFetch(token, '/api/connections/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST /api/connections/invite failed: ${res.status}`);
  const data = (await res.json()) as { connection: ConnectionResponse };
  return data.connection;
}

export async function acceptConnection(token: string, id: string): Promise<ConnectionResponse> {
  const res = await authedFetch(token, `/api/connections/${id}/accept`, { method: 'PUT' });
  if (!res.ok) throw new Error(`PUT /api/connections/${id}/accept failed: ${res.status}`);
  const data = (await res.json()) as { connection: ConnectionResponse };
  return data.connection;
}

export async function rejectConnection(token: string, id: string): Promise<ConnectionResponse> {
  const res = await authedFetch(token, `/api/connections/${id}/reject`, { method: 'PUT' });
  if (!res.ok) throw new Error(`PUT /api/connections/${id}/reject failed: ${res.status}`);
  const data = (await res.json()) as { connection: ConnectionResponse };
  return data.connection;
}

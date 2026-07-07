import type { CreateTagInput, TagResponse, UpdateTagInput } from '@contas/shared';
import { authedFetch } from '../api-client';

export async function listTags(token: string): Promise<TagResponse[]> {
  const res = await authedFetch(token, '/api/tags');
  if (!res.ok) throw new Error(`GET /api/tags failed: ${res.status}`);
  const data = (await res.json()) as { tags: TagResponse[] };
  return data.tags;
}

export async function createTag(token: string, body: CreateTagInput): Promise<TagResponse> {
  const res = await authedFetch(token, '/api/tags', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST /api/tags failed: ${res.status}`);
  const data = (await res.json()) as { tag: TagResponse };
  return data.tag;
}

export async function updateTag(
  token: string,
  id: string,
  body: UpdateTagInput,
): Promise<TagResponse> {
  const res = await authedFetch(token, `/api/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT /api/tags/${id} failed: ${res.status}`);
  const data = (await res.json()) as { tag: TagResponse };
  return data.tag;
}

export async function deleteTag(token: string, id: string): Promise<void> {
  const res = await authedFetch(token, `/api/tags/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE /api/tags/${id} failed: ${res.status}`);
  }
}

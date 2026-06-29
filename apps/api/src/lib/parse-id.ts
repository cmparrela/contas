import { ObjectId } from 'mongodb';

export function parseId(param: string): ObjectId | null {
  try {
    return new ObjectId(param);
  } catch {
    return null;
  }
}

import type { DeepReadonly } from './contracts';

/** 僅用在已分離的公開資料；不能凍結 canonical state。 */
export function freezePublic<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezePublic(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}

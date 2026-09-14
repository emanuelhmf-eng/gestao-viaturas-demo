import { createSeed } from './seed.mjs';

export const STORAGE_KEY = 'gestao-viatura-demo-v1';
const listeners = new Set();
let state;
try { state = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) || 'null'); } catch { /* Seed on first use or invalid storage. */ }
if (!state || !state.viaturas) state = createSeed();
const clone = value => JSON.parse(JSON.stringify(value));
function hydrate(value) {
  if (value && typeof value === 'object') {
    if (typeof value.seconds === 'number') return { ...value, toDate: () => new Date(value.seconds * 1000) };
    for (const key of Object.keys(value)) value[key] = hydrate(value[key]);
  }
  return value;
}
function commit(next) {
  // Persist before notifying: storage quota errors must not silently discard changes.
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
  state = next;
  for (const listener of listeners) queueMicrotask(listener);
}
export const db = {};
export const storage = {};
export const app = { name: 'demo-local' };
export const collection = (_, name) => ({ name });
export const doc = (_, name, id) => ({ name, id });
export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, direction = 'asc') => ({ type: 'order', field, direction });
export const limit = count => ({ type: 'limit', count });
export const query = (source, ...filters) => ({ ...source, filters });
export const serverTimestamp = () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 });
function documentSnapshot(id, data) {
  return { id, exists: () => data !== undefined, data: () => data === undefined ? undefined : hydrate(clone(data)) };
}
function snapshot(source) {
  let rows = Object.entries(state[source.name] || {});
  for (const filter of source.filters || []) {
    if (filter.type === 'where') rows = rows.filter(([, row]) => {
      if (filter.op !== '==') throw new Error(`Operador não implementado: ${filter.op}`);
      return row[filter.field] === filter.value;
    });
    if (filter.type === 'order') rows.sort((a, b) => {
      const av = a[1][filter.field]?.seconds ?? a[1][filter.field];
      const bv = b[1][filter.field]?.seconds ?? b[1][filter.field];
      return (av < bv ? -1 : av > bv ? 1 : 0) * (filter.direction === 'desc' ? -1 : 1);
    });
    if (filter.type === 'limit') rows = rows.slice(0, filter.count);
  }
  const docs = rows.map(([id, data]) => documentSnapshot(id, data));
  return { docs, size: docs.length, empty: !docs.length, forEach: fn => docs.forEach(fn) };
}
export const getDocs = async source => snapshot(source);
export const getDoc = async source => documentSnapshot(source.id, state[source.name]?.[source.id]);
export async function addDoc(source, data) {
  const id = globalThis.crypto.randomUUID();
  const next = clone(state);
  (next[source.name] ||= {})[id] = clone(data);
  commit(next);
  return { ...source, id };
}
export async function updateDoc(source, data) {
  if (!state[source.name]?.[source.id]) throw new Error('Registro não encontrado.');
  const next = clone(state);
  Object.assign(next[source.name][source.id], clone(data));
  commit(next);
}
export async function deleteDoc(source) {
  const next = clone(state);
  delete (next[source.name] || {})[source.id];
  commit(next);
}
export function onSnapshot(source, callback, onError = console.error) {
  const notify = () => { try { callback(snapshot(source)); } catch (error) { onError(error); } };
  listeners.add(notify);
  queueMicrotask(notify);
  return () => listeners.delete(notify);
}
export function resetDemo() { commit(createSeed()); }
export const ref = (_, path) => ({ path });
export async function uploadBytes(target, file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 750000) throw new Error('Use uma imagem PNG, JPEG ou WebP de até 750 KB na demonstração.');
  target.url = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
export const getDownloadURL = async target => target.url;

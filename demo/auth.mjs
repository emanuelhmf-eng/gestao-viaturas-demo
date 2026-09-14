export const auth = { currentUser: null };
const listeners = new Set();
const user = { uid: 'visitante', email: 'visitante@example.com' };
try { if (sessionStorage.getItem('viatura-demo-session')) auth.currentUser = user; } catch {}
export function onAuthStateChanged(_, callback) {
  listeners.add(callback);
  queueMicrotask(() => callback(auth.currentUser));
  return () => listeners.delete(callback);
}
export async function signInWithEmailAndPassword() {
  try { sessionStorage.setItem('viatura-demo-session', '1'); } catch {}
  auth.currentUser = user;
  for (const callback of listeners) callback(user);
  return { user };
}
export async function signOut() {
  try { sessionStorage.removeItem('viatura-demo-session'); } catch {}
  auth.currentUser = null;
  for (const callback of listeners) callback(null);
}

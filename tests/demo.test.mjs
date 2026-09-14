import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const memory = new Map();
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
const store = await import('../demo/store.mjs');
const { db, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, resetDemo, onSnapshot, STORAGE_KEY } = store;

test('dados fictícios coerentes e datas disponíveis para histórico', async () => {
  resetDemo();
  assert.equal((await getDocs(collection(db, 'viaturas'))).size, 6);
  const operations = await getDocs(collection(db, 'teatro_operacoes'));
  for (const operation of operations.docs) {
    const data = operation.data();
    assert.equal((await getDoc(doc(db, 'viaturas', data.viaturaId))).data().status, 'EM USO');
    assert.equal((await getDoc(doc(db, 'motoristas', data.motorista))).data().tipo, 'OPERACIONAL');
    assert.ok(data.createdAt.toDate() instanceof Date);
  }
});

test('cadastro, edição, consulta, persistência, exclusão e restauração', async () => {
  resetDemo();
  const source = collection(db, 'viaturas');
  const added = await addDoc(source, { nome: 'Teste', status: 'LIVRE', createdAt: store.serverTimestamp() });
  await updateDoc(added, { status: 'BAIXADA' });
  assert.equal((await getDoc(added)).data().status, 'BAIXADA');
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).viaturas[added.id].status, 'BAIXADA');
  const reloaded = await import('../demo/store.mjs?reload-test');
  assert.equal((await reloaded.getDoc(added)).data().status, 'BAIXADA');
  const filtered = await getDocs(query(source, where('status', '==', 'BAIXADA'), orderBy('createdAt', 'desc'), limit(1)));
  assert.equal(filtered.size, 1);
  assert.equal(filtered.docs[0].data().status, 'BAIXADA');
  await deleteDoc(added);
  assert.equal((await getDoc(added)).exists(), false);
  await assert.rejects(updateDoc(added, { status: 'LIVRE' }));
  resetDemo();
  assert.equal((await getDocs(source)).size, 6);
});

test('listeners atualizam telas e permitem cancelamento', async () => {
  resetDemo();
  let count = 0;
  const stop = onSnapshot(collection(db, 'viaturas'), () => count++);
  await new Promise(resolve => setTimeout(resolve, 0));
  await updateDoc(doc(db, 'viaturas', 'v1'), { kmAtual: 12345 });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(count, 2);
  stop();
  resetDemo();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(count, 2);
});

test('falha de armazenamento não confirma alterações perdidas', async () => {
  resetDemo();
  const setItem = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  try {
    await assert.rejects(updateDoc(doc(db, 'viaturas', 'v1'), { nome: 'Não persistido' }));
    assert.equal((await getDoc(doc(db, 'viaturas', 'v1'))).data().nome, 'DEMO-01');
  } finally { localStorage.setItem = setItem; }
});

test('entrada demonstrativa e saída sem autenticação externa', async () => {
  const { auth, signInWithEmailAndPassword, signOut } = await import('../demo/auth.mjs');
  await signInWithEmailAndPassword();
  assert.equal(auth.currentUser.email, 'visitante@example.com');
  await signOut();
  assert.equal(auth.currentUser, null);
});

test('arquivos de execução não carregam Firebase nem configuração de produção', () => {
  for (const file of ['../firebase.js', '../script.js', '../modules/auth.js', '../index.html']) {
    assert.doesNotMatch(readFileSync(new URL(file, import.meta.url), 'utf8'), /gstatic\.com\/firebase|AIza|bopar-sistema|admin@bopar/);
  }
});

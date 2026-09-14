import { resetDemo } from './store.mjs';
new ResizeObserver(([entry]) => {
  document.documentElement.style.setProperty('--demo-banner-height', `${entry.target.offsetHeight}px`);
}).observe(document.querySelector('.demo-banner'));
document.getElementById('resetDemo').addEventListener('click', () => {
  if (!confirm('Restaurar os dados fictícios? As alterações feitas nesta demonstração serão apagadas.')) return;
  try { resetDemo(); location.reload(); }
  catch { alert('Não foi possível gravar no navegador. Verifique as permissões de armazenamento.'); }
});

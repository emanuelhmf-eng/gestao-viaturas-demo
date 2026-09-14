// Todos os nomes, identificadores e locais deste arquivo são fictícios.
export function createSeed() {
  const stamp = (days = 0) => ({ seconds: Math.floor(Date.now() / 1000) - days * 86400, nanoseconds: 0 });
  const viaturas = Object.fromEntries(['LIVRE', 'LIVRE', 'EM USO', 'EM USO', 'MANUTENCAO', 'BAIXADA'].map((status, i) => [`v${i + 1}`, {
    nome: `DEMO-${String(i + 1).padStart(2, '0')}`, placa: `DEM${i + 1}A0${i}`, status,
    kmAtual: 12000 + i * 7500, kmTrocaOleo: 20000 + i * 7500, createdAt: stamp(12),
    motivoBaixa: status === 'BAIXADA' ? 'Avaliação técnica simulada' : ''
  }]));
  const motoristas = Object.fromEntries(['Alex Exemplo', 'Beatriz Modelo', 'Caio Teste', 'Diana Exemplo', 'Eduardo Modelo', 'Flávia Teste', 'Gabriel Exemplo', 'Helena Modelo'].map((nome, i) => [`m${i + 1}`, {
    nome, graduacao: i % 2 ? 'SUPERVISOR' : 'CONDUTOR', matricula: `DEMO-${100 + i}`, pelotao: `Equipe ${i % 3 + 1}`, tipo: 'OPERACIONAL', createdAt: stamp(10)
  }]));
  const teatro_operacoes = Object.fromEntries([3, 4].map((n, i) => [`op${n}`, {
    viaturaId: `v${n}`, nomeViatura: viaturas[`v${n}`].nome, placa: viaturas[`v${n}`].placa,
    motorista: `m${i + 1}`, motoristaNome: motoristas[`m${i + 1}`].nome,
    comandante: `m${i + 3}`, comandanteNome: motoristas[`m${i + 3}`].nome,
    p1: `m${i + 5}`, p1Nome: motoristas[`m${i + 5}`].nome, p2: '', p2Nome: '',
    servico: 'Patrulhamento demonstrativo', area: `Setor fictício ${i + 1}`, contato: 'Não se aplica (demo)', status: 'ATIVA', createdAt: stamp()
  }]));
  return {
    usuarios: { visitante: { nome: 'Visitante Demo', perfil: 'DEMONSTRAÇÃO' } }, viaturas, motoristas, teatro_operacoes,
    manutencoes: { manut1: { viaturaId: 'v5', nomeViatura: 'DEMO-05', placa: viaturas.v5.placa, tipo: 'Preventiva', oficina: 'Oficina Exemplo', status: 'MANUTENCAO', createdAt: stamp(1) } },
    checklists: { check1: { viaturaId: 'v3', nomeViatura: 'DEMO-03', placa: viaturas.v3.placa, motorista: 'm1', motoristaNome: 'Alex Exemplo', servico: 'Patrulhamento demonstrativo', kmInicial: 27000, avarias: 'Sem avarias (simulação)', itens: {}, fotos: [], createdAt: stamp() } },
    historico: Object.fromEntries(['checklist', 'manutencao', 'avaria'].map((tipo, i) => [`h${i}`, { tipo, descricao: `Registro fictício de ${tipo}`, viatura: `DEMO-0${i + 3}`, nomeViatura: `DEMO-0${i + 3}`, placa: viaturas[`v${i + 3}`].placa, motoristaNome: 'Alex Exemplo', oficina: 'Oficina Exemplo', avarias: 'Exemplo demonstrativo', itens: {}, fotos: [], createdAt: stamp(i) }])),
    observacoes_dashboard: { aviso: { texto: 'Bem-vindo! Todos os registros são fictícios. Experimente cadastrar, editar e excluir; depois restaure a demonstração.', autor: 'Equipe Demo', createdAt: stamp(), dataRegistro: new Date().toISOString() } },
    fichas_avaria: { ficha1: { numeroFicha: `DEMO-${new Date().getFullYear()}-0001`, viaturaId: 'v6', viatura: 'DEMO-06', placa: viaturas.v6.placa, modelo: 'Utilitário demonstrativo', km: viaturas.v6.kmAtual, condutor: 'Alex Exemplo', matricula: 'DEMO-100', data: new Date().toISOString().slice(0, 10), hora: '09:00', local: 'Via de treinamento fictícia', bairro: 'Bairro Exemplo', cidade: 'Cidade Modelo', estado: 'CE', descricao: 'Risco superficial simulado para demonstração.', observacoes: 'Registro fictício, sem validade oficial.', createdAt: stamp() } }
  };
}

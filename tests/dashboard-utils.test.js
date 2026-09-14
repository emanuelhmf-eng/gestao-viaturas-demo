import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizarStatusViatura, contarViaturasPorStatus, converterParaData } from '../modules/dashboard-utils.mjs';

test('normaliza status de viaturas com variações comuns', () => {
  assert.equal(normalizarStatusViatura('em uso'), 'EM USO');
  assert.equal(normalizarStatusViatura('manutenção'), 'MANUTENCAO');
  assert.equal(normalizarStatusViatura('BAIXADA'), 'BAIXADA');
  assert.equal(normalizarStatusViatura('dispONÍvel'), 'LIVRE');
});

test('conta viaturas por status usando normalização', () => {
  const totais = contarViaturasPorStatus([
    { status: 'livre' },
    { status: 'EM USO' },
    { status: 'manutenção' },
    { status: 'BAIXADA' },
    { status: 'indefinido' }
  ]);

  assert.deepEqual(totais, {
    livres: 1,
    emUso: 1,
    manutencao: 1,
    baixadas: 1,
    outros: 1
  });
});

test('converte timestamps e datas string para objetos Date', () => {
  const timestamp = {
    toDate: () => new Date('2024-04-01T10:00:00Z')
  };

  assert.equal(converterParaData(timestamp)?.toISOString(), '2024-04-01T10:00:00.000Z');
  assert.equal(converterParaData('2024-04-01T10:00:00Z')?.toISOString(), '2024-04-01T10:00:00.000Z');
});

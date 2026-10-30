// Testes simples: correr com `node testes.js`
const assert = require('assert');
const { MARCAS, MODELOS, EQUIPAMENTOS } = require('./js/dados.js');
const { Inventario } = require('./js/inventario.js');

const inv = new Inventario(MARCAS, MODELOS, EQUIPAMENTOS);
const r = inv.resumo();

assert.strictEqual(r.totalMarcas, 5, '5 marcas');
assert.strictEqual(r.totalModelos, 50, '50 modelos');
assert.strictEqual(r.totalEquipamentos, 200, '200 equipamentos');
assert.strictEqual(new Set(EQUIPAMENTOS.map((e) => e.id)).size, 200, 'IDs únicos');
assert.strictEqual(new Set(EQUIPAMENTOS.map((e) => e.numeroSerie)).size, 200, 'números de série únicos');
assert.strictEqual(new Set(EQUIPAMENTOS.map((e) => e.marca + '|' + e.modelo)).size, 50, 'os 50 modelos têm equipamentos');
MARCAS.forEach((m) => assert.strictEqual(inv.modelosDaMarca(m).length, 10, `10 modelos da ${m}`));

const novo = inv.adicionar({ numeroSerie: 'TESTE001', marca: 'Dell', modelo: 'XPS 13', tipo: 'Portátil', estado: 'Disponível', localizacao: 'Sala 1.01', dataAquisicao: '2026-10-30', preco: '999' });
assert.strictEqual(novo.id, 'EQ201');
assert.throws(() => inv.adicionar({ ...novo, id: undefined }), /número de série/);
assert.throws(() => inv.adicionar({ ...novo, numeroSerie: 'X', modelo: 'iMac 24' }), /não pertence/);

inv.editar('EQ201', { estado: 'Em uso' });
assert.strictEqual(inv.obter('EQ201').estado, 'Em uso');
inv.remover('EQ201');
assert.strictEqual(inv.equipamentos.length, 200);

assert.ok(inv.pesquisar({ marca: 'Apple' }).every((e) => e.marca === 'Apple'));
assert.strictEqual(inv.pesquisar({ marca: 'Apple' }).length, 40);

console.log('Todos os testes passaram.');
console.log(`Marcas: ${r.totalMarcas} | Modelos: ${r.totalModelos} | Equipamentos: ${r.totalEquipamentos}`);
console.log('Por marca:', r.porMarca);
console.log('Por estado:', r.porEstado);

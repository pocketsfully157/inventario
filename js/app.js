// Interface: liga a classe Inventario à página e guarda as alterações no localStorage.

const CHAVE = 'inventario-equipamentos';

function carregar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CHAVE));
    if (Array.isArray(guardado)) return guardado;
  } catch (e) { /* sem dados guardados */ }
  return EQUIPAMENTOS;
}

function guardar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(inv.equipamentos)); } catch (e) { /* ignora */ }
}

let inv = new Inventario(MARCAS, MODELOS, carregar());
let ordem = { campo: 'id', asc: true };
let emEdicao = null;

const $ = (sel) => document.querySelector(sel);
const euro = (v) => v.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const opcoes = (lista, vazio) => (vazio ? `<option value="">${vazio}</option>` : '') + lista.map((v) => `<option>${v}</option>`).join('');

function desenharResumo() {
  const r = inv.resumo();
  const cartoes = [
    ['Marcas', r.totalMarcas],
    ['Modelos', r.totalModelos],
    ['Equipamentos', r.totalEquipamentos],
    ['Valor total', euro(r.valorTotal)],
    ...ESTADOS.map((e) => [e, r.porEstado[e] || 0]),
  ];
  $('#resumo').innerHTML = cartoes.map(([t, v]) => `<div class="cartao"><span>${t}</span><strong>${v}</strong></div>`).join('');
}

function desenharTabela() {
  const filtro = { texto: $('#f-texto').value, marca: $('#f-marca').value, modelo: $('#f-modelo').value, estado: $('#f-estado').value };
  const lista = inv.ordenar(inv.pesquisar(filtro), ordem.campo, ordem.asc);
  $('#contagem').textContent = `${lista.length} de ${inv.equipamentos.length} equipamentos`;
  $('#corpo').innerHTML = lista.map((e) => `
    <tr>
      <td>${e.id}</td><td>${e.numeroSerie}</td><td>${e.marca}</td><td>${e.modelo}</td><td>${e.tipo}</td>
      <td><span class="estado ${e.estado.replace(/\s/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}">${e.estado}</span></td>
      <td>${e.localizacao}</td><td>${e.dataAquisicao}</td><td class="num">${euro(e.preco)}</td>
      <td class="acoes-linha">
        <button data-editar="${e.id}">Editar</button>
        <button data-remover="${e.id}" class="perigo">Remover</button>
      </td>
    </tr>`).join('');
  document.querySelectorAll('th[data-campo]').forEach((th) => {
    th.classList.toggle('ativo', th.dataset.campo === ordem.campo);
    th.dataset.dir = th.dataset.campo === ordem.campo ? (ordem.asc ? '▲' : '▼') : '';
  });
}

function atualizar() {
  desenharResumo();
  desenharTabela();
}

function preencherModelosFiltro() {
  const marca = $('#f-marca').value;
  const modelos = (marca ? inv.modelosDaMarca(marca) : inv.modelos).map((m) => m.nome);
  $('#f-modelo').innerHTML = opcoes(modelos, 'Todos os modelos');
}

// ---------- Formulário ----------

const form = $('#form');

function preencherModelosForm(modeloSelecionado) {
  const modelos = inv.modelosDaMarca(form.marca.value);
  form.modelo.innerHTML = opcoes(modelos.map((m) => m.nome));
  if (modeloSelecionado) form.modelo.value = modeloSelecionado;
  atualizarTipo();
}

function atualizarTipo() {
  const m = inv.modelos.find((x) => x.marca === form.marca.value && x.nome === form.modelo.value);
  form.tipo.value = m ? m.tipo : '';
}

function abrirFormulario(id = null) {
  emEdicao = id;
  form.reset();
  $('#erro').textContent = '';
  $('#dlg-titulo').textContent = id ? `Editar ${id}` : 'Registar equipamento';
  const e = id ? inv.obter(id) : null;
  form.marca.value = e ? e.marca : inv.marcas[0];
  preencherModelosForm(e && e.modelo);
  if (e) {
    ['numeroSerie', 'estado', 'localizacao', 'dataAquisicao', 'preco'].forEach((c) => (form[c].value = e[c]));
  } else {
    form.estado.value = 'Disponível';
    form.dataAquisicao.value = new Date().toISOString().slice(0, 10);
  }
  $('#dlg').showModal();
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const dados = Object.fromEntries(new FormData(form));
  dados.tipo = form.tipo.value;
  try {
    if (emEdicao) inv.editar(emEdicao, dados);
    else inv.adicionar(dados);
    guardar();
    $('#dlg').close();
    atualizar();
  } catch (erro) {
    $('#erro').textContent = erro.message;
  }
});

// ---------- Eventos ----------

form.marca.innerHTML = opcoes(inv.marcas);
form.estado.innerHTML = opcoes(ESTADOS);
form.marca.addEventListener('change', () => preencherModelosForm());
form.modelo.addEventListener('change', atualizarTipo);
$('#btn-cancelar').addEventListener('click', () => $('#dlg').close());
$('#btn-novo').addEventListener('click', () => abrirFormulario());

$('#f-marca').innerHTML = opcoes(inv.marcas, 'Todas as marcas');
$('#f-estado').innerHTML = opcoes(ESTADOS, 'Todos os estados');
preencherModelosFiltro();
$('#f-marca').addEventListener('change', () => { preencherModelosFiltro(); desenharTabela(); });
['#f-modelo', '#f-estado'].forEach((s) => $(s).addEventListener('change', desenharTabela));
$('#f-texto').addEventListener('input', desenharTabela);

document.querySelector('thead').addEventListener('click', (ev) => {
  const campo = ev.target.dataset.campo;
  if (!campo) return;
  ordem = { campo, asc: ordem.campo === campo ? !ordem.asc : true };
  desenharTabela();
});

$('#corpo').addEventListener('click', (ev) => {
  const { editar, remover } = ev.target.dataset;
  if (editar) abrirFormulario(editar);
  if (remover && confirm(`Remover o equipamento ${remover}?`)) {
    inv.remover(remover);
    guardar();
    atualizar();
  }
});

$('#btn-repor').addEventListener('click', () => {
  if (!confirm('Repor os 200 equipamentos iniciais? As alterações feitas serão perdidas.')) return;
  try { localStorage.removeItem(CHAVE); } catch (e) { /* ignora */ }
  inv = new Inventario(MARCAS, MODELOS, EQUIPAMENTOS);
  atualizar();
});

atualizar();

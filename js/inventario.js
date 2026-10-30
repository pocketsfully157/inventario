// Classe Inventario: guarda os equipamentos e oferece as operações de gestão.

const ESTADOS = ['Disponível', 'Em uso', 'Em reparação', 'Abatido'];
const CAMPOS_OBRIGATORIOS = ['numeroSerie', 'marca', 'modelo', 'tipo', 'estado', 'localizacao', 'dataAquisicao', 'preco'];

class Inventario {
  constructor(marcas, modelos, equipamentos = []) {
    this.marcas = [...marcas];
    this.modelos = [...modelos];
    this.equipamentos = equipamentos.map((e) => ({ ...e }));
  }

  // ---------- Registo (CRUD) ----------

  proximoId() {
    const maior = this.equipamentos.reduce((max, e) => Math.max(max, parseInt(e.id.slice(2), 10)), 0);
    return 'EQ' + String(maior + 1).padStart(3, '0');
  }

  validar(dados, idIgnorar = null) {
    for (const campo of CAMPOS_OBRIGATORIOS) {
      if (dados[campo] === undefined || String(dados[campo]).trim() === '') {
        throw new Error(`O campo "${campo}" é obrigatório.`);
      }
    }
    if (!this.marcas.includes(dados.marca)) throw new Error(`Marca desconhecida: ${dados.marca}`);
    if (!this.modelos.some((m) => m.marca === dados.marca && m.nome === dados.modelo)) {
      throw new Error(`O modelo "${dados.modelo}" não pertence à marca ${dados.marca}.`);
    }
    if (!ESTADOS.includes(dados.estado)) throw new Error(`Estado inválido: ${dados.estado}`);
    if (isNaN(Number(dados.preco)) || Number(dados.preco) < 0) throw new Error('O preço tem de ser um número positivo.');
    const repetido = this.equipamentos.find((e) => e.numeroSerie === dados.numeroSerie && e.id !== idIgnorar);
    if (repetido) throw new Error(`Já existe um equipamento com o número de série ${dados.numeroSerie} (${repetido.id}).`);
  }

  adicionar(dados) {
    this.validar(dados);
    const equipamento = { id: this.proximoId(), ...dados, preco: Number(dados.preco) };
    this.equipamentos.push(equipamento);
    return equipamento;
  }

  obter(id) {
    return this.equipamentos.find((e) => e.id === id) || null;
  }

  editar(id, alteracoes) {
    const atual = this.obter(id);
    if (!atual) throw new Error(`Equipamento ${id} não encontrado.`);
    const novo = { ...atual, ...alteracoes, id };
    this.validar(novo, id);
    novo.preco = Number(novo.preco);
    Object.assign(atual, novo);
    return atual;
  }

  remover(id) {
    const indice = this.equipamentos.findIndex((e) => e.id === id);
    if (indice === -1) throw new Error(`Equipamento ${id} não encontrado.`);
    return this.equipamentos.splice(indice, 1)[0];
  }

  // ---------- Consulta ----------

  modelosDaMarca(marca) {
    return this.modelos.filter((m) => m.marca === marca);
  }

  pesquisar({ texto = '', marca = '', modelo = '', estado = '' } = {}) {
    const t = texto.trim().toLowerCase();
    return this.equipamentos.filter((e) =>
      (!marca || e.marca === marca) &&
      (!modelo || e.modelo === modelo) &&
      (!estado || e.estado === estado) &&
      (!t || [e.id, e.numeroSerie, e.modelo, e.localizacao, e.tipo].some((v) => v.toLowerCase().includes(t)))
    );
  }

  ordenar(lista, campo, ascendente = true) {
    return [...lista].sort((a, b) => {
      const r = typeof a[campo] === 'number' ? a[campo] - b[campo] : String(a[campo]).localeCompare(String(b[campo]), 'pt');
      return ascendente ? r : -r;
    });
  }

  // ---------- Estatísticas ----------

  contarPor(campo) {
    return this.equipamentos.reduce((acc, e) => {
      acc[e[campo]] = (acc[e[campo]] || 0) + 1;
      return acc;
    }, {});
  }

  valorTotal() {
    return this.equipamentos.reduce((soma, e) => soma + e.preco, 0);
  }

  resumo() {
    return {
      totalMarcas: this.marcas.length,
      totalModelos: this.modelos.length,
      totalEquipamentos: this.equipamentos.length,
      valorTotal: this.valorTotal(),
      porMarca: this.contarPor('marca'),
      porEstado: this.contarPor('estado'),
    };
  }
}

if (typeof module !== 'undefined') module.exports = { Inventario, ESTADOS };

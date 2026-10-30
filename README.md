# Inventário de Equipamentos

Programa em JavaScript para gerir o inventário de equipamentos informáticos.

## Grupo

- Nome do aluno 1 — Hilcar Mahema
- Nome do aluno 2 — Neily da Barca
- Nome do aluno 3 — Alsacia Langa

## Dados registados

| | Quantidade |
|---|---|
| Marcas | 5 (Dell, HP, Lenovo, Apple, Asus) |
| Modelos | 50 (10 por marca) |
| Equipamentos | 200 (4 por modelo, IDs `EQ001` a `EQ200`) |

Cada equipamento tem: ID, nº de série, marca, modelo, tipo, estado
(Disponível / Em uso / Em reparação / Abatido), localização, data de aquisição e preço.

## Funcionalidades

- Registar, editar e remover equipamentos (com validação: campos obrigatórios,
  modelo tem de pertencer à marca, nº de série único)
- Pesquisar por texto e filtrar por marca, modelo e estado
- Ordenar a tabela clicando nos cabeçalhos
- Resumo com totais por estado e valor total do inventário
- As alterações ficam guardadas no browser (`localStorage`); o botão
  "Repor dados iniciais" volta aos 200 equipamentos originais

## Como executar

Abrir o ficheiro `index.html` no browser (não precisa de instalação).

Para correr os testes (requer Node.js):

```bash
node testes.js
```

## Estrutura

```
index.html        página principal
css/style.css     estilos
js/dados.js       as 5 marcas, 50 modelos e 200 equipamentos
js/inventario.js  classe Inventario (registo, pesquisa, estatísticas)
js/app.js         interface (tabela, filtros, formulário)
testes.js         testes automáticos
```

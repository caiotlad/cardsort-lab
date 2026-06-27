# Diário de sprints

Este arquivo registra as melhorias feitas no CardSort Lab em ciclos pequenos. A ideia é manter um histórico simples para consulta acadêmica e técnica: o que mudou, por quê, como foi validado e qual é o próximo passo.

## Como os sprints serão conduzidos

Cada sprint segue este formato:

1. escolher uma melhoria pequena e útil;
2. implementar no frontend, backend ou documentação;
3. rodar validações proporcionais ao risco;
4. registrar o resultado aqui;
5. criar commit e enviar para o GitHub.

## Sprint 1 — Exportação oficial de dados para pesquisa

Status: concluída  
Início: 27/06/2026  
Foco: facilitar a documentação e recuperação dos dados coletados nos testes.

### Objetivos

- Criar uma trilha documentada de evolução do projeto.
- Permitir que o pesquisador exporte dados diretamente do backend.
- Reduzir dependência de exportações apenas pelo navegador.
- Cobrir o fluxo com teste automatizado.

### Mudanças implementadas

- Criado este diário de sprints.
- Adicionados endpoints autenticados de exportação por estudo:
  - `/api/studies/{id}/exports/summary.csv`
  - `/api/studies/{id}/exports/sessions.csv`
  - `/api/studies/{id}/exports/similarity-matrix.csv`
- As exportações usam CSV com separador `;` e BOM UTF-8, para abrir melhor no Excel em pt-BR.
- O menu de exportação do dashboard agora inclui as exportações oficiais geradas pelo backend.
- O README foi reescrito com acentuação correta e passou a apontar para o diário de sprints.
- O teste integrado principal passou a validar também as exportações.

### Validação planejada

- `npm run build`
- `backend/mvnw.cmd test -q`

### Validação executada

- `npm run build` passou.
- `backend/mvnw.cmd test -q` passou.

### Próximos candidatos

- Adicionar botões no dashboard para baixar as exportações do backend.
- Melhorar a experiência de revisão antes do participante finalizar.
- Criar relatório metodológico simples para apoiar a iniciação científica.

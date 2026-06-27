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

## Sprint 2 — Exportação anonimizada para documentação acadêmica

Status: concluída  
Início: 27/06/2026  
Foco: proteger dados identificáveis dos participantes ao exportar respostas para análise e documentação.

### Objetivos

- Criar uma exportação de sessões sem nome e e-mail dos participantes.
- Substituir identificadores pessoais por códigos estáveis no arquivo exportado.
- Disponibilizar a exportação anonimizada no dashboard.
- Cobrir o endpoint com teste automatizado.

### Mudanças planejadas

- Novo endpoint `/api/studies/{id}/exports/sessions-anonymized.csv`.
- Novo item no menu de exportação do dashboard.
- Documentação no README.

### Mudanças implementadas

- Adicionado endpoint autenticado de sessões anonimizadas.
- Participantes passam a aparecer como `P001`, `P002`, etc. na exportação.
- Nome e e-mail ficam fora do arquivo anonimizado.
- Dashboard recebeu opção “Sessões anonimizadas — CSV”.
- README passou a documentar o novo arquivo.
- Teste integrado valida que o arquivo contém código anônimo e não contém nome/e-mail.

### Validação planejada

- `npm run build`
- `backend/mvnw.cmd test -q`

### Validação executada

- `npm run build` passou.
- `backend/mvnw.cmd test -q` passou.

## Sprint 3 — Relatório metodológico exportável

Status: concluída  
Início: 27/06/2026  
Foco: facilitar a documentação dos testes para uso acadêmico.

### Objetivos

- Gerar um relatório textual do estudo com dados básicos e métricas.
- Incluir observações sobre anonimização e arquivos exportáveis.
- Disponibilizar o relatório no dashboard.
- Cobrir o endpoint com teste automatizado.

### Mudanças planejadas

- Novo endpoint `/api/studies/{id}/exports/report.md`.
- Novo item no menu de exportação do dashboard.
- Documentação no README.

### Mudanças implementadas

- Adicionado relatório em Markdown com visão geral, descrição, instruções, cards, categorias e métricas básicas.
- O relatório inclui nota de privacidade recomendando uso da exportação anonimizada em anexos/análises acadêmicas.
- Dashboard recebeu item “Relatório metodológico — MD”.
- README passou a documentar o novo arquivo.
- Teste integrado valida geração do relatório.

### Validação planejada

- `npm run build`
- `backend/mvnw.cmd test -q`

### Validação executada

- `npm run build` passou.
- `backend/mvnw.cmd test -q` passou.

## Sprint 4 — Polimento de UI/UX e design

Status: concluída  
Início: 27/06/2026  
Foco: reduzir sensação de protótipo e deixar a experiência mais clara para pesquisadores e participantes.

### Objetivos

- Criar uma identidade visual mais consistente.
- Melhorar primeira impressão da tela de login e entrada por código.
- Melhorar navegação e clareza do painel de estudos.
- Melhorar a tela de execução para orientar melhor o participante.
- Manter o produto simples e estável, sem reescrever a aplicação.

### Mudanças planejadas

- Adicionar utilitários visuais globais para cards, botões, superfícies e fundos.
- Reorganizar o login em uma tela com proposta de valor e painel de acesso.
- Melhorar estados vazios e resumo no painel de estudos.
- Dar mais destaque ao progresso da atividade de card sorting.

### Mudanças implementadas

- Criados estilos globais para fundo com gradientes, painéis com efeito glass, cartões suaves, hover e foco acessível.
- AppShell recebeu navegação mais refinada, com blur, logo em gradiente e chip de sessão de participante.
- Tela de login foi redesenhada em duas colunas: proposta de valor à esquerda e painel de acesso à direita.
- Login ganhou cards explicativos do fluxo: criar estudo, aplicar teste e analisar.
- Painel de estudos ganhou cabeçalho mais claro, resumo de métricas e estado vazio com chamada para criar o primeiro estudo.
- Cards de estudo receberam visual mais polido e microinterações de hover.
- Hotfix: data de criação dos cards de estudo passou a ser exibida em formato curto `dd/mm/aaaa`, evitando vazamento do texto para fora do bloco.
- Tela de execução ganhou barra de progresso, visual de cards mais refinado e zonas de drop mais claras.
- Tela de conclusão do participante recebeu acabamento visual mais consistente.

### Validação planejada

- `npm run build`
- `backend/mvnw.cmd test -q`

### Validação executada

- `npm run build` passou.
- `backend/mvnw.cmd test -q` passou.
- Teste integrado passou a validar que a conta demo possui os três estudos preenchidos.

### Validação executada

- `npm run build` passou.
- `backend/mvnw.cmd test -q` passou.
- Foi feita revisão manual de boas práticas React após alterações em múltiplos componentes TSX.

## Sprint 5 — Dados demonstrativos para apresentação

Status: concluída  
Início: 27/06/2026  
Foco: permitir que a conta demo mostre dashboards preenchidos sem depender de coleta real.

### Objetivos

- Criar três estudos demonstrativos na conta `demo@cardsort.local`.
- Cobrir os três tipos de card sorting: aberto, fechado e híbrido.
- Incluir 8 a 10 participantes fictícios por estudo.
- Garantir que os dados sejam criados sem duplicar a cada reinicialização.

### Mudanças implementadas

- O inicializador da conta demo agora também cria estudos de exemplo quando eles ainda não existem.
- Foram adicionados estudos demo de e-commerce, app de saúde e portal acadêmico.
- Cada estudo contém cards, categorias quando aplicável, links/códigos próprios e sessões concluídas fictícias.
- README documenta os exemplos disponíveis na conta demo.

### Validação planejada

- `npm run build`
- `backend/mvnw.cmd test -q`

### Validação executada

- `npm run build` passou.
- `backend/mvnw.cmd test -q` passou.
- A coluna de consentimento foi mantida compatível com bancos locais já existentes.
## Sprint 6 — Consentimento e perfil do participante

Status: em andamento  
Início: 27/06/2026  
Foco: melhorar rigor metodológico para uso em iniciação científica.

### Objetivos

- Exigir aceite de consentimento antes de iniciar uma sessão.
- Coletar metadados simples de perfil do participante.
- Manter esses metadados disponíveis nas exportações anonimizadas.
- Evitar expor nome/e-mail em arquivos de análise acadêmica.

### Mudanças planejadas

- Novos campos persistidos na sessão: consentimento aceito e perfil em JSON.
- Tela inicial do participante com termo simples e campos de perfil.
- API pública de início de sessão atualizada para receber consentimento/perfil.
- Exportação anonimizada com colunas de curso/área, experiência e familiaridade.

### Mudanças implementadas

- Sessões agora registram aceite de consentimento e perfil do participante.
- A API pública bloqueia início de sessão sem consentimento aceito.
- Tela de entrada do participante ganhou termo de consentimento e campos de perfil.
- Exportação anonimizada inclui curso/área, experiência, familiaridade e observações de perfil.
- Dados demonstrativos passaram a incluir perfis fictícios.
- README documenta consentimento, perfil e exportação anonimizada enriquecida.

### Validação planejada

- `npm run build`
- `backend/mvnw.cmd test -q`

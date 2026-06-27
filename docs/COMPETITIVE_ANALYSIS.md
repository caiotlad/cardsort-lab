# Análise comparativa — CardSort Lab vs. ferramentas de card sorting/pesquisa

Data: 27/06/2026  
Objetivo: identificar divergências entre o CardSort Lab e ferramentas consolidadas de card sorting/pesquisa, avaliando o que vale ou não adicionar ao projeto no curto prazo.

## Ferramentas observadas

- Optimal Workshop / OptimalSort
- UXtweak
- Maze
- Lyssna
- Useberry

Observação: algumas páginas comerciais mudam com frequência ou bloqueiam leitura automatizada. A avaliação abaixo usa principalmente páginas oficiais acessíveis e referências metodológicas públicas.

## O que o CardSort Lab já cobre bem

- Card sorting aberto, fechado e híbrido.
- Criação de estudos por pesquisador.
- Execução por link/código.
- Salvamento automático de progresso.
- Revisão antes de finalizar.
- Dashboard com métricas, matriz de similaridade, dendrograma e insights.
- Exportações CSV e relatório metodológico.
- Exportação anonimizada.
- Conta demo com estudos preenchidos.

## Lacunas encontradas

### 1. Gestão de participantes e consentimento

Ferramentas profissionais normalmente tratam melhor recrutamento, convites, triagem e consentimento. Nosso sistema ainda registra nome/e-mail, mas não tem termo de consentimento, perguntas pré-teste ou controle de perfil.

Avaliação: vale adicionar.

Motivo: para iniciação científica, isso é mais importante do que muitas features sofisticadas. Um termo simples de consentimento e perguntas de perfil ajudam na ética, metodologia e documentação.

Prioridade: alta.

Sugestão de escopo pequeno:

- Tela inicial com aceite de consentimento.
- Campos configuráveis de perfil: curso, período, familiaridade com o tema.
- Exportação anonimizada mantendo essas variáveis como metadados.

### 2. Configurações avançadas do estudo

Ferramentas maduras costumam oferecer controle de randomização, limite de participantes, data de encerramento e mensagens customizadas.

Avaliação: vale adicionar parcialmente.

Prioridade: alta/média.

Sugestão de escopo pequeno:

- Embaralhar ordem dos cards para cada participante.
- Limite opcional de participantes.
- Data de encerramento opcional.
- Mensagem final personalizada.

### 3. Pesquisa complementar

Plataformas de pesquisa costumam combinar card sorting com perguntas abertas, escalas e questionários. Nosso sistema hoje coleta apenas o agrupamento.

Avaliação: vale adicionar, mas com escopo simples.

Prioridade: alta para IC.

Sugestão:

- Pergunta pós-teste obrigatória/opcional: “O que foi mais difícil?”
- Escala de dificuldade percebida de 1 a 5.
- Campo de observações do participante.

### 4. Análise por segmentos

Ferramentas profissionais permitem comparar respostas por perfis ou segmentos. Nosso dashboard filtra por participante/data, mas ainda não cruza resultados com perfil.

Avaliação: vale adicionar depois dos metadados de participante.

Prioridade: média.

Sugestão:

- Filtro por campos de perfil.
- Comparação simples entre dois grupos.
- Exemplo: iniciantes vs. experientes.

### 5. Heatmaps e tabelas específicas por tipo

Nosso sistema já tem matriz e dendrograma. Para card sorting fechado/híbrido, faltam visualizações mais específicas: taxa de acerto/aderência por categoria, cartões mais deslocados e confusões entre categorias.

Avaliação: vale adicionar.

Prioridade: média/alta.

Sugestão:

- Heatmap de alocação por categoria.
- Ranking de cards mais ambíguos.
- Percentual de uso de categorias fixas vs. categorias criadas.

### 6. Tree testing

Optimal Workshop e outras plataformas frequentemente combinam card sorting com tree testing para validar a arquitetura proposta depois da organização inicial.

Avaliação: não agora, mas é um ótimo módulo futuro.

Prioridade: baixa/média.

Motivo: é uma funcionalidade grande. Para o projeto atual, vale primeiro tornar o card sorting excelente.

### 7. Recrutamento/painel de participantes

Algumas ferramentas oferecem painel próprio de recrutamento. Nosso sistema não tem isso.

Avaliação: não vale adicionar agora.

Prioridade: baixa.

Motivo: foge do escopo pequeno e pode trazer custo/complexidade. Para pequenos grupos, link direto, sala de aula, WhatsApp/e-mail e planilha de controle resolvem.

### 8. Colaboração entre pesquisadores

Ferramentas profissionais permitem times, permissões, comentários e compartilhamento de resultados.

Avaliação: não agora.

Prioridade: baixa.

Motivo: para um projeto pequeno e individual, isso adiciona complexidade de backend/autorização sem impacto imediato nos testes.

### 9. Exportação PDF sofisticada

Algumas plataformas geram relatórios bonitos. Nosso Markdown + CSV já cobre o essencial, mas PDF visual pode melhorar apresentação.

Avaliação: vale adicionar depois.

Prioridade: média/baixa.

Sugestão:

- Primeiro melhorar o relatório Markdown.
- Depois gerar PDF a partir do relatório, se for útil para banca/orientador.

### 10. Acessibilidade e experiência mobile/tablet

Ferramentas maduras tendem a cuidar melhor de responsividade, acessibilidade e execução em dispositivos variados.

Avaliação: vale adicionar continuamente.

Prioridade: alta.

Sugestão:

- Melhorar execução em tablet.
- Adicionar alternativa sem arrastar-e-soltar, por seleção de categoria.
- Melhorar navegação por teclado.

## Roadmap recomendado

### Próximo ciclo recomendado

Sprint 6 — Consentimento e perfil do participante

- Tela de consentimento antes de iniciar.
- Campos simples de perfil.
- Exportação anonimizada com metadados.

Por que esta é a melhor próxima sprint:

- Ajuda diretamente na iniciação científica.
- Melhora rigor metodológico.
- É pequena o suficiente para implementar sem “explodir” o escopo.

### Depois

Sprint 7 — Configurações do estudo

- Embaralhar cards.
- Limite de participantes.
- Encerramento por data.
- Mensagem final customizada.

Sprint 8 — Perguntas pós-teste

- Dificuldade percebida.
- Comentário aberto.
- Exportação e visualização desses dados.

Sprint 9 — Visualizações por tipo

- Heatmap fechado/híbrido.
- Uso de categorias fixas vs. criadas.
- Ranking de cards ambíguos.

## O que eu não recomendo por enquanto

- Painel próprio de recrutamento.
- Times/permissões multiusuário.
- Tree testing completo.
- Integrações pagas.
- Relatórios PDF sofisticados antes de validar o fluxo principal.

Essas funcionalidades são boas, mas não são o gargalo atual. O mais importante agora é transformar o CardSort Lab em uma ferramenta confiável para coletar, documentar e analisar testes pequenos com rigor acadêmico.

## Fontes consultadas

- Optimal Workshop / OptimalSort: <https://www.optimalworkshop.com/product/card-sorting>
- Lyssna — Card sorting: <https://www.lyssna.com/features/card-sorting/>
- Card sorting — visão geral metodológica: <https://en.wikipedia.org/wiki/Card_sorting>
- Cross-study Reliability of the Open Card Sorting Method: <https://arxiv.org/abs/1903.08644>
- Card Sorting Simulator: Augmenting Design of Logical Information Architectures with Large Language Models: <https://arxiv.org/abs/2505.09478>
- Card Sorting with Fewer Cards and the Same Mental Models?: <https://arxiv.org/abs/2509.03232>

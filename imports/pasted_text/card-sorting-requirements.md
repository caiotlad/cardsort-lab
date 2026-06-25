1) Visão geral do sistema
O sistema deve permitir que um pesquisador:
configure um estudo de card sorting;
aplique o teste em pelo menos um participante;
analise os resultados por meio de dashboards e visualizações estatísticas;
compare os dados conforme o tipo de card sorting selecionado:
aberto
fechado
híbrido

2) Perfis de usuário
2.1 Pesquisador / Administrador
Responsável por criar estudos, definir cards/categorias, acompanhar respostas e analisar resultados.
2.2 Participante
Responsável por executar a atividade de card sorting.

3) Escopo das telas
Tela 1 — Execução do Card Sorting
Essa tela deve ser focada na aplicação do teste. O usuário escolhe previamente o tipo de card sorting e executa a atividade.
3.1 Requisitos funcionais
RF01 — Criar estudo de card sorting
O sistema deve permitir criar um estudo com:
nome do estudo;
descrição/objetivo;
tipo de card sorting;
lista de cards;
categorias, quando aplicável;
instruções ao participante.
RF02 — Selecionar o tipo de card sorting
O sistema deve oferecer os três modos, de forma separada:
Card sorting aberto
Card sorting fechado
Card sorting híbrido
RF03 — Card sorting aberto
No modo aberto:
o participante recebe apenas os cards;
ele deve criar os grupos/categorias livremente;
o sistema deve permitir criar, renomear, excluir e reorganizar grupos.
RF04 — Card sorting fechado
No modo fechado:
as categorias já devem estar definidas pelo pesquisador;
o participante deve apenas alocar os cards nas categorias existentes;
o sistema pode permitir “não sei” ou “outros”, se o pesquisador habilitar.
RF05 — Card sorting híbrido
No modo híbrido:
o sistema deve exibir categorias fixas;
também deve permitir a criação de novas categorias;
o participante pode usar categorias pré-definidas e criar outras quando necessário.
RF06 — Arrastar e soltar
O sistema deve permitir mover cards entre grupos por interface de arrastar e soltar.
RF07 — Salvar progresso
O sistema deve salvar automaticamente o progresso do participante para evitar perda de dados.
RF08 — Revisão antes de enviar
Antes da finalização, o participante deve poder revisar a organização dos cards.
RF09 — Finalizar sessão
Ao concluir, o sistema deve registrar:
distribuição final dos cards;
tempo gasto;
data/hora;
identificador da sessão.
RF10 — Controle de acesso
O sistema deve permitir acesso por link, código ou login, conforme configuração do estudo.

4) Requisitos da interface da Tela 1
Elementos principais
cabeçalho com nome do estudo;
área de instruções;
lista de cards;
área de grupos/categorias;
botões de salvar, desfazer, refazer e finalizar;
indicador de tempo, se habilitado.
Comportamentos esperados
layout simples e responsivo;
suporte a desktop e tablet;
feedback visual ao mover cards;
validação de campos obrigatórios;
prevenção de envio incompleto.

Tela 2 — Dashboard, Insights e Análises Estatísticas
Essa tela deve consolidar os dados do estudo e apresentar análises diferentes conforme o tipo de card sorting selecionado.
4.1 Requisitos funcionais
RF11 — Seleção do estudo
O sistema deve permitir escolher um estudo para análise.
RF12 — Filtro por tipo de card sorting
O dashboard deve mudar automaticamente conforme o tipo:
aberto;
fechado;
híbrido.
RF13 — Visão geral do estudo
O sistema deve exibir indicadores resumidos, como:
número de participantes;
número de cards;
número de categorias;
taxa de conclusão;
tempo médio de execução;
nível de concordância entre participantes.
RF14 — Matriz de similaridade
O sistema deve apresentar uma matriz de similaridade entre os cards, mostrando a frequência com que dois cards foram agrupados juntos.
RF15 — Dendrograma
O sistema deve apresentar dendrogramas para indicar agrupamentos hierárquicos dos cards.
RF16 — Clusterização
O sistema deve mostrar grupos formados automaticamente com base na similaridade das respostas.
RF17 — Visualizações comparativas
O sistema deve permitir comparar resultados:
entre participantes;
entre categorias;
entre diferentes rodadas, se existirem.
RF18 — Insights automáticos
O sistema deve gerar insights textuais, como:
cards com maior ambiguidade;
categorias mais consistentes;
categorias com baixa aderência;
padrões recorrentes de agrupamento.
RF19 — Exportação de relatórios
O sistema deve permitir exportar:
gráfico;
tabela;
relatório em PDF ou CSV/Excel, conforme a necessidade.
RF20 — Filtros avançados
O dashboard deve permitir filtrar por:
estudo;
participante;
faixa de data;
tipo de card sorting;
cards específicos;
categorias específicas.

5) Visualizações esperadas por tipo de card sorting
5.1 Para Card Sorting Aberto
As visualizações devem enfatizar a formação espontânea de grupos.
Visualizações recomendadas
matriz de similaridade;
dendrograma;
mapa de clusters;
nuvem de termos para nomes de categorias criadas;
frequência de agrupamento por card;
distribuição de tamanhos dos grupos.
Insights úteis
quais cards foram mais frequentemente agrupados juntos;
quais grupos emergiram com maior frequência;
quais cards geram mais divergência;
quais nomes de categorias aparecem com mais repetição.

5.2 Para Card Sorting Fechado
As visualizações devem enfatizar aderência às categorias pré-definidas.
Visualizações recomendadas
matriz de similaridade;
heatmap de alocação por categoria;
dendrograma;
gráfico de barras de alocação por categoria;
taxa de concordância por card;
matriz de confusão entre categoria esperada e categoria escolhida.
Insights úteis
cards com maior erro de classificação;
categorias mais claras para os participantes;
categorias que causam confusão;
percentual de concordância por categoria.

5.3 Para Card Sorting Híbrido
As visualizações devem combinar estrutura fixa e criação livre.
Visualizações recomendadas
matriz de similaridade;
dendrograma;
gráfico comparando categorias fixas x categorias criadas;
taxa de uso das categorias pré-definidas;
frequência de criação de novas categorias;
mapa de transição entre categorias fixas e criadas.
Insights úteis
quais categorias fixas foram suficientes;
quando os participantes sentiram necessidade de criar novas categorias;
quais cards escaparam da estrutura esperada;
relação entre organização prevista e organização real.

6) Requisitos não funcionais
RNF01 — Desempenho
O sistema deve carregar dashboards com dados de estudos médios sem travamentos perceptíveis.
RNF02 — Responsividade
A interface deve se adaptar a diferentes resoluções de tela.
RNF03 — Usabilidade
A navegação deve ser clara, com baixo esforço cognitivo para o participante.
RNF04 — Acessibilidade
O sistema deve prever:
contraste adequado;
navegação por teclado;
textos legíveis;
suporte a leitores de tela, quando possível.
RNF05 — Segurança
O sistema deve proteger:
acesso aos estudos;
dados dos participantes;
resultados e relatórios.
RNF06 — Integridade dos dados
As respostas não devem ser perdidas em caso de falha de conexão ou atualização da página.
RNF07 — Escalabilidade
O sistema deve suportar estudos com diferentes quantidades de cards e participantes.

7) Regras de negócio
RB01
Cada sessão deve estar associada a apenas um tipo de card sorting.
RB02
No card sorting fechado, as categorias devem ser definidas antes da execução.
RB03
No card sorting aberto, o participante não pode ser obrigado a usar categorias prévias.
RB04
No card sorting híbrido, deve haver liberdade parcial para criação de categorias.
RB05
Os dados devem ser consolidados apenas após a finalização da sessão.
RB06
As análises devem ser recalculadas sempre que novas respostas forem adicionadas.

8) Estrutura mínima dos dados
Entidades principais
Estudo
Participante
Card
Categoria
Sessão
Agrupamento
Resposta
Métrica
Visualização
Campos importantes
ID do estudo;
tipo de card sorting;
lista de cards;
lista de categorias;
agrupamento por participante;
tempo de execução;
data de submissão;
métricas calculadas.

9) Métricas sugeridas para o dashboard
índice de concordância
similaridade entre cards
frequência de coocorrência
tempo médio por sessão
tamanho médio dos grupos
taxa de uso de categorias
percentual de cards ambíguosel de dispersão dos agrupamentos

10) Entregáveis esperados do sistema
tela de execução do estudo;
tela de análise/dashboards;
matriz de similaridade;
dendrogramas;
gráficos comparativos;
insights automáticos;
exportação de relatórios.




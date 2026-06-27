# CardSort Lab

Aplicação completa para criar, executar e analisar estudos de card sorting aberto, fechado e híbrido.

## Tecnologias

- Frontend: React, TypeScript e Vite
- Backend: Java 17, Spring Boot, Spring Security e JPA
- Banco local: H2 em arquivo
- Banco para produção: PostgreSQL
- Autenticação: senha com BCrypt e sessão JWT em cookie `HttpOnly`

## Rodar no computador

Abra o PowerShell nesta pasta e execute:

```powershell
.\run-local.ps1
```

Depois acesse:

<http://127.0.0.1:8080>

Na primeira utilização, escolha **Criar conta**. Os dados são armazenados em `backend/data`.

Também existe uma conta local de demonstração:

```text
E-mail: demo@cardsort.local
Senha: Demo1234
```

Essa conta pode ser desativada em produção com `DEMO_USER_ENABLED=false`.

## Testar o projeto

```powershell
.\test-project.ps1
```

Esse comando valida o frontend e executa um teste integrado que cobre:

1. cadastro do pesquisador;
2. criação do estudo;
3. abertura de sessão por participante;
4. salvamento e recuperação do rascunho;
5. envio final;
6. consolidação no dashboard;
7. exportação dos dados do estudo.

## Funcionalidades implementadas

- Cadastro, login e logout de pesquisadores.
- Senhas protegidas por BCrypt.
- Criação e exclusão de estudos.
- Card sorting aberto, fechado e híbrido.
- Links privados com token e códigos de participação.
- Arrastar e soltar cards.
- Criação, renomeação e exclusão de grupos quando o tipo permite.
- Desfazer e refazer.
- Revisão obrigatória antes do envio.
- Cronômetro opcional.
- Salvamento automático no servidor e cópia local de segurança.
- Recuperação da sessão após atualizar a página.
- Dashboards, matriz de similaridade, dendrograma e insights.
- Exportações CSV compatíveis com Excel.
- Exportações oficiais pelo backend para resumo, sessões e matriz de similaridade.
- Banco local persistente.

## Exportações de dados

Pesquisadores autenticados podem exportar dados de cada estudo pelos endpoints:

```text
/api/studies/{id}/exports/summary.csv
/api/studies/{id}/exports/sessions.csv
/api/studies/{id}/exports/sessions-anonymized.csv
/api/studies/{id}/exports/similarity-matrix.csv
/api/studies/{id}/exports/report.md
```

Os arquivos usam CSV com separador `;` e codificação UTF-8 com BOM, o que facilita abrir no Excel em português do Brasil.

A exportação anonimizada substitui nome e e-mail por códigos como `P001`, `P002`, etc., mantendo a organização das respostas sem expor dados pessoais dos participantes.

O relatório `report.md` resume o estudo em Markdown, com visão geral, cards, categorias, métricas básicas e observações para documentação acadêmica.

## Diário de sprints

As melhorias iterativas do projeto são documentadas em [SPRINTS.md](./SPRINTS.md).

## Publicação com Docker

```powershell
docker build -t cardsort-lab .
docker run --rm -p 8080:8080 `
  -e JWT_SECRET="troque-por-uma-chave-longa-e-secreta" `
  -e COOKIE_SECURE=false `
  -v cardsort-data:/app/data `
  cardsort-lab
```

Em uma hospedagem com HTTPS, use `COOKIE_SECURE=true`.

Para PostgreSQL, configure:

```text
DATABASE_URL=jdbc:postgresql://servidor:5432/cardsort
DATABASE_USER=usuario
DATABASE_PASSWORD=senha
JWT_SECRET=uma-chave-longa-e-aleatoria
COOKIE_SECURE=true
DEMO_USER_ENABLED=false
```

O `Dockerfile` gera o frontend e o inclui no mesmo aplicativo Spring Boot, simplificando a publicação.

## Publicação inicial na Vercel

Para hospedar o frontend na Vercel e manter temporariamente o backend Java no seu computador via ngrok, siga:

[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

A Vercel precisa da variável:

```text
BACKEND_URL=https://seu-dominio-atribuido.ngrok-free.app
```

O proxy em `api/[...path].mjs` mantém autenticação e chamadas da API no mesmo domínio visível aos participantes.

# Publicar o CardSort Lab na Vercel

Nesta configuração:

- a Vercel hospeda o site React;
- uma Function da Vercel encaminha `/api` ao backend Java;
- inicialmente, o backend Java continua rodando no seu computador pelo ngrok;
- as respostas continuam no banco `backend/data/cardsortlab.mv.db`.

## 1. Preparar o backend

Abra o primeiro PowerShell:

```powershell
$env:DEMO_USER_ENABLED="false"
$env:COOKIE_SECURE="true"
.\run-local.ps1
```

Mantenha essa janela aberta.

Com `COOKIE_SECURE=true`, faça login e administre os estudos pelo endereço HTTPS da Vercel. O login direto em `http://127.0.0.1:8080` pode não manter a sessão enquanto essa opção estiver ativa.

## 2. Expor o backend com ngrok

Depois de instalar e autenticar o ngrok, abra outro PowerShell:

```powershell
ngrok http 8080
```

Copie o endereço HTTPS exibido, semelhante a:

```text
https://exemplo.ngrok-free.app
```

Mantenha também essa janela aberta durante os testes.

## 3. Enviar o projeto à Vercel

A forma mais simples é colocar esta pasta em um repositório privado no GitHub e, no painel da Vercel:

1. Clique em **Add New → Project**.
2. Importe o repositório.
3. Confirme que o framework detectado é **Vite**.
4. Em **Environment Variables**, crie:

```text
BACKEND_URL=https://exemplo.ngrok-free.app
```

Não inclua uma barra `/` no final.

5. Marque a variável para `Production`, `Preview` e `Development`.
6. Clique em **Deploy**.

O arquivo `vercel.json` já configura:

- comando de build;
- pasta `dist`;
- rotas da aplicação React;
- Function que encaminha as chamadas ao Spring Boot.

## 4. Quando o endereço do ngrok mudar

Se o domínio atribuído pelo ngrok mudar:

1. Abra o projeto no painel da Vercel.
2. Vá em **Settings → Environment Variables**.
3. Atualize `BACKEND_URL`.
4. Abra **Deployments** e faça um **Redeploy**.

Com um domínio de desenvolvimento fixo atribuído à conta ngrok, normalmente basta manter o mesmo endereço.

## 5. Durante uma rodada de pesquisa

Antes de enviar o link aos participantes:

1. Ligue o computador à tomada.
2. Desative suspensão automática.
3. Inicie o CardSort Lab.
4. Inicie o ngrok.
5. Confirme o login pelo endereço da Vercel.
6. Faça uma resposta de teste.
7. Envie os links dos estudos aos participantes.
8. Ao terminar, feche o sistema e copie `backend/data` para uma pasta de backup identificada pela data da rodada.

Se o computador, Java, ngrok ou internet forem desligados, o frontend continuará abrindo na Vercel, mas cadastro, login e respostas ficarão indisponíveis até o backend voltar.

## 6. Domínio próprio

Você pode adicionar um domínio próprio em **Settings → Domains** na Vercel. O frontend e os links dos participantes usarão esse domínio normalmente. O backend pode continuar oculto atrás do proxy `/api`.

## 7. Migração futura

Quando quiser deixar o sistema disponível sem manter seu computador ligado:

1. publique o backend Java em Railway, Render ou serviço equivalente;
2. migre o banco H2 para PostgreSQL;
3. altere apenas `BACKEND_URL` na Vercel.

O frontend não precisará ser reescrito.

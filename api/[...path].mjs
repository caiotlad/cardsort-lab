const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export default async function handler(request, response) {
  const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, '');

  if (!backendUrl) {
    response.statusCode = 503;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({
      message: 'O backend ainda não foi configurado. Defina BACKEND_URL na Vercel.',
    }));
    return;
  }

  try {
    const target = new URL(request.url, backendUrl);
    const headers = new Headers();

    for (const [name, value] of Object.entries(request.headers)) {
      const normalizedName = name.toLowerCase();
      if (
        value === undefined ||
        HOP_BY_HOP_HEADERS.has(normalizedName) ||
        normalizedName === 'origin' ||
        normalizedName === 'referer'
      ) continue;
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }

    // Evita a página intermediária do plano gratuito do ngrok nas chamadas da API.
    headers.set('ngrok-skip-browser-warning', 'cardsort-lab');
    headers.set('x-forwarded-host', request.headers.host || '');
    headers.set('x-forwarded-proto', 'https');

    const method = request.method || 'GET';
    const body = method === 'GET' || method === 'HEAD'
      ? undefined
      : await readRequestBody(request);

    const backendResponse = await fetch(target, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

    response.statusCode = backendResponse.status;

    for (const [name, value] of backendResponse.headers.entries()) {
      if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && name.toLowerCase() !== 'set-cookie') {
        response.setHeader(name, value);
      }
    }

    const cookies = backendResponse.headers.getSetCookie?.()
      || (backendResponse.headers.get('set-cookie') ? [backendResponse.headers.get('set-cookie')] : []);
    if (cookies.length > 0) response.setHeader('set-cookie', cookies);

    const payload = Buffer.from(await backendResponse.arrayBuffer());
    response.end(payload);
  } catch (error) {
    console.error('CardSort backend proxy error:', error);
    response.statusCode = 502;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({
      message: 'Não foi possível alcançar o backend. Verifique se o servidor Java e o ngrok estão ativos.',
    }));
  }
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', chunk => chunks.push(Buffer.from(chunk)));
    request.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    request.on('error', reject);
  });
}

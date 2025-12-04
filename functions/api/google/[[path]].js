export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  
  // Cloudflare 会自动读取我们在后台设置的环境变量
  const apiKey = context.env.VITE_GEMINI_API_KEY;

  // 拼接 Google 的真实地址
  const pathString = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const targetUrl = `https://generativelanguage.googleapis.com/${pathString}${url.search}`;

  // 创建新的请求转发给 Google
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  const response = await fetch(newRequest);
  return response;
}
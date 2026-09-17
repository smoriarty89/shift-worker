export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      hasUrl: !!url, 
      hasToken: !!token,
      urlStart: url ? url.substring(0, 20) : 'missing',
      tokenStart: token ? token.substring(0, 10) : 'missing'
    });
  }
}

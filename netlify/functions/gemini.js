const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { prompt } = JSON.parse(event.body || '{}');
  if (!prompt) return { statusCode: 400, body: '프롬프트 없음' };

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) return { statusCode: 500, body: 'API 키 없음' };

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        } catch(e) {
          resolve({ statusCode: 500, body: e.message });
        }
      });
    });
    req.on('error', e => resolve({ statusCode: 500, body: e.message }));
    req.write(body);
    req.end();
  });
};

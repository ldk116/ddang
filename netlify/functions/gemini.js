const https = require('https');

exports.handler = async (event) => {
  console.log('함수 시작', event.httpMethod);
  
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch(e) { return { statusCode: 400, body: '잘못된 요청' }; }

  const { prompt } = body;
  if (!prompt) return { statusCode: 400, body: '프롬프트 없음' };

  const CLAUDE_KEY = process.env.CLAUDE_KEY;
  console.log('키 존재 여부:', !!CLAUDE_KEY, '키 앞 10자:', CLAUDE_KEY ? CLAUDE_KEY.substring(0, 10) : 'none');
  
  if (!CLAUDE_KEY) return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '', error: 'API 키 없음' }) };

  const reqBody = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  console.log('Claude API 호출 시작');

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(reqBody)
      },
      timeout: 25000
    }, (res) => {
      console.log('응답 status:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('응답 data:', data.substring(0, 200));
        try {
          const json = JSON.parse(data);
          const text = json?.content?.[0]?.text || '';
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
        } catch(e) {
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: '', error: data })
          });
        }
      });
    });
    req.on('error', e => {
      console.log('요청 에러:', e.message);
      resolve({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '', error: e.message })
      });
    });
    req.on('timeout', () => {
      console.log('타임아웃');
      req.destroy();
      resolve({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '', error: 'timeout' })
      });
    });
    req.write(reqBody);
    req.end();
  });
};
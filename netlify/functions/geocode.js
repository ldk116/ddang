const https = require('https');

exports.handler = async (event) => {
  const { addr, key } = event.queryStringParameters || {};
  if (!addr || !key) return { statusCode: 400, body: '파라미터 없음' };

  const path = `/req/address?service=address&request=getCoord`
    + `&address=${encodeURIComponent(addr)}`
    + `&type=PARCEL&key=${key}&format=json`;

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.vworld.kr',
      path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: data
          });
        } catch(e) {
          resolve({ statusCode: 500, body: e.message });
        }
      });
    });
    req.on('error', e => resolve({ statusCode: 500, body: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ statusCode: 500, body: 'timeout' }); });
    req.end();
  });
};
const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('JSON 파싱 실패: ' + data)); }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const { keyword, confmKey } = event.queryStringParameters || {};
  if (!keyword || !confmKey) return { statusCode: 400, body: '파라미터 없음' };

  try {
    const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do`
      + `?currentPage=1&countPerPage=1`
      + `&keyword=${encodeURIComponent(keyword)}`
      + `&confmKey=${confmKey}`
      + `&resultType=json`;

    const data = await httpsGet(url);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};

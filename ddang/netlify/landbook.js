exports.handler = async (event) => {
  const { pnu, key } = event.queryStringParameters || {};
  if (!pnu || !key) return { statusCode: 400, body: '파라미터 없음' };

  try {
    const url = `https://api.odcloud.kr/api/15057430/v1/uddi:6a2c7c46-7c44-4a67-b550-ca3688e5f878`
      + `?serviceKey=${key}&pnu=${pnu}&numOfRows=1&pageNo=1`;

    const r = await fetch(url);
    const data = await r.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};

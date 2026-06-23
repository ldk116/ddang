exports.handler = async (event) => {
  const { keyword, confmKey } = event.queryStringParameters || {};
  if (!keyword || !confmKey) return { statusCode: 400, body: '파라미터 없음' };

  try {
    const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do`
      + `?currentPage=1&countPerPage=1`
      + `&keyword=${encodeURIComponent(keyword)}`
      + `&confmKey=${confmKey}`
      + `&resultType=json`;

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

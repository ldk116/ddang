exports.handler = async (event) => {
  const { x, y, key } = event.queryStringParameters || {};
  if (!x || !y || !key) return { statusCode: 400, body: '파라미터 없음' };

  try {
    const url = `https://api.vworld.kr/req/data`
      + `?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN`
      + `&key=${key}`
      + `&geometry=false&attribute=true&page=1&size=1`
      + `&geomFilter=POINT(${x} ${y})`
      + `&crs=EPSG:4326&format=json`;

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

const https = require('https');
https.get('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Props of first feature:', parsed.features[0].properties);
    } catch(e) { console.error('Parse error'); }
  });
});

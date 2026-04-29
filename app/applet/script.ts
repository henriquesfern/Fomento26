import https from 'https';

https.get('https://flagcdn.com/br-sp.svg', (res) => {
  console.log('Status code for flagcdn br-sp:', res.statusCode);
});

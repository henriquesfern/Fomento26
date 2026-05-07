const fs = require('fs');

const file = fs.readFileSync('src/data/fomento2026.ts', 'utf8');

const regex = /,,#ERROR!,/g;
const newFile = file.replace(/,AJUSTEVALORCONCEDENTE,TIPOENTIDADE,/, ',').replace(regex, ',');

fs.writeFileSync('src/data/fomento2026.ts', newFile);

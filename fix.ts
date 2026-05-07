import fs from 'fs';
import Papa from 'papaparse';

const finalCsv = fs.readFileSync('src/data/RelacaoFinalFomento2026.csv', 'utf-8');
const finalRaw = Papa.parse(finalCsv.trim(), { header: true, skipEmptyLines: true, delimiter: ';' }).data;
const finalCnpjs = new Set(finalRaw.map((d: any) => (d.CNPJ || '').replace(/\D/g, '').replace(/^0+/, '')));

function readOldFile(path, varName, delim) {
   let content = fs.readFileSync(path, 'utf8');
   let m = content.match(new RegExp('export const ' + varName + ' = `([\\s\\S]*?)`;'));
   if(!m) m = content.match(new RegExp('export const ' + varName + ' = (.*);', 's'));
   if(m) {
       let str = m[1];
       if(str.startsWith('[') || str.startsWith('"')){
           try { str = JSON.parse(str); } catch(e){}
       }
       if(typeof str === 'string' && str.startsWith('[')) {
           return JSON.parse(str);
       } else if(typeof str === 'object') {
           return str;
       } else {
           return Papa.parse(str.trim(), { header: true, skipEmptyLines: true, delimiter: delim }).data;
       }
   }
   return [];
}

const fomentoRaw = readOldFile('src/data/fomento2026.ts', 'fomento2026CSV', ',');
const anexoRaw = readOldFile('src/data/anexo.ts', 'anexoCSV', ',');
const classRaw = readOldFile('src/data/classificacao_contexto.ts', 'classificacaoContextoCSV', ';');
const fiscalRaw = readOldFile('src/data/fiscal.ts', 'fiscalCSV', ',');

function filterAndSave(path, varName, rawObj, idProp, delim) {
    if(!rawObj || rawObj.length === 0) { console.log('Empty raw for', path); return; }
    
    let filtered = [];
    let seenCnpjs = new Set();
    
    for(const d of rawObj) {
        let cn = d[idProp] || d[idProp.toLowerCase()] || '';
        cn = cn.replace(/\D/g, '').replace(/^0+/, '');
        if(finalCnpjs.has(cn) && !seenCnpjs.has(cn)) {
            filtered.push(d);
            seenCnpjs.add(cn);
        }
    }
    
    console.log(path, 'Filtered to', filtered.length);
    
    let unparsed = Papa.unparse(filtered, { delimiter: delim });
    let finalStr = 'export const ' + varName + ' = `\n' + unparsed.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '\n`;\n';
    fs.writeFileSync(path, finalStr);
    console.log('Saved', path);
}

filterAndSave('src/data/fomento2026.ts', 'fomento2026CSV', fomentoRaw, 'CNPJ', ',');
filterAndSave('src/data/anexo.ts', 'anexoCSV', anexoRaw, 'cnpj', ',');
filterAndSave('src/data/classificacao_contexto.ts', 'classificacaoContextoCSV', classRaw, 'cnpj', ';');
filterAndSave('src/data/fiscal.ts', 'fiscalCSV', fiscalRaw, 'CNPJ', ',');

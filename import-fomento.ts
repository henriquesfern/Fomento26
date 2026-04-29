import fs from 'fs';
import path from 'path';

async function fetchAndSave() {
  const url = 'https://raw.githubusercontent.com/henriquesfern/Fomento26/refs/heads/main/Fomento2025.csv?token=GHSAT0AAAAAAD3X2PZN57KRCVMNB35L722A2PSEE3Q';
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    
    // Save to fomento2025.ts
    const content = `export const fomento2025CSV = \`${text.replace(/`/g, '\\`')}\`;\n`;
    fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'fomento2025.ts'), content, 'utf-8');
    console.log('Successfully saved to src/data/fomento2025.ts');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchAndSave();

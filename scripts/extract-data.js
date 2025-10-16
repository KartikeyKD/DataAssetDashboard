import JSZip from 'jszip';
import fs from 'fs';

async function extractJSON() {
  const zipData = fs.readFileSync('public/data.json.zip');
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipData);
  
  const jsonFile = contents.file('Alation_Analytics_Schema_BusinessEntity.json');
  if (jsonFile) {
    const jsonContent = await jsonFile.async('string');
    fs.writeFileSync('public/data.json', jsonContent);
  }
}

extractJSON();
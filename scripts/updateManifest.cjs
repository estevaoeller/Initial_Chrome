const fs = require('fs');
const { execSync } = require('child_process');

const manifestPath = `${__dirname}/../manifest.json`;
const raw = fs.readFileSync(manifestPath, 'utf8');
const newline = raw.includes('\r\n') ? '\r\n' : '\n';
const manifest = JSON.parse(raw);

// Formatting datetime AAMMDD HHMM
const now = new Date();
const yy = String(now.getFullYear()).slice(-2);
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const hh = String(now.getHours()).padStart(2, '0');
const min = String(now.getMinutes()).padStart(2, '0');

const datetimeStr = `${yy}${mm}${dd} ${hh}${min}`;

// Update Description
const baseDesc = "Uma página inicial personalizada para otimizar o acesso a bookmarks e oferecer uma experiência visual única.";
manifest.description = `${datetimeStr} ${baseDesc}`;

// Bump Patch Version
const parts = manifest.version.split('.');
if (parts.length === 3) {
  parts[2] = parseInt(parts[2], 10) + 1;
  manifest.version = parts.join('.');
}

let output = JSON.stringify(manifest, null, 2);
if (newline === '\r\n') {
  output = output.replace(/\n/g, newline);
}
fs.writeFileSync(manifestPath, output, 'utf8');
console.log(`Manifest updated to version ${manifest.version} with description "${manifest.description}"`);

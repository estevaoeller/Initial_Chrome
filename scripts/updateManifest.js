const fs = require('fs');
const { execSync } = require('child_process');

const manifestPath = `${__dirname}/../manifest.json`;
const raw = fs.readFileSync(manifestPath, 'utf8');
const newline = raw.includes('\r\n') ? '\r\n' : '\n';
const manifest = JSON.parse(raw);

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const timestamp = new Date().toISOString();

manifest.description = `${manifest.description} ${timestamp} ${branch}`;

let output = JSON.stringify(manifest, null, 2);
if (newline === '\r\n') {
  output = output.replace(/\n/g, newline);
}
fs.writeFileSync(manifestPath, output, 'utf8');

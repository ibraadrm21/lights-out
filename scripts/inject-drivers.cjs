const fs = require('fs');

const dataJsPath = 'src/lib/lightsout/data.js';
const allDriversPath = 'src/lib/lightsout/f1-drivers-all.json';

const content = fs.readFileSync(dataJsPath, 'utf8');
const allDrivers = JSON.parse(fs.readFileSync(allDriversPath, 'utf8'));

// Find start of F1_DRIVERS and start of F1_CIRCUITS
const startIndex = content.indexOf('export const F1_DRIVERS = [');
const endIndex = content.indexOf('export const F1_CIRCUITS = [');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers in data.js');
  process.exit(1);
}

const headerPart = content.slice(0, startIndex);
const circuitsPart = content.slice(endIndex);

const driversString = 'export const F1_DRIVERS = ' + JSON.stringify(allDrivers, null, 2) + ';\n\n';

const newContent = headerPart + driversString + circuitsPart;
fs.writeFileSync(dataJsPath, newContent);
console.log('Successfully updated data.js with all', allDrivers.length, 'F1 drivers!');

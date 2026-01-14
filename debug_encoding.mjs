import fs from 'fs';

const configPath = './src/content/config.ts';
const mdPath = './src/content/library/zh/high-output-management.md';

const configContent = fs.readFileSync(configPath, 'utf8');
const mdContent = fs.readFileSync(mdPath, 'utf8');

const configStatusMatch = configContent.match(/status: z\.enum\(\[(.*?)\]\)/);
const mdStatusMatch = mdContent.match(/status: "(.*?)"/);

console.log('Config status part:', configStatusMatch ? configStatusMatch[1] : 'Not found');
console.log('MD status match:', mdStatusMatch ? mdStatusMatch[1] : 'Not found');

if (configStatusMatch && mdStatusMatch) {
    const configKeys = configStatusMatch[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    const mdStatus = mdStatusMatch[1];

    console.log('Config keys:', configKeys);
    console.log('MD status:', mdStatus);

    const qiFromConfig = configKeys.find(k => k.includes('起'));
    const qiFromMd = mdStatus;

    if (qiFromConfig) {
        console.log('Qi in Config (hex):', Buffer.from(qiFromConfig).toString('hex'));
    }
    console.log('Qi in MD (hex):', Buffer.from(qiFromMd).toString('hex'));

    if (qiFromConfig === qiFromMd) {
        console.log('Match: YES');
    } else {
        console.log('Match: NO');
    }
}

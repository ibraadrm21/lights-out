const https = require('https');
const fs = require('fs');
const path = require('path');

const HELMET_FILES = [
  { id: 'verstappen-2021', title: 'File:Max_Verstappen_Integralhelm_2021.png', driver: 'Max Verstappen' },
  { id: 'hamilton-2020', title: 'File:Lewis_Hamilton_Integralhelm_2020.png', driver: 'Lewis Hamilton' },
  { id: 'alonso-2006', title: 'File:Fernando_Alonso_Integralhelm_2006.png', driver: 'Fernando Alonso' },
  { id: 'schumacher-2004', title: 'File:Michael_Schumacher_Integralhelm_2004.png', driver: 'Michael Schumacher' },
  { id: 'senna-1988', title: 'File:Ayrton_Senna_Integralhelm_1988.png', driver: 'Ayrton Senna' },
  { id: 'prost-1989', title: 'File:Alain_Prost_Integralhelm_1989.png', driver: 'Alain Prost' },
  { id: 'vettel-2013', title: 'File:Sebastian_Vettel_Integralhelm_2013.png', driver: 'Sebastian Vettel' },
  { id: 'rosberg-2016', title: 'File:Nico_Rosberg_Integralhelm_2016.png', driver: 'Nico Rosberg' },
  { id: 'button-2009', title: 'File:Jenson_Button_Integralhelm_2009.png', driver: 'Jenson Button' },
  { id: 'ricciardo-2020', title: 'File:Daniel_Ricciardo_Integralhelm_2020.png', driver: 'Daniel Ricciardo' },
  { id: 'massa-2008', title: 'File:Helmet-Felipe-Massa-byRundvald.png', driver: 'Felipe Massa' },
  { id: 'damonhill-1996', title: 'File:Damon_Hill_Integralhelm_1996.png', driver: 'Damon Hill' },
  { id: 'fittipaldi-1974', title: 'File:Emerson_Fittipaldi_Integralhelm_1974.png', driver: 'Emerson Fittipaldi' },
  { id: 'villeneuve-1979', title: 'File:Gilles_Villeneuve_Integralhelm_1979.png', driver: 'Gilles Villeneuve' },
  { id: 'hunt-1976', title: 'File:Helmet-James-Hunt-byRundvald.png', driver: 'James Hunt' },
  { id: 'andretti-1978', title: 'File:Helmet-Mario-Andretti-byRundvald.png', driver: 'Mario Andretti' }
];

function getThumbUrl(title) {
  return new Promise((resolve) => {
    const apiUrl = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';
    https.get(apiUrl, { headers: { 'User-Agent': 'LightsOutF1WikiBot/1.0 (contact@lightsout.f1)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const p = Object.values(json.query.pages)[0];
          resolve(p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'LightsOutF1WikiBot/1.0 (contact@lightsout.f1)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve);
      }
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length > 5000 && buf.slice(0, 4).toString('hex') === '89504e47') {
          fs.writeFileSync(dest, buf);
          console.log('SAVED:', dest, 'bytes:', buf.length);
        } else {
          console.log('FAILED buffer check:', dest, 'status:', res.statusCode, 'len:', buf.length);
        }
        resolve();
      });
    }).on('error', () => resolve());
  });
}

(async () => {
  const dir = path.join('public', 'helmets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const h of HELMET_FILES) {
    const thumbUrl = await getThumbUrl(h.title);
    if (!thumbUrl) {
      console.log('No thumb url for', h.title);
      continue;
    }
    const dest = path.join(dir, h.id + '.png');
    await downloadImage(thumbUrl, dest);
    await new Promise(r => setTimeout(r, 600)); // Respect API limits
  }

  console.log('FINISHED DOWNLOADING REAL TRANSPARENT HELMETS!');
})();

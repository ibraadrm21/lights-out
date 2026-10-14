const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const TEAMS = [
  { id: 'mercedes', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col-retina/image.png', invertDarkToWhite: true },
  { id: 'mclaren', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col-retina/image.png', invertDarkToWhite: true },
  { id: 'ferrari', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false },
  { id: 'redbull', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false },
  { id: 'racingbulls', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false },
  { id: 'alpine', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col-retina/image.png', invertDarkToWhite: true },
  { id: 'haas', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false },
  { id: 'kicksauber', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false },
  { id: 'williams', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false },
  { id: 'astonmartin', url: 'https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col-retina/image.png', invertDarkToWhite: false }
];

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function processTeam(team) {
  return new Promise((resolve) => {
    https.get(team.url, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        let offset = 8;
        let plte, trns, idatChunks = [], w, h;
        while(offset < buf.length) {
          const len = buf.readUInt32BE(offset);
          const type = buf.toString('ascii', offset+4, offset+8);
          if (type === 'IHDR') {
            w = buf.readUInt32BE(offset+8);
            h = buf.readUInt32BE(offset+12);
          }
          if (type === 'PLTE') plte = buf.slice(offset+8, offset+8+len);
          if (type === 'tRNS') trns = buf.slice(offset+8, offset+8+len);
          if (type === 'IDAT') idatChunks.push(buf.slice(offset+8, offset+8+len));
          offset += 12 + len;
        }
        const idat = Buffer.concat(idatChunks);
        const decomp = zlib.inflateSync(idat);

        // Flood fill from corners to remove contiguous white backdrop
        const visited = new Uint8Array(w * h);
        const queue = [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1];
        for (const idx of queue) visited[idx] = 1;

        while (queue.length > 0) {
          const p = queue.pop();
          const px = p % w;
          const py = Math.floor(p / w);

          const neighbors = [
            py > 0 ? (py - 1) * w + px : -1,
            py < h - 1 ? (py + 1) * w + px : -1,
            px > 0 ? py * w + (px - 1) : -1,
            px < w - 1 ? py * w + (px + 1) : -1
          ];

          for (const n of neighbors) {
            if (n >= 0 && !visited[n]) {
              const nx = n % w;
              const ny = Math.floor(n / w);
              const idx = decomp[ny * (w + 1) + 1 + nx];
              const r = plte[idx * 3];
              const g = plte[idx * 3 + 1];
              const b = plte[idx * 3 + 2];
              const origA = (trns && idx < trns.length) ? trns[idx] : 255;

              // White card background or already transparent
              if (origA < 120 || (r >= 220 && g >= 220 && b >= 220)) {
                visited[n] = 1;
                queue.push(n);
              }
            }
          }
        }

        const rowStride = w * 4 + 1;
        const outRaw = Buffer.alloc(rowStride * h);

        for (let y = 0; y < h; y++) {
          outRaw[y * rowStride] = 0;
          for (let x = 0; x < w; x++) {
            const p = y * w + x;
            const idx = decomp[y * (w + 1) + 1 + x];
            let r = plte[idx * 3];
            let g = plte[idx * 3 + 1];
            let b = plte[idx * 3 + 2];
            const origA = (trns && idx < trns.length) ? trns[idx] : 255;

            let a = origA;
            if (visited[p]) {
              a = 0; // Strip white background completely
            } else if (team.invertDarkToWhite && r < 75 && g < 75 && b < 75 && a > 80) {
              // Convert dark foreground icons (Mercedes star, McLaren logo, Alpine A) into clean crisp white for brutalist dark UI
              r = 255;
              g = 255;
              b = 255;
            }

            const outPixel = y * rowStride + 1 + x * 4;
            outRaw[outPixel] = r;
            outRaw[outPixel + 1] = g;
            outRaw[outPixel + 2] = b;
            outRaw[outPixel + 3] = a;
          }
        }

        const compressed = zlib.deflateSync(outRaw);
        const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        const ihdrData = Buffer.alloc(13);
        ihdrData.writeUInt32BE(w, 0);
        ihdrData.writeUInt32BE(h, 4);
        ihdrData[8] = 8;
        ihdrData[9] = 6;
        ihdrData[10] = 0;
        ihdrData[11] = 0;
        ihdrData[12] = 0;

        const ihdr = createChunk('IHDR', ihdrData);
        const idatChunk = createChunk('IDAT', compressed);
        const iend = createChunk('IEND', Buffer.alloc(0));

        const finalPng = Buffer.concat([sig, ihdr, idatChunk, iend]);
        const targetPath = path.join('public', 'logos', team.id + '.png');
        fs.writeFileSync(targetPath, finalPng);
        console.log('Saved transparent logo:', targetPath, 'bytes:', finalPng.length);
        resolve();
      });
    }).on('error', resolve);
  });
}

(async () => {
  for (const t of TEAMS) {
    await processTeam(t);
  }
  console.log('COMPLETED ALL TEAMS');
})();

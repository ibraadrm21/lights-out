import fs from 'fs';

const fixes = {
  spa: { lat: 50.438014, lng: 5.968094, pano: 'CAoSFkNJSE0wb2dLRUlDQWdJQ0VvcE91WGc.', heading: 45 },
  jeddah: { lat: 21.630738, lng: 39.104456, pano: 'CAoSFkNJSE0wb2dLRUlDQWdJRHF5N2FmU3c.', heading: 10 },
  magnycours: { lat: 46.864759, lng: 3.163427, pano: 'p7gCUJlw-lv83DVNDB0ZBg', heading: 180 },
  hungaroring: { lat: 47.582806, lng: 19.250245, pano: 'CAoSFkNJSE0wb2dLRUlDQWdJRGFwSmVmWnc.', heading: 320 },
  shanghai: { lat: 31.339499, lng: 121.221638, pano: 'CAoSHENJQUJJaENYcXNieWNKMjZXZk1HdWhYSFc0TmI.', heading: 270 },
  lusail: { lat: 25.488726, lng: 51.451945, pano: 'CAoSFkNJSE0wb2dLRUlDQWdJREd6TF8tTEE.', heading: 40 }
};

let content = fs.readFileSync('frontend/data.js', 'utf8');

for (const [id, fix] of Object.entries(fixes)) {
  const marker = 'id: "' + id + '"';
  const pos = content.indexOf(marker);
  if (pos !== -1) {
    const svPos = content.indexOf('streetView: {', pos);
    if (svPos !== -1) {
      const svEnd = content.indexOf('},', svPos);
      const oldBlock = content.slice(svPos, svEnd + 2);
      
      const newEmbed = `https://maps.google.com/maps?q=${fix.lat},${fix.lng}&layer=c&cbll=${fix.lat},${fix.lng}&panoid=${fix.pano}&cbp=11,${fix.heading},0,0,0&output=svembed`;
      
      const newBlock = `streetView: {
      lat: ${fix.lat},
      lng: ${fix.lng},
      heading: ${fix.heading},
      pitch: 0,
      panoId: "${fix.pano}",
      embedUrl: "${newEmbed}",
      previewImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
    },`;
      content = content.replace(oldBlock, newBlock);
      console.log('Updated circuit:', id);
    }
  }
}

fs.writeFileSync('frontend/data.js', content, 'utf8');
console.log('Successfully updated data.js with verified panoramic coordinates!');

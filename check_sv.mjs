import fs from 'fs';

const circuits = [
  { id: 'monaco', name: 'Circuit de Monaco', lat: 43.7347, lng: 7.4206 },
  { id: 'spa', name: 'Spa-Francorchamps', lat: 50.4372, lng: 5.9714 },
  { id: 'silverstone', name: 'Silverstone', lat: 52.0786, lng: -1.0169 },
  { id: 'monza', name: 'Monza', lat: 45.6206, lng: 9.2811 },
  { id: 'suzuka', name: 'Suzuka', lat: 34.8431, lng: 136.541 },
  { id: 'interlagos', name: 'Interlagos', lat: -23.7036, lng: -46.6997 },
  { id: 'madrid', name: 'Madrid IFEMA', lat: 40.4637, lng: -3.6169 },
  { id: 'sepang', name: 'Sepang', lat: 2.7606, lng: 101.7374 },
  { id: 'istanbul', name: 'Istanbul Park', lat: 40.9517, lng: 29.405 },
  { id: 'indianapolis', name: 'Indianapolis', lat: 39.795, lng: -86.2348 },
  { id: 'marinabay', name: 'Marina Bay', lat: 1.2913, lng: 103.864 },
  { id: 'valencia', name: 'Valencia', lat: 39.4616, lng: -0.3297 },
  { id: 'nurburgring', name: 'Nürburgring', lat: 50.3341, lng: 6.9427 },
  { id: 'yasmarina', name: 'Yas Marina', lat: 24.4672, lng: 54.6031 },
  { id: 'jeddah', name: 'Jeddah', lat: 21.6319, lng: 39.1044 },
  { id: 'baku', name: 'Baku', lat: 40.3725, lng: 49.8533 },
  { id: 'cota', name: 'COTA', lat: 30.1328, lng: -97.6411 },
  { id: 'bahrain', name: 'Bahrain Sakhir', lat: 26.0325, lng: 50.5106 },
  { id: 'shanghai', name: 'Shanghai', lat: 31.3387, lng: 121.2201 },
  { id: 'melbourne', name: 'Albert Park', lat: -37.8497, lng: 144.968 },
  { id: 'montreal', name: 'Montreal', lat: 45.5003, lng: -73.5228 },
  { id: 'hockenheim', name: 'Hockenheimring', lat: 49.3278, lng: 8.5658 },
  { id: 'magnycours', name: 'Magny-Cours', lat: 46.8642, lng: 3.1636 },
  { id: 'fuji', name: 'Fuji', lat: 35.3719, lng: 138.9269 },
  { id: 'zandvoort', name: 'Zandvoort', lat: 52.3888, lng: 4.5409 },
  { id: 'redbullring', name: 'Red Bull Ring', lat: 47.2197, lng: 14.7647 },
  { id: 'hungaroring', name: 'Hungaroring', lat: 47.583, lng: 19.2486 },
  { id: 'lasvegas', name: 'Las Vegas Strip', lat: 36.1147, lng: -115.1728 },
  { id: 'lusail', name: 'Lusail', lat: 25.49, lng: 51.4542 }
];

async function checkPano() {
  const results = [];
  for (const c of circuits) {
    // Official metadata endpoint used by Street View Client
    const url = `https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1sES!2sES!3m1!1e1!3m17!2m2!1sen!2sUS!9m1!1b1!10m1!1e1!11m1!1e1!12m1!1e1!14m1!1e1!16m1!1e1!17m1!1e1!19m1!1e1!4m5!1e1!1e2!1e3!1e4!1e8!5m2!1e1!1e2!6m3!1s${c.lat}!2s${c.lng}!4f500`;
    try {
      const res = await fetch(url);
      const txt = await res.text();
      // If Street View exists near this point, Google returns array with panorama ID (typically string starting with CAoS or similar)
      const hasPano = txt.includes('[[1,') || txt.includes('\"CAoS') || txt.includes('\"');
      const isEmpty = txt.startsWith(')]}\'\n[null,null,null') || txt.length < 30 || !txt.includes('[[');
      results.push({ id: c.id, name: c.name, hasPano: !isEmpty, len: txt.length });
    } catch(e) {
      results.push({ id: c.id, name: c.name, hasPano: false, error: e.message });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

checkPano();

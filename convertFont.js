const fs = require('fs');
const base64 = fs.readFileSync('./public/THSarabunNew.ttf', 'base64');
console.log(base64);
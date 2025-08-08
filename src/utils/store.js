import fs from 'fs';

const path = './replied.json';
let repliedIds = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : [];

export function isReplied(id) {
  return repliedIds.includes(id);
}

export function saveReplied(id) {
  repliedIds.push(id);
  fs.writeFileSync(path, JSON.stringify(repliedIds));
}

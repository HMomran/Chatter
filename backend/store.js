const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
function createStore(file) {
  let data = { customers: [], messages: [] };
  if (fs.existsSync(file)) data = JSON.parse(fs.readFileSync(file, 'utf8'));
  function save() {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file + '.tmp', JSON.stringify(data, null, 2));
    fs.renameSync(file + '.tmp', file);
  }
  return { data, save, id: randomUUID };
}
module.exports = { createStore };

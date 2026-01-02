const fs = require('fs');
const path = require('path');
const { createId } = require('../../utils/id');
const InvariantError = require('../../exceptions/InvariantError');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  }

  writeFile(file, meta) {
    const ext = path.extname(meta.filename || '');
    const filename = `${createId('cover')}${ext || ''}`;
    const filepath = path.join(this._folder, filename);

    const fileStream = fs.createWriteStream(filepath);
    return new Promise((resolve, reject) => {
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
      file.on('error', (err) => reject(err));
      fileStream.on('error', (err) => reject(err));
    });
  }
}

module.exports = StorageService;

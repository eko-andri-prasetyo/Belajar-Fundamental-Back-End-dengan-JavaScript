const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, CoverHeadersSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
  validateCoverHeaders: (fileHapi) => {
    const headers = fileHapi?.headers;
    const filename = fileHapi?.filename;

    const contentType = headers?.['content-type'];

    // 1) Primary: content-type indicates image
    const headerValidation = CoverHeadersSchema.validate(headers || {});
    if (!headerValidation.error) return;

    // 2) Fallback: some clients send generic content-type for file parts
    // Accept only if filename extension is a known image type.
    const canFallback = !contentType || /^application\/octet-stream/i.test(contentType);
    if (canFallback && typeof filename === 'string') {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.bmp')) {
        return;
      }
    }

    throw new InvariantError('Tipe konten file tidak valid. File harus berupa gambar.');
  },
};

module.exports = AlbumsValidator;

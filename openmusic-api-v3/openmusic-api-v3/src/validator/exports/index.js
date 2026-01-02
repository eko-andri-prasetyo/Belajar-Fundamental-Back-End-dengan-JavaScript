const InvariantError = require('../../exceptions/InvariantError');
const { ExportPlaylistPayloadSchema } = require('./schema');

const ExportsValidator = {
  validateExportPlaylistPayload: (payload) => {
    const { error } = ExportPlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
};

module.exports = ExportsValidator;

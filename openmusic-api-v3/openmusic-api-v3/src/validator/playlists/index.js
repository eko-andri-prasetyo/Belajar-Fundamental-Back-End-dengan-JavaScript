const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, PlaylistSongPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const { error } = PlaylistPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
  validatePlaylistSongPayload: (payload) => {
    const { error } = PlaylistSongPayloadSchema.validate(payload);
    if (error) throw new InvariantError(error.message);
  },
};

module.exports = PlaylistsValidator;

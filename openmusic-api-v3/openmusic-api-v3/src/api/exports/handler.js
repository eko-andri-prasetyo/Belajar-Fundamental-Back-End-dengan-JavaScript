const autoBind = require('auto-bind');
const ProducerService = require('../../services/rabbitmq/ProducerService');

class ExportsHandler {
  constructor({ playlistsService, validator }) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { id: userId } = request.auth.credentials;

    // only owner
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    await ProducerService.sendMessage(JSON.stringify({ playlistId, targetEmail }));

    const response = h.response({ status: 'success', message: 'Permintaan Anda sedang kami proses' });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;

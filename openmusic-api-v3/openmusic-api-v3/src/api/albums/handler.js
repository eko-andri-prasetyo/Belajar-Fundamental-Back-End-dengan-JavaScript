const autoBind = require('auto-bind');
const path = require('path');
const StorageService = require('../../services/storage/StorageService');
const InvariantError = require('../../exceptions/InvariantError');
const config = require('../../utils/config');

class AlbumsHandler {
  constructor({ albumsService, songsService, likesService, cacheService, validator }) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._likesService = likesService;
    this._cacheService = cacheService;
    this._validator = validator;
    this._storageService = new StorageService(path.join(__dirname, '../../../uploads'));

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const albumId = await this._albumsService.addAlbum(request.payload);

    const response = h.response({ status: 'success', data: { albumId } });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();
    return { status: 'success', data: { albums } };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    return { status: 'success', data: { album } };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._albumsService.editAlbumById(id, request.payload);
    return { status: 'success', message: 'Album berhasil diperbarui' };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return { status: 'success', message: 'Album berhasil dihapus' };
  }

  async postCoverHandler(request, h) {
    const { id } = request.params;
    await this._albumsService.verifyAlbumExists(id);

    const { cover } = request.payload;
    if (!cover) throw new InvariantError('cover harus diisi');

    const contentType = cover.hapi.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new InvariantError('Tipe berkas cover tidak valid');
    }

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `${config.storage.baseUrl}/uploads/${filename}`;
    await this._albumsService.setCoverUrl(id, coverUrl);

    const response = h.response({ status: 'success', message: 'Sampul berhasil diunggah' });
    response.code(201);
    return response;
  }

  async postLikeAlbumHandler(request, h) {
  const { id: userId } = request.auth.credentials;
  const { id: albumId } = request.params;

  // JANGAN validasi payload untuk likes (request body kosong)
  await this._albumsService.getAlbumById(albumId);

  await this._likesService.likeAlbum(userId, albumId);
  await this._cacheService.delete(`album-likes:${albumId}`);

  const response = h.response({ status: 'success' });
  response.code(201);
  return response;
}

  async deleteLikeAlbumHandler(request) {
  const { id: userId } = request.auth.credentials;
  const { id: albumId } = request.params;

  await this._albumsService.getAlbumById(albumId);

  await this._likesService.unlikeAlbum(userId, albumId);
  await this._cacheService.delete(`album-likes:${albumId}`);

  return { status: 'success' };
}

  async getAlbumLikesHandler(request, h) {
  const { id: albumId } = request.params;

  const cacheKey = `album-likes:${albumId}`;

  const cached = await this._cacheService.get(cacheKey);
  if (cached !== null && cached !== undefined) {
    const response = h.response({
      status: 'success',
      data: { likes: Number(cached) },
    });
    response.header('X-Data-Source', 'cache');
    return response;
  }

  await this._albumsService.getAlbumById(albumId);

  const likes = await this._likesService.getAlbumLikesCount(albumId);
  await this._cacheService.set(cacheKey, String(likes), 1800);

  return {
      status: 'success',
      data: { likes },
    };
  }
}

module.exports = AlbumsHandler;

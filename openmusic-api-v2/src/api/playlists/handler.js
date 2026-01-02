class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, activitiesService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._activitiesService = activitiesService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: userId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: userId });

    const response = h.response({
      status: 'success',
      data: { playlistId },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(userId);

    return {
      status: 'success',
      data: {
        playlists: playlists.map((p) => ({
          id: p.id,
          name: p.name,
          username: p.username,
        })),
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.deletePlaylist(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.verifySongExists(songId);

    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);

    // log activity (optional criteria)
    if (this._activitiesService) {
      await this._activitiesService.addActivity({
        playlistId,
        songId,
        userId,
        action: 'add',
      });
    }

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const playlist = await this._playlistsService.getPlaylistDetail(playlistId);
    const songs = await this._playlistSongsService.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs: songs.map((s) => ({
            id: s.id,
            title: s.title,
            performer: s.performer,
          })),
        },
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);

    if (this._activitiesService) {
      await this._activitiesService.addActivity({
        playlistId,
        songId,
        userId,
        action: 'delete',
      });
    }

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;

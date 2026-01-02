class PlaylistActivitiesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const activities = await this._activitiesService.getActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities: activities.map((a) => ({
          username: a.username,
          title: a.title,
          action: a.action,
          time: new Date(a.time).toISOString(),
        })),
      },
    };
  }
}

module.exports = PlaylistActivitiesHandler;

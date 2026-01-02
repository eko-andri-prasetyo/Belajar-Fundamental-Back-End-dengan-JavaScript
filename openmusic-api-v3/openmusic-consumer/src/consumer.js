require('dotenv').config();
const amqp = require('amqplib');
const MailerService = require('./MailerService');
const PlaylistsService = require('./PlaylistsService');

const queue = 'export:playlists';

const init = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });

  const mailerService = new MailerService();
  const playlistsService = new PlaylistsService();

  channel.consume(queue, async (msg) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(msg.content.toString());
      const content = await playlistsService.getPlaylistExportData(playlistId);
      await mailerService.sendEmail(targetEmail, content);
      channel.ack(msg);
      // eslint-disable-next-line no-console
      console.log(`Export sent: ${playlistId} -> ${targetEmail}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      channel.nack(msg, false, false);
    }
  }, { noAck: false });

  // eslint-disable-next-line no-console
  console.log('Consumer running...');
};

init();

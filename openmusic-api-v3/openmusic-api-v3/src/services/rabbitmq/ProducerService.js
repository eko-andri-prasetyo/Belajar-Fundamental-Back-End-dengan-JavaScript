const amqp = require('amqplib');
const config = require('../../utils/config');

const ProducerService = {
  sendMessage: async (message) => {
    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();
    await channel.assertQueue(config.rabbitMq.queue, { durable: true });

    channel.sendToQueue(config.rabbitMq.queue, Buffer.from(message), { persistent: true });

    setTimeout(() => {
      connection.close();
    }, 500);
  },
};

module.exports = ProducerService;

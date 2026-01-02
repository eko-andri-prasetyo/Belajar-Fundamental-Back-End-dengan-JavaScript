const nodemailer = require('nodemailer');

class MailerService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }

  async sendEmail(targetEmail, content) {
    await this._transporter.sendMail({
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: 'Ekspor Playlist OpenMusic',
      text: 'Berikut hasil ekspor playlist (JSON terlampir).',
      attachments: [{ filename: 'playlist.json', content: JSON.stringify(content, null, 2), contentType: 'application/json' }],
    });
  }
}

module.exports = MailerService;

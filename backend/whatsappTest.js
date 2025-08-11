const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log("Starting minimal WhatsApp test...");
const client = new Client({ authStrategy: new LocalAuth() });
client.on('qr', qr => {
  console.log('QR event fired!');
  qrcode.generate(qr, { small: true });
});
client.on('ready', () => console.log('WhatsApp client is ready!'));
client.on('authenticated', () => console.log('WhatsApp client authenticated!'));
client.on('auth_failure', msg => console.error('AUTH FAILURE', msg));
client.on('disconnected', reason => console.log('WhatsApp client disconnected:', reason));
client.initialize();

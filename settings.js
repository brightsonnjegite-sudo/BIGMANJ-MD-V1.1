require('dotenv').config();
const settings = require('./settings');

module.exports = {
    // From settings.js
    packname: settings.packname,
    author: settings.author,
    botName: settings.botName,
    botOwner: settings.botOwner,
    ownerNumber: settings.ownerNumber,
    syncTarget: settings.syncTarget,
    syncDelay: settings.syncDelay,
    giphyApiKey: settings.giphyApiKey,
    acrcloud: settings.acrcloud,
    mode: settings.mode,
    telegram: settings.telegram,
    commandMode: settings.commandMode,
    maxStoreMessages: settings.maxStoreMessages,
    storeWriteInterval: settings.storeWriteInterval,
    description: settings.description,
    version: settings.version,
    updateZipUrl: settings.updateZipUrl,
    wm: settings.wm,
    
    // Additional defaults (can be overridden by .env)
    prefix: process.env.PREFIX || '.',
    thumbnail: ['https://files.catbox.moe/x3wl8n.jpg'],
    icon: ['https://files.catbox.moe/x3wl8n.jpg'],
    mp41: 'https://example.com/video.mp4',
    website: 'https://bigmanj.tech',
    tele: 't.me/bigmanj_official',
    ig: '@bigmanj_tech',
    gcbot: 'https://chat.whatsapp.com/...',
    botscript: 'https://github.com/brightsonnjegite-sudo/BIGMANJ-MD-V1.1',
    qris: process.env.QRIS_URL || '',
    dana: process.env.DANA || '',
    gopay: process.env.GOPAY || '',
    ovo: process.env.OVO || ''
};
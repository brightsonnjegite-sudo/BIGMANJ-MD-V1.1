/*
BIGMANj MD V1.1 - Main Entry
© bigmanj tech ™
*/

require('dotenv').config();
const config = require('./config');
Object.assign(global, config);

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, fetchLatestWaWebVersion, jidDecode } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { color } = require('./lib/color');
const { Low, JSONFile } = require('lowdb');

// Database
global.db = new Low(new JSONFile('./data/database.json'));
await global.db.read();
global.db.data = global.db.data || { users: {}, chats: {}, settings: {} };

// Store
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const usePairingCode = true;
const ownerList = JSON.parse(fs.readFileSync('./data/owner.json'));

// Helper
const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(color(text, 'cyan'), (answer) => { rl.close(); resolve(answer); }));
};

// Load commands recursively from ./commands/
const commands = new Map();
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            const cmd = require(fullPath);
            if (cmd.command && Array.isArray(cmd.command)) {
                for (const alias of cmd.command) {
                    commands.set(alias, cmd.handler);
                }
            }
        }
    }
}
loadCommands(path.join(__dirname, 'commands'));

// Process messages
async function processMessage(client, m) {
    const body = m.body || '';
    const pref = global.prefix || '.';
    if (!body.startsWith(pref)) return;
    const cmdName = body.slice(pref.length).trim().split(/ +/).shift().toLowerCase();
    const args = body.slice(pref.length).trim().split(/ +/).slice(1);
    const text = args.join(' ');

    const handler = commands.get(cmdName);
    if (handler) {
        const reply = (txt) => client.sendMessage(m.chat, { text: txt }, { quoted: m });
        const ctx = {
            client, m, args, text, prefix: pref, command: cmdName, reply,
            isGroup: m.isGroup,
            isCreator: ownerList.includes(m.sender) || m.sender === global.ownerNumber + '@s.whatsapp.net',
            pushname: m.pushName || 'User',
            quoted: m.quoted,
            mime: (m.quoted?.msg || m.quoted)?.mimetype || '',
            sleep: (ms) => new Promise(r => setTimeout(r, ms)),
            fetchJson: async (url) => (await require('node-fetch')(url)).json()
        };
        try {
            await handler(m, ctx);
        } catch (err) {
            console.error(err);
            reply('❌ An error occurred.');
        }
    }
}

// Bot start
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestWaWebVersion();
    const client = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ['BIGMANj', 'Chrome', '1.0.0']
    });
    if (usePairingCode && !client.authState.creds.registered) {
        const phone = await question('Enter your WhatsApp number (country code, e.g. 62): ');
        const code = await client.requestPairingCode(phone, 'BIGMANJ');
        console.log(`Pairing code: ${code}`);
    }
    store.bind(client.ev);

    client.ev.on('creds.update', saveCreds);
    client.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = Object.keys(mek.message)[0] === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
        const sender = mek.key.participant || mek.key.remoteJid;
        const isCreator = ownerList.includes(sender) || sender === global.ownerNumber + '@s.whatsapp.net';
        if (!client.public && !mek.key.fromMe && !isCreator && chatUpdate.type === 'notify') return;
        const m = await smsg(client, mek, store);
        await processMessage(client, m);
    });

    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server) ? decode.user + '@' + decode.server : jid;
        } else return jid;
    };
    client.public = true;
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log(chalk.red('Connection closed, restarting...'));
            startBot();
        } else if (connection === 'open') {
            console.log(chalk.green('✅ Bot connected!'));
        }
    });
    return client;
}

async function smsg(conn, m, store) {
    if (!m) return m;
    m.isGroup = m.key.remoteJid.endsWith('@g.us');
    m.sender = m.key.participant || m.key.remoteJid;
    m.mtype = Object.keys(m.message)[0];
    m.msg = m.message[m.mtype];
    m.body = m.msg?.text || m.msg?.caption || '';
    return m;
}

startBot();
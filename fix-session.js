const fs = require('fs');
const path = require('path');

const sessionPath = './session';
if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log('✅ Session folder deleted. Restart the bot to re-authenticate.');
} else {
    console.log('ℹ️ Session folder not found.');
}
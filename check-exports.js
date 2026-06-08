const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.js')) {
            const cmd = require(fullPath);
            if (!cmd.command || !cmd.handler) {
                console.log(`❌ ${fullPath}: missing command or handler`);
            } else {
                console.log(`✅ ${fullPath} -> commands: ${cmd.command.join(', ')}`);
            }
        }
    }
}

walkDir(path.join(__dirname, 'commands'));
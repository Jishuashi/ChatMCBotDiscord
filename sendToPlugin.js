const http = require('http');
const { decrypt } = require('./crypto-utils');

function sendRequestToServer(serverId, encryptedIpMap, payload = {}) {
    const encryptedIp = encryptedIpMap.get(serverId);
    if (!encryptedIp) {
        console.error(`[ERROR] No encrypted IP for server ${serverId}`);
        return;
    }

    const ip = decrypt(encryptedIp);

    const options = {
        hostname: ip,
        port: 4001,
        path: '/mc-endpoint',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log(`[RESP] ${data}`));
    });

    req.on('error', err => console.error(`[ERR] ${err.message}`));
    req.write(JSON.stringify(payload));
    req.end();
}

module.exports = { sendRequestToServer };

const { fork, spawn, exec } = require('child_process');

// 1. Déploiement des commandes
exec('node deploy-commands.js', (err, stdout, stderr) => {
    if (err) {
        console.error('❌ deploy-commands.js failed:\n', stderr);
        return;
    }

    console.log('✅ deploy-commands.js terminé\n');

    // 2. Lancement du bot avec nodemon
    const bot = spawn('npx', ['nodemon', 'index.js'], { stdio: ['inherit', 'pipe', 'pipe', 'ipc'] });

    bot.stdout.on('data', data => process.stdout.write(`[BOT] ${data}`));
    bot.stderr.on('data', data => process.stderr.write(`[BOT][ERR] ${data}`));
});


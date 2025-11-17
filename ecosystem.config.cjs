module.exports = {
  apps: [{
    name: 'capifit',
    script: 'npx',
    args: 'vite preview --port 3000 --host 127.0.0.1',
    cwd: '/var/www/capifit',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      VITE_ALLOWED_HOSTS: 'capifit.app.br,www.capifit.app.br,localhost,127.0.0.1'
    },
    error_file: '/var/log/pm2/capifit-error.log',
    out_file: '/var/log/pm2/capifit-out.log',
    log_file: '/var/log/pm2/capifit-combined.log',
    time: true,
    kill_timeout: 5000
  }]
};
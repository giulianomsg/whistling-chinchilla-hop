module.exports = {
  apps: [{
    name: 'capifit',
    script: 'serve',
    args: '-s dist -l 3000',
    cwd: '/var/www/capifit',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/capifit-error.log',
    out_file: '/var/log/pm2/capifit-out.log',
    log_file: '/var/log/pm2/capifit-combined.log',
    time: true
  }]
};
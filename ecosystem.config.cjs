module.exports = {
  apps: [{
    name: 'capifit',
    script: 'npm',
    args: 'run preview',
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
    time: true,
    kill_timeout: 5000
  }]
};
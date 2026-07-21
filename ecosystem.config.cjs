/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "babelkid",
      cwd: __dirname,
      script: "node_modules/.bin/next",
      args: "start -p 3009",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: "3009",
      },
    },
  ],
};

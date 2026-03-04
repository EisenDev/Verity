module.exports = {
    apps: [
        {
            name: "verity",
            script: "node",
            args: "--import tsx server/index.ts",
            cwd: "/home/azureuser/Verity",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                PORT: 3000
            }
        }
    ]
};

module.exports = {
    apps: [
        {
            name: "verity",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};

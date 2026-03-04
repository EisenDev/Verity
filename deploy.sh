#!/bin/bash
# VERITY - Azure Linux VM Deployment Script
# Run this script after SSH-ing into your VM

set -e
echo "=========================================="
echo " VERITY Sovereign Engine - VM Deployment"
echo "=========================================="

# 1. Update system
echo "[1/8] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Node.js 24
echo "[2/8] Installing Node.js 24..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager to keep app alive 24/7)
echo "[3/8] Installing PM2..."
sudo npm install -g pm2

# 4. Install Nginx (reverse proxy for port 80/443)
echo "[4/8] Installing Nginx..."
sudo apt-get install -y nginx

# 5. Clone the repository
echo "[5/8] Cloning VERITY repository..."
cd /home/azureuser
if [ -d "Verity" ]; then
  echo "Repository already exists. Pulling latest..."
  cd Verity
  git pull origin main
else
  git clone https://github.com/EisenDev/Verity.git
  cd Verity
fi

# 6. Install dependencies and build
echo "[6/8] Installing dependencies & building..."
npm install
npm run build

# 7. Configure Nginx
echo "[7/8] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/verity > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/verity /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

# 8. Start the app with PM2
echo "[8/8] Starting VERITY with PM2..."
pm2 delete verity 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u azureuser --hp /home/azureuser

echo ""
echo "=========================================="
echo " VERITY is LIVE! "
echo "=========================================="
echo " Visit: http://$(curl -s ifconfig.me)"
echo "=========================================="

# CapiFit - Plataforma de Fitness e Nutrição

Sua plataforma completa para fitness e nutrição. Conecte-se com profissionais e alcance seus objetivos de saúde.

## 🚀 Guia de Instalação - Ubuntu 24.04.3

Este guia passo a passo irá ajudá-lo a instalar e configurar a aplicação CapiFit no seu servidor Ubuntu 24.04.3.

## 📋 Pré-requisitos

### Sistema Operacional
- Ubuntu 24.04.3 LTS ou superior
- Acesso SSH com usuário sudo
- Mínimo 2GB RAM, 2 CPU cores

### Software Necessário
```bash
# Verifique se você tem os seguintes comandos disponíveis:
node --version  # v18+ ou v20+
npm --version   # v9+
git --version   # v2+
```

## 🛠️ Passo 1: Atualizar o Sistema

```bash
# Conecte-se via SSH ao seu servidor
ssh usuario@seu-servidor-ip

# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale dependências essenciais
sudo apt install -y curl wget git unzip
```

## 📦 Passo 2: Instalar Node.js (Recomendado: v20)

```bash
# Instalar Node.js v20 usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 🔧 Passo 3: Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

## 🌐 Passo 4: Instalar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

## 📁 Passo 5: Clonar o Projeto

```bash
# Criar diretório para aplicação
sudo mkdir -p /var/www/capifit
sudo chown $USER:$USER /var/www/capifit

# Navegar para o diretório
cd /var/www/capifit

# Clonar o repositório (substitua pela URL do seu repositório)
git clone https://github.com/seu-usuario/capifit.git .

# Ou se tiver o código localmente, copie os arquivos para o servidor
# scp -r ./capifit/* usuario@seu-servidor-ip:/var/www/capifit/
```

## 🔑 Passo 6: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cd /var/www/capifit
nano .env
```

Adicione as seguintes variáveis (substitua pelos seus valores):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Application Configuration
VITE_APP_NAME=CapiFit
VITE_APP_URL=https://seu-dominio.com

# Development
VITE_DEV_MODE=false
```

**Importante:** Obtenha essas credenciais no seu painel do Supabase:
1. Acesse https://supabase.com
2. Selecione seu projeto
3. Vá para Settings > API
4. Copie a URL e a chave anon

## 📦 Passo 7: Instalar Dependências e Construir

```bash
# Instalar dependências
cd /var/www/capifit
npm install

# Construir aplicação para produção
npm run build

# Verificar se a pasta dist foi criada
ls -la dist/
```

## 🔥 Passo 8: Configurar PM2

```bash
# O arquivo ecosystem.config.cjs já está na raiz do projeto
# Verifique se ele existe:
ls -la ecosystem.config.cjs

# Criar diretório de logs
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Iniciar aplicação com PM2 (usando .cjs para ES modules)
pm2 start ecosystem.config.cjs

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## 🌐 Passo 9: Configurar Nginx

```bash
# Criar arquivo de configuração do site
sudo nano /etc/nginx/sites-available/capifit
```

Adicione o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # SSL Configuration (será configurado no próximo passo)
    # ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy para a aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Arquivos estáticos (se necessário)
    location /static/ {
        alias /var/www/capifit/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

```bash
# Habilitar o site
sudo ln -s /etc/nginx/sites-available/capifit /etc/nginx/sites-enabled/

# Remover site default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Passo 10: Configurar SSL com Let's Encrypt (Opcional, mas Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

## 🔍 Passo 11: Verificar Instalação

```bash
# Verificar status da aplicação
pm2 status
pm2 logs capifit

# Verificar se a aplicação está respondendo
curl http://localhost:3000

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🌐 Acessar a Aplicação

Agora você pode acessar sua aplicação em:
- **HTTP:** http://seu-dominio.com
- **HTTPS:** https://seu-dominio.com (se configurou SSL)

## 🛠️ Comandos Úteis PM2

```bash
# Verificar status
pm2 status

# Verificar logs
pm2 logs capifit

# Reiniciar aplicação
pm2 restart capifit

# Parar aplicação
pm2 stop capifit

# Remover aplicação
pm2 delete capifit

# Monitorar em tempo real
pm2 monit

# Recarregar sem downtime
pm2 reload capifit
```

## 🔄 Atualizar a Aplicação

```bash
# 1. Fazer backup da versão atual
cd /var/www/capifit
pm2 stop capifit
cp -r . ../capifit-backup-$(date +%Y%m%d)

# 2. Atualizar código
git pull origin main

# 3. Instalar novas dependências (se houver)
npm install

# 4. Construir nova versão
npm run build

# 5. Reiniciar aplicação
pm2 start ecosystem.config.cjs
```

## 🐛 Troubleshooting

### Problema: Aplicação não inicia
```bash
# Verificar logs
pm2 logs capifit

# Verificar se a porta 3000 está em uso
sudo netstat -tlnp | grep :3000

# Matar processo na porta 3000 (se necessário)
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Problema: Nginx não funciona
```bash
# Verificar configuração
sudo nginx -t

# Verificar status
sudo systemctl status nginx

# Verificar logs
sudo journalctl -u nginx
```

### Problema: Erro de permissão
```bash
# Corrigir permissões do diretório
sudo chown -R $USER:$USER /var/www/capifit
sudo chmod -R 755 /var/www/capifit
```

### Problema: Cache do navegador
```bash
# Limpar build e reconstruir
rm -rf dist node_modules/.vite
npm run build
```

### Problema: Erro "module is not defined in ES module scope"
```bash
# Este erro ocorre quando usa .js em projeto ES Module
# Use sempre .cjs para arquivos de configuração do PM2
pm2 start ecosystem.config.cjs  # CORRETO
# pm2 start ecosystem.config.js  # ERRADO
```

## 📊 Monitoramento

```bash
# Instalar monitoramento básico
sudo apt install -y htop

# Monitorar uso de recursos
htop

# Monitorar PM2
pm2 monit

# Verificar uso de disco
df -h

# Verificar uso de memória
free -h
```

## 🔐 Segurança Adicional

```bash
# Configurar firewall (UFW)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status

# Fail2Ban para proteção contra brute force
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📱 Variáveis de Ambiente do Supabase

Certifique-se de configurar corretamente as variáveis do Supabase no arquivo `.env`:

```env
# Desenvolvimento
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sua-chave-local

# Produção
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-de-producao
```

## 🚀 Deploy Automatizado (Opcional)

Para deploy automatizado, você pode criar um script:

```bash
# Criar script de deploy
nano /var/www/capifit/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/capifit
echo "Iniciando deploy..."

# Parar aplicação
pm2 stop capifit

# Backup
cp -r dist ../dist-backup-$(date +%Y%m%d)

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Construir
npm run build

# Iniciar aplicação
pm2 start ecosystem.config.cjs

echo "Deploy concluído!"
```

```bash
# Tornar executável
chmod +x /var/www/capifit/deploy.sh

# Executar deploy
./deploy.sh
```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs em `/var/log/pm2/` e `/var/log/nginx/`
2. Use os comandos de troubleshooting acima
3. Verifique se todas as variáveis de ambiente estão configuradas corretamente
4. Confirme se o Supabase está acessível e configurado corretamente

---

**Parabéns!** Sua aplicação CapiFit agora está rodando no seu servidor Ubuntu 24.04.3! 🎉
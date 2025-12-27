# Implementação do Proxy VPS

Para contornar o bloqueio de IP do FatSecret, criamos um serviço de Proxy. Siga os passos abaixo para colocar no ar.

## 1. Na sua VPS (Ubuntu)

1.  Crie uma pasta para o projeto e suba o conteúdo da pasta `fatsecret-proxy` que está na raiz do projeto.
2.  Instale as dependências:
    ```bash
    cd fatsecret-proxy
    npm install
    # Instale o PM2 se não tiver
    npm install -g pm2
    ```
3.  Configure o `.env` (Crie baseado no `.env.example`):
    ```env
    PORT=3001
    FATSECRET_CLIENT_ID=seu_client_id_aqui
    FATSECRET_CLIENT_SECRET=seu_client_secret_aqui
    PROXY_SECRET=crie_uma_senha_forte_aqui
    ```
4.  Rode o serviço:
    ```bash
    pm2 start index.js --name "fatsecret-proxy"
    pm2 save
    ```
    *Se já estiver rodando, reinicie:*
    ```bash
    pm2 restart fatsecret-proxy
    ```
5.  Certifique-se que a porta 3001 (ou a que escolheu) está liberada no Firewall ou configure um Nginx Reverso se preferir usar HTTPS/dominio.

## 2. No Dashboard do Supabase

Vá em **Settings > Edge Functions** (ou Secrets) e adicione as seguintes variáveis:

*   `VPS_PROXY_URL`: `http://SEU_IP_DA_VPS:3001` (ou seu dominio com https)
*   `PROXY_SECRET`: A mesma senha que você colocou no `.env` da VPS.

*Nota: Você pode remover as chaves `FATSECRET_CLIENT_ID` e `FATSECRET_CLIENT_SECRET` do Supabase se quiser, pois agora elas ficam apenas na VPS.*

## 3. Deploy das Funções

Agora faça o deploy das funções atualizadas:

```bash
npx supabase functions deploy search-foods
npx supabase functions deploy import-food
```

-- Adicionar colunas WhatsApp e Telegram na tabela client_details
ALTER TABLE public.client_details 
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS telegram text;

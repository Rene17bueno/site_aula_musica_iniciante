# Webhook de Envio Automatico WhatsApp

Este webhook recebe o POST do painel admin e envia mensagem pelo WhatsApp Cloud API, sem precisar clicar no botao de envio do WhatsApp Web.

## 1) Criar App no Meta for Developers

1. Acesse https://developers.facebook.com/
2. Crie um app.
3. Adicione o produto `WhatsApp`.
4. Gere:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_PERMANENT_TOKEN`

## 2) Rodar localmente

```bash
cd whatsapp-webhook
npm install
cp .env.example .env
# edite o .env
npm start
```

Teste de saude:

```bash
curl http://localhost:3000/health
```

## 3) Deploy no Render (recomendado)

1. Suba esta pasta no GitHub (ja incluso neste repositorio).
2. No Render, crie um `Web Service` apontando para a pasta `whatsapp-webhook`.
3. Start command: `npm start`
4. Configure variaveis de ambiente:
   - `WEBHOOK_KEY`
   - `ALLOWED_ORIGIN` (ex.: https://rene17bueno.github.io)
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_PERMANENT_TOKEN`

URL final esperada:

```txt
https://SEU-WEBHOOK-RENDER.onrender.com/send-class-notice
```

## 4) Ligar no front-end

Edite:
- `js/js/community/admin-main.js`

Preencha:
- `WHATSAPP_AUTOMATION_WEBHOOK`
- `WHATSAPP_AUTOMATION_KEY`

## 5) Payload recebido

```json
{
  "to": "5544991379447",
  "message": "Comunicado de Aula...",
  "classDate": "2026-07-28",
  "weekday": "Terca-feira",
  "hasClass": true,
  "note": "Aula confirmada",
  "sentByUid": "..."
}
```

## Observacao importante

O envio 100% automatico depende da API oficial do WhatsApp (Meta). O `wa.me` sozinho sempre exige acao manual do usuario.

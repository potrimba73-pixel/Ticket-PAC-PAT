# 🎫 PAC Bot Tickets

Bot Discord dedicado ao sistema de tickets e recrutamento da **Portugal Alfa Community**.

## Funcionalidades

- 🎫 Sistema de tickets (Bugs, Denúncias, Suporte, Criador de Conteúdo)
- 📝 Sistema de recrutamento PAT
- 📋 Painel de regras com aceitação automática
- ✅ Assumir ticket com 1 clique
- 🛡️ Painel de chamada de voz
- ⭐ Avaliação por estrelas via DM
- 📄 Transcript HTML automático
- 🚛 Fluxo de recrutamento com verificação Trucky

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `TOKEN` | Token do bot Discord | ✅ |
| `CLIENT_ID` | ID da aplicação Discord | ✅ |
| `MONGODB_URI` | URI do MongoDB (opcional) | ❌ |
| `PORT` | Porta do servidor web | ❌ |

## Deploy no Render

- **Build Command:** `npm install`
- **Start Command:** `npm start`

## Comandos

- `/painelmembro` — Abre painel do membro no ticket
- `/transcript` — Gera transcript HTML (Staff)

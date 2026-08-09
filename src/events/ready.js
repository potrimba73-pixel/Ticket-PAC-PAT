import { CONFIG } from "../config/index.js";
import { db, saveDB } from "../utils/db.js";
import { sendPainelGeral, sendPainelRecrutamento, sendPainelRegras } from "../services/panels.js";

export async function handleReady(client) {
  console.log(`[Tickets Ready] 🤖 Bot Tickets online: ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'Tickets | Portugal Alfa Community', type: 0 }],
    status: 'online',
  });

  // === LIMPEZA DE TICKETS FANTASMAS ===
  console.log("[Tickets Ready] A iniciar limpeza de tickets fantasmas...");
  await limparTicketsFantasma(client);

  // === AUTO-SETUP DOS PAINÉIS ===
  if (!db.painelsHash) db.painelsHash = {};

  const guild = await client.guilds.fetch(CONFIG.GUILD_ID).catch(() => null);
  if (!guild) {
    console.warn("[Tickets Ready] Servidor principal não encontrado.");
    return;
  }

  await new Promise(r => setTimeout(r, 3000));

  await setupPainel(client, guild, "geral", CONFIG.CANAL_TICKETS_GERAL, sendPainelGeral);
  await setupPainel(client, guild, "recrutamento", CONFIG.CANAL_TICKETS_RECRUTAMENTO, sendPainelRecrutamento);
  await setupPainel(client, guild, "regras", CONFIG.CANAL_REGRAS, sendPainelRegras);

  console.log("[Tickets Ready] ✅ Setup de painéis concluído!");
}

async function limparTicketsFantasma(client) {
  if (!db.tickets) {
    console.log("[Tickets Limpeza] Sem tickets na DB.");
    return;
  }

  let limpos = 0;
  for (const [ticketId, ticket] of Object.entries(db.tickets)) {
    if (ticket.closed) continue;
    const channel = await client.channels.fetch(ticket.channelId).catch(() => null);
    if (!channel) {
      console.log(`[Tickets Limpeza] Ticket fantasma: ${ticketId} (canal ${ticket.channelId} não existe)`);
      ticket.closed = true;
      ticket.closedAt = new Date().toISOString();
      ticket.closedBy = "system";
      ticket.closedByName = "Limpeza Automática";
      limpos++;
    }
  }
  if (limpos > 0) {
    await saveDB();
    console.log(`[Tickets Limpeza] ✅ ${limpos} tickets fantasmas limpos.`);
  }
}

async function setupPainel(client, guild, key, canalId, sendFn) {
  try {
    const channel = await client.channels.fetch(canalId).catch(() => null);
    if (!channel) {
      console.warn(`[Tickets Ready] Canal ${key} não encontrado: ${canalId}`);
      return;
    }

    let painelExistente = null;

    const painelData = db.painelsHash?.[key];
    if (painelData?.messageId) {
      try {
        const msg = await channel.messages.fetch(painelData.messageId);
        if (msg && msg.author.id === client.user.id) {
          painelExistente = msg;
          console.log(`[Tickets Ready] Painel ${key} encontrado via DB (ID: ${msg.id}). Não reenviado.`);
        }
      } catch (e) {
        console.log(`[Tickets Ready] Painel ${key} na DB não encontrado no Discord.`);
      }
    }

    if (!painelExistente) {
      try {
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages.filter(m => m.author.id === client.user.id);
        if (botMessages.size > 0) {
          painelExistente = botMessages.first();
          console.log(`[Tickets Ready] Painel ${key} encontrado via scan (ID: ${painelExistente.id}). Não reenviado.`);

          db.painelsHash[key] = {
            messageId: painelExistente.id,
            sentAt: new Date().toISOString(),
          };
          await saveDB();
        }
      } catch (e) {
        console.log(`[Tickets Ready] Erro ao procurar painel ${key} no canal:`, e.message);
      }
    }

    if (painelExistente) return;

    console.log(`[Tickets Ready] Painel ${key} NÃO encontrado. Enviando novo...`);

    const msg = await sendFn(channel);

    db.painelsHash[key] = {
      messageId: msg.id,
      sentAt: new Date().toISOString(),
    };
    await saveDB();

    console.log(`[Tickets Ready] Painel ${key} enviado! ID: ${msg.id}`);

  } catch (err) {
    console.error(`[Tickets Ready] Erro ao enviar painel ${key}:`, err.message);
  }
}

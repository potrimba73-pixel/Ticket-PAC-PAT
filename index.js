import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
} from "discord.js";
import http from 'node:http';
import { db, connectDB } from "./src/utils/db.js";
import { handleReady } from "./src/events/ready.js";
import { handleGuildMemberAdd } from "./src/events/guildMemberAdd.js";
import { handleGuildMemberRemove } from "./src/events/guildMemberRemove.js";
import { handleInteractionCreate } from "./src/events/interactionCreate.js";

// ==================== VALIDAR ENV VARS ====================
const requiredEnv = ["TOKEN", "CLIENT_ID"];
const missing = requiredEnv.filter(e => !process.env[e]);
if (missing.length > 0) {
  console.error("[Tickets] Variaveis em falta:", missing.join(", "));
  process.exit(1);
}

// ==================== CLIENT SETUP ====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
  sweepers: {
    messages: {
      interval: 300,
      lifetime: 1800,
    },
  },
});

// ==================== CONNECT DATABASE ====================
connectDB().catch(err => console.error("[Tickets DB] Erro ao conectar:", err));

// ==================== EVENTS ====================
client.once(Events.ClientReady, () => handleReady(client));

client.on(Events.GuildMemberAdd, (member) => handleGuildMemberAdd(member, client));

client.on(Events.GuildMemberRemove, (member) => handleGuildMemberRemove(member, client));

client.on(Events.InteractionCreate, (interaction) => handleInteractionCreate(interaction, client));

// ==================== ERROR HANDLING ====================
client.on(Events.Error, (error) => {
  console.error("[Tickets] Erro do cliente Discord:", error);
});

process.on('unhandledRejection', (error) => {
  console.error("[Tickets] Unhandled Rejection:", error);
});

process.on('uncaughtException', (error) => {
  console.error("[Tickets] Uncaught Exception:", error);
});

// ==================== WEB SERVER (RENDER) ====================
http.createServer((req, res) => {
  const ticketsAbertos = Object.values(db.tickets || {}).filter(t => !t.closed).length;
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("PAC Bot Tickets Online!\n");
  res.write("Uptime: " + Math.floor(process.uptime()) + "s\n");
  res.write("Tickets abertos: " + ticketsAbertos + "\n");
  res.end();
}).listen(process.env.PORT || 3000);

// ==================== LOGIN ====================
client.login(process.env.TOKEN);

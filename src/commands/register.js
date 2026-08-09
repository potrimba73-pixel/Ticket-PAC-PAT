import {
  REST, Routes, SlashCommandBuilder, PermissionFlagsBits,
} from "discord.js";
import { CONFIG } from "../config/index.js";

export async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("painelmembro")
      .setDescription("Abre o painel do membro para chamar staff específica")
      .setDefaultMemberPermissions(null)
      .toJSON(),
    new SlashCommandBuilder()
      .setName("transcript")
      .setDescription("Gera um transcript completo do canal atual (HTML) - Apenas Staff")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(CONFIG.TOKEN);

  try {
    console.log("[Tickets Register] A registar comandos de barra...");

    await rest.put(
      Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
      { body: commands },
    );
    console.log("[Tickets Register] Comandos registados no servidor principal!");

    if (CONFIG.GUILD_ID_RECRUTAMENTO && CONFIG.GUILD_ID_RECRUTAMENTO !== "undefined" && CONFIG.GUILD_ID_RECRUTAMENTO !== "" && CONFIG.GUILD_ID_RECRUTAMENTO !== CONFIG.GUILD_ID) {
      try {
        await rest.put(
          Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID_RECRUTAMENTO),
          { body: commands },
        );
        console.log("[Tickets Register] Comandos registados no servidor de recrutamento!");
      } catch (recError) {
        console.warn("[Tickets Register] Nao foi possivel registar comandos no servidor de recrutamento:", recError.message);
      }
    }
  } catch (error) {
    console.error("[Tickets Register] Erro ao registar comandos:", error);
  }
}

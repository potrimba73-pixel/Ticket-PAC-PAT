export async function safeDeferReply(interaction, options = { flags: 64 }) {
  try {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply(options);
      return true;
    }
    return false;
  } catch (error) {
    if (error.code === 10062 || error.message?.includes("Unknown interaction")) {
      console.log("[Tickets] Interacao expirada (10062), ignorando...");
      return false;
    }
    console.error("[Tickets] Erro no deferReply:", error);
    return false;
  }
}

export async function safeEditReply(interaction, options) {
  try {
    if (interaction.deferred && !interaction.replied) {
      return await interaction.editReply(options);
    } else if (interaction.replied) {
      try {
        return await interaction.editReply(options);
      } catch {
        return await interaction.followUp(options);
      }
    }
    return await interaction.reply(options);
  } catch (error) {
    if (error.code === 10062 || error.message?.includes("Unknown interaction")) {
      console.log("[Tickets] Interacao expirada no editReply, ignorando...");
      return null;
    }
    if (error.message?.includes("already been sent") || error.message?.includes("already replied")) {
      try {
        return await interaction.followUp(options);
      } catch (e) {
        console.error("[Tickets] Erro no followUp fallback:", e);
        return null;
      }
    }
    console.error("[Tickets] Erro no editReply:", error);
    return null;
  }
}

export async function handleGuildMemberRemove(member, client) {
  // Bot de tickets: log simples no console
  console.log(`[Tickets] Membro saiu: ${member.user.tag} (${member.id})`);
}

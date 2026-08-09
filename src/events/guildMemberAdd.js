export async function handleGuildMemberAdd(member, client) {
  // Bot de tickets: log simples no console
  console.log(`[Tickets] Novo membro: ${member.user.tag} (${member.id})`);
}

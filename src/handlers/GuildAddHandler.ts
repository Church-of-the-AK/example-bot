import { CommandoGuild } from 'discord.js-commando'
import { createUser, getUser, createGuild, getGuild } from '../util'

export async function handleGuildAdd (guild: CommandoGuild) {
  console.log(`Joined guild ${guild.name} (${guild.id})`)

  guild.members.forEach(async member => {
    if (member.user.bot) {
      return
    }

    const user = await getUser(member.id)

    if (user) {
      return
    }

    await createUser(member.user)
  })

  const apiGuild = await getGuild(guild.id)

  if (!apiGuild) {
    await createGuild(guild)
  }
}

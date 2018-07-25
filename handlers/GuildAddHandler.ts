import { CommandoGuild } from 'discord.js-commando'
import { createUser, getUser } from '../util'

export async function handleGuildAdd (guild: CommandoGuild) {
  console.log(`Joined guild ${guild.name} (${guild.id})`)

  guild.members.forEach(async member => {
    if (await getUser(member.id) === '') {
      return
    }

    await createUser(member.user)
  })
}

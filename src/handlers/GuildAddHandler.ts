import { CommandoGuild } from 'discord.js-commando'
import { createUser, getUser, createGuild } from '../util'
import axiosInit from 'axios'
import * as https from 'https'

const axios = axiosInit.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

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

  await createGuild(guild)
}

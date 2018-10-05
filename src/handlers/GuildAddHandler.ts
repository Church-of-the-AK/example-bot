import { CommandoGuild } from 'discord.js-commando'
import { createUser, getUser } from '../util'
import { Guild, GuildSettings } from 'machobot-database'
import { api } from '../config'
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

  const apiGuild = new Guild()

  apiGuild.id = guild.id
  apiGuild.name = guild.name
  apiGuild.banned = false
  apiGuild.settings = new GuildSettings()

  await axios.post(`${api.url}/guilds&code=${api.code}`, apiGuild).catch(error => {
    console.log(error)
  })
}

import { User as APIUser, GuildSettings, Guild as APIGuild, MusicPlaylist } from 'machobot-database'
import axios from 'axios'
import { api } from '../config'
import { User, Guild } from 'discord.js'

/**
  * Creates a user using MachoAPI.
  * @param user The discord.js user used to create the user.
  */
export async function createUser (user: User) {
  console.log(`Creating user ${user.username} (${user.id})...`)

  const newUser = new APIUser()
  newUser.id = user.id
  newUser.name = user.username
  newUser.avatarUrl = user.displayAvatarURL({ size: 512 })
  newUser.banned = false
  newUser.accessToken = ''
  newUser.admin = false

  const response = await axios.post(`${api.url}/users&code=${api.code}`, newUser).catch(error => {
    console.log(error)
  })

  console.log(response ? `Created user ${user.username}` : `Failed to create user ${user.username}`)
}

export async function getUser (id: string) {
  const { data: user }: { data: APIUser | '' } = await axios.get(`${api.url}/users/${id}`).catch(error => {
    console.log(error)

    const response: { data: '' } = { data: '' }
    return response
  })

  return user
}

export async function getGuildSettings (id: string) {
  const { data: guild }: { data: APIGuild | '' } = await axios.get(`${api.url}/guilds/${id}`).catch(error => {
    console.log(error)

    const response: { data: '' } = { data: '' }
    return response
  })

  return guild ? guild.settings : ''
}

export async function getGuild (id: string) {
  const { data: guild }: { data: Guild | '' } = await axios.get(`${api.url}/guilds/${id}`).catch(error => {
    console.log(error)

    const response: { data: '' } = { data: '' }
    return response
  })

  return guild
}

export async function createGuild (guild: Guild): Promise<APIGuild> {
  const apiGuild = new APIGuild()

  apiGuild.id = guild.id
  apiGuild.name = guild.name
  apiGuild.banned = false
  apiGuild.settings = new GuildSettings()

  const response = await axios.post(`${api.url}/guilds&code=${api.code}`, apiGuild).catch(error => {
    console.log(error)
  })

  console.log(response ? `Created guild ${guild.name}` : `Failed to create guild ${guild.name}`)

  return response ? response.data : null
}

export async function createPlaylist (name: string, user: APIUser) {
  const playlist = new MusicPlaylist()

  playlist.name = name
  playlist.user = user
  playlist.songs = []

  const response = await axios.post(`${api.url}/music/playlist&code=${api.code}`, playlist).catch(error => {
    console.log(error)
  })

  console.log(response ? `Created playlist ${playlist.name}` : `Failed to create playlist ${playlist.name} for ${playlist.user.name}`)

  return response ? response.data : null
}

export async function deletePlaylist (name: string, user: APIUser) {
 // TODO: Add delete playlist function
}

export async function getPlaylist (name: string, userId: string) {
  // TODO: Add get playlist function
}

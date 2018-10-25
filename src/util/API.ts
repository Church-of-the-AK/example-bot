import { User as APIUser, GuildSettings, Guild as APIGuild, MusicPlaylist, MusicSong } from 'machobot-database'
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
  const playlist = await getPlaylist(name, user)

  if (!playlist) {
    return { error: 'Playlist doesn\'t exist' }
  }

  const response = await axios.delete(`${api.url}/music/playlist/${playlist.id}&code=${api.code}`).catch(error => {
    console.log(error)
  })

  console.log(response ? `Deleted playlist ${playlist.name}` : `Failed to delete playlist ${playlist.name} for ${playlist.user.name}`)

  return response ? response.data : null
}

export async function getPlaylist (name: string, user: APIUser) {
  const { data: playlist }: { data: MusicPlaylist | '' } = await axios.get(`${api.url}/search/playlists?userId=${user.id}&query=${name}`).catch(error => {
    console.log(error)

    const response: { data: '' } = { data: '' }
    return response
  })

  return playlist
}

export async function createSong (url: string, title: string, id: string) {
  const song = new MusicSong()

  song.title = title
  song.url = url
  song.id = id

  const response = await axios.post(`${api.url}/music/song&code=${api.code}`, song).catch(error => {
    console.log(error)
  })

  console.log(response ? `Created song ${song.title}` : `Failed to create song ${song.title}`)

  return response ? response.data : null
}

export async function getSong (id: string) {
  const { data: song }: { data: MusicSong | '' } = await axios.get(`${api.url}/music/song/${id}`).catch(error => {
    console.log(error)

    const response: { data: '' } = { data: '' }
    return response
  })

  return song
}

export async function removeSong (playlist: MusicPlaylist, song: MusicSong) {
  const index = playlist.songs.findIndex(song1 => song1.id === song.id)

  if (index < 0) {
    return { error: 'That song isn\'t in that playlist.' }
  }

  playlist.songs.splice(index, 1)

  const response = await axios.put(`${api.url}/music/playlist/${playlist.id}`, playlist).catch(error => {
    console.log(error)
  })

  console.log(response ? `Removed song ${song.title} from playlist ${playlist.name}` : `Failed to remove song ${song.title} from playlist ${playlist.name}`)

  return response ? response.data : null
}

export async function addSong (playlist: MusicPlaylist, song: MusicSong) {
  const exists = playlist.songs.find(song1 => song1.id === song.id)

  if (exists) {
    return { error: 'That song already exists in that playlist.' }
  }

  playlist.songs.push(song)

  const response = await axios.put(`${api.url}/music/playlist/${playlist.id}`, playlist).catch(error => {
    console.log(error)
  })

  console.log(response ? `Added song ${song.title} to playlist ${playlist.name}` : `Failed to add song ${song.title} to playlist ${playlist.name}`)

  return response ? response.data : null
}

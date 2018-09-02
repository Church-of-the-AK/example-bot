import { User as APIUser } from 'machobot-database'
import axios from 'axios'
import { api } from '../config'
import { User } from 'discord.js'

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

  return axios.post(`${api.url}/users&code=${api.code}`, newUser)
}

export async function getUser (id: string) {
  const { data: user }: { data: APIUser | '' } = await axios.get(`${api.url}/users/${id}`)

  return user
}

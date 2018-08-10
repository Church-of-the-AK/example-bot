import { User as APIUser } from 'machobot-database'
import axios from 'axios'
import { code } from '../config'
import { User } from 'discord.js'

/**
  * Creates a user using MachoAPI.
  * @param msg The message used to create the user.
  */
export async function createUser (user: User) {
  console.log(`Creating user ${user.username} (${user.id})...`)
  const apiUser = {
    id: user.id,
    name: user.username,
    avatarUrl: user.displayAvatarURL({ size: 512 }),
    banned: false,
    dateCreated: new Date().getTime(),
    dateLastMessage: new Date().getTime(),
    steamId: '',
    level: {
      xp: `0`,
      level: `0`,
      timestamp: ''
    },
    balance: {
      networth: `0`,
      balance: `0`,
      dateclaimeddailies: ''
    },
    accesstoken: null,
    admin: false
  }

  const newUser = new APIUser()
  newUser.id = user.id
  newUser.name = user.username
  newUser.avatarUrl = user.displayAvatarURL({ size: 512 })
  newUser.banned = false
  newUser.accessToken = ''
  newUser.admin = false

  return axios.post(`http://localhost:8000/users&code=${code}`, newUser)
}

export async function getUser (id: string) {
  const { data: user }: { data: APIUser | '' } = await axios.get(`http://localhost:8000/users/${id}`)

  return user
}

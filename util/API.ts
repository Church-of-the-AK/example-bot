import { MachoAPIUser } from '../types/MachoAPIUser'
import axios from 'axios'
import { code } from '../config'
import { User } from 'discord.js'

/**
  * Creates a user using MachoAPI.
  * @param msg The message used to create the user.
  */
export async function createUser (user: User) {
  console.log(`Creating user ${user.username} (${user.id})...`)
  const apiUser: MachoAPIUser = {
    id: user.id,
    name: user.username,
    avatarurl: user.displayAvatarURL({ size: 512 }),
    banned: false,
    datecreated: `${new Date().getTime()}`,
    datelastmessage: `${new Date().getTime()}`,
    steamid: '',
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

  return axios.post(`http://localhost:8000/users&code=${code}`, apiUser)
}

export async function getUser (id: string) {
  const { data: user }: { data: MachoAPIUser | '' } = await axios.get(`http://localhost:8000/users/${id}`)

  return user
}

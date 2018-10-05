import { User as APIUser } from 'machobot-database'
import axiosInit from 'axios'
import { api } from '../config'
import { User } from 'discord.js'
import * as https from 'https'

const axios = axiosInit.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

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

import { CommandMessage } from "discord.js-commando";
import { MachoAPIUser } from "../types/MachoAPIUser";
import axios from 'axios'
import { code } from "../config";

/**
  * Creates a user using MachoAPI.
  * @param msg The message used to create the user.
  */
export async function createUser(msg: CommandMessage) {
  console.log(`Creating user ${msg.author.username} (${msg.author.id})...`)
  const user: MachoAPIUser = {
    id: msg.author.id,
    name: msg.author.username,
    avatarurl: msg.author.displayAvatarURL({ size: 512 }),
    banned: false,
    datecreated: `${new Date().getTime()}`,
    datelastmessage: `${new Date().getTime()}`,
    steamid: "",
    level: {
      xp: `0`,
      level: `0`,
      timestamp: ""
    },
    balance: {
      networth: `0`,
      balance: `0`,
      dateclaimeddailies: ""
    },
    accesstoken: null
  }

  await axios.post(`http://localhost:8000/users&code=${code}`, user)
  console.log('Created user.')
}

export async function getUser(id: string) {
  const { data: user }: { data: MachoAPIUser | '' } = await axios.get(`http://localhost:8000/users/${id}`)

  return user
}

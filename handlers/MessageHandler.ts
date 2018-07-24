import axios from 'axios'
import { CommandMessage } from "discord.js-commando";
import { code } from '../config'
import { TextChannel } from 'discord.js'
import { MachoAPIUser } from '../types/MachoAPIUser'
import * as API from '../util'

/**
 * Handles a message sent by a user. If that user is a bot, it does nothing.
 * 
 * If that message isn't in a `TextChannel`, it does nothing.
 * 
 * If that message is in `#accept-rules`, it deletes it.
 * 
 * Otherwise, it either creates or edits a user in the database to add or remove xp/level up/edit avatar.
 * 
 * @param msg The message to handle.
 */
export async function handleMessage(msg: CommandMessage) {
  if (msg.author.bot) {
    return false
  }

  if (!(msg.channel instanceof TextChannel)) {
    return false
  }

  if (msg.channel.name === 'accept-rules' && msg.command.name !== 'accept') {
    if (!(msg.member.hasPermission("MANAGE_MESSAGES"))) {
      return msg.delete()
    }
  }

  const { data: user } = await axios.get(`http://localhost:8000/users/${msg.author.id}`)

  if (user === '[]' || user === '' || user === "Error") {
    await API.createUser(msg)
  } else {
    await handleUserMessage(msg)
  }
}

/**
  * Handles a user's message as explained in `function handleMessage`.
  * @param msg The message to handle.
  */
async function handleUserMessage(msg: CommandMessage): Promise<MachoAPIUser> {
  let { data: user }: { data: MachoAPIUser } = await axios.get(`http://localhost:8000/users/${msg.author.id}`)

  user = handleUserExp(user, msg)
  user.datelastmessage = `${new Date().getTime()}`
  user.avatarurl = msg.author.avatarURL()

  await axios.put(`http://localhost:8000/users/${msg.author.id}&code=${code}`, user)
  return user
}

/**
 * Checks if a user should gain xp/level up, and makes that happen.
 * @param user The MachoAPI user to handle the xp of.
 * @param msg The message to handle.
 */
function handleUserExp(user: MachoAPIUser, msg: CommandMessage) {
  let diffMins
  if (user.level.timestamp) {
    const diffMs = (new Date().getTime() - parseInt(user.level.timestamp))
    diffMins = ((diffMs % 86400000) % 3600000) / 60000
  } else {
    diffMins = 2
  }

  if (diffMins >= 1) {
    user.level.timestamp = `${new Date().getTime()}`
    user.level.xp = `${parseInt(user.level.xp) + randomIntFromInterval(15, 25)}`

    if (parseInt(user.level.xp) >= expToLevelUp(parseInt(user.level.level))) {
      const creditsEarned = randomIntFromInterval(45, 50) + Math.floor(parseInt(user.level.level) * 0.5)

      user.level.xp = `${parseInt(user.level.xp) - expToLevelUp(parseInt(user.level.level))}`
      user.level.level = `${parseInt(user.level.level) + 1}`
      user.balance.balance = `${parseInt(user.balance.balance) + creditsEarned}`
      user.balance.networth = `${parseInt(user.balance.networth) + creditsEarned}`
      msg.channel.send(`Congrats **${user.name}**! You have reached level **${user.level.level}** and earned **${creditsEarned}** credits!`)
    }
  }

  return user
}

function expToLevelUp(level: number): number {
  return 5 * level * level + 50 * level + 100
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

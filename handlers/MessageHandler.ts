import * as request from 'request'
import { code } from '../config'
import { Message, TextChannel } from 'discord.js'
import { MachoAPIUser } from '../types/MachoAPIUser'

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
export function handleMessage(msg: Message) {
  if (msg.author.bot) {
    return false
  }
  if (!(msg.channel instanceof TextChannel)) {
    return false
  }
  if (msg.channel.name == 'accept-rules' && msg.content != '/accept') {
    if (!(msg.member.hasPermission("MANAGE_MESSAGES"))) {
      return msg.delete()
    }
  }
  request
    .get(`http://localhost:8000/users/${msg.author.id}`, function optionalCallback(err, httpResponse, body) {
      if (body === '[]' || body === '' || body === "Error") {
        createUser(msg)
      } else {
        handleUserMessage(msg)
      }
    })
}

/**
 * Creates a user using MachoAPI.
 * @param msg The message used to create the user.
 */
function createUser(msg: Message) {
  const user: MachoAPIUser = {
    id: msg.author.id,
    name: msg.author.username,
    avatarurl: `${msg.author.displayAvatarURL + '?size=512'}`,
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

  let options = {
    method: 'POST',
    url: `http://localhost:8000/users&code=${code}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: user
  }

  request(options, function (error, response, body) {
    if (error) throw new Error(error)
  })
}

/**
 * Checks if a user should gain xp/level up, and makes that happen.
 * @param user The MachoAPI user to handle the xp of.
 * @param msg The message to handle.
 */
function handleUserExp(user: MachoAPIUser, msg: Message) {
  let diffMins
  if (user.level.timestamp) {
    let diffMs = (new Date().getTime() - parseInt(user.level.timestamp))
    diffMins = ((diffMs % 86400000) % 3600000) / 60000
  } else {
    diffMins = 2
  }
  if (diffMins >= 1) {
    user.level.timestamp = `${new Date().getTime()}`
    user.level.xp = `${parseInt(user.level.xp) + randomIntFromInterval(15, 25)}`
    if (parseInt(user.level.xp) >= expToLevelUp(parseInt(user.level.level))) {
      let creditsEarned = randomIntFromInterval(45, 50) + Math.floor(parseInt(user.level.level) * 0.5)
      user.level.xp = `${parseInt(user.level.xp) - expToLevelUp(parseInt(user.level.level))}`
      user.level.level = `${parseInt(user.level.level) + 1}`
      user.balance.balance = `${parseInt(user.balance.balance) + creditsEarned}`
      user.balance.networth = `${parseInt(user.balance.networth) + creditsEarned}`
      msg.channel.send(`Congrats **${user.name}**! You have reached level **${user.level.level}** and earned **${creditsEarned}** credits!`)
    }
  }
  return user
}

/**
 * Handles a user's message as explained in `function handleMessage`.
 * @param msg The message to handle.
 */
function handleUserMessage(msg: Message) {
  request.get(`http://localhost:8000/users/${msg.author.id}`, function (error, response, body) {
    if (error) return console.log(error)
    let user: MachoAPIUser = JSON.parse(body)
    user = handleUserExp(user, msg)
    user.datelastmessage = `${new Date().getTime()}`
    user.avatarurl = msg.author.avatarURL

    let options = {
      method: 'PUT',
      url: `http://localhost:8000/users/${msg.author.id}&code=${code}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: user
    }

    request(options, function (error, response, body) {
      if (error) throw new Error(error)
    })
  })
}

function expToLevelUp(level: number): number {
  return 5 * level * level + 50 * level + 100
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

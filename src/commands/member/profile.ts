import { CommandMessage } from 'discord.js-commando'
import * as Canvas from 'canvas'
import { Message, MessageAttachment, User } from 'discord.js'
import { MachoCommand } from '../../types'
import { getUser } from '../../util'
import { expToLevelUp } from '../../handlers'
import { User as ApiUser } from 'machobot-database'

export default class ProfileCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'profile',
      aliases: [],
      group: 'member',
      memberName: 'profile',
      description: 'Sends an image containing your profile information.',
      details: 'Sends an image containing your profile information.',
      examples: [ 'profile' ],
      guildOnly: false,
      throttling: {
        duration: 20,
        usages: 1
      },

      args: [{
        key: 'user',
        label: 'user',
        prompt: '',
        type: 'user',
        default: -1
      }]
    })
  }

  async run (msg: CommandMessage, { disUser }: { disUser: User | -1 }): Promise<Message | Message[]> {
    let user: ApiUser | ''

    if (disUser !== -1) {
      user = await getUser(disUser.id)
    } else {
      user = await getUser(msg.author.id)
    }

    if (!user) {
      return msg.channel.send('I don\'t seem to have you in my database. Please try again.')
    }

    msg.channel.startTyping()

    const canvas = Canvas.createCanvas(700, 250)
    const ctx = canvas.getContext('2d')
    const background = await Canvas.loadImage('images/background.jpeg').catch(error => console.log(error))
    const avatar = await Canvas.loadImage(msg.author.displayAvatarURL({ format: 'png' })).catch(error => console.log(error))
    const timestamp = new Date(Number(user.level.timestamp))
    const dateClaimedDailies = new Date(Number(user.balance.dateClaimedDailies))
    const levelText = `Level: ${user.level.level}, Last message counted for XP: ${timestamp.toDateString() === new Date().toDateString() ? timestamp.toTimeString() : timestamp.toDateString()}`
    const balanceText = `Balance: ${user.balance.balance}, Net worth: ${user.balance.netWorth}, Last claimed dailies: ${dateClaimedDailies.getFullYear() < new Date().getFullYear() ?
      'Not this year' :
      dateClaimedDailies.toDateString() === new Date().toDateString() ?
      dateClaimedDailies.toTimeString() : dateClaimedDailies.toDateString()}`

    if (!background || !avatar) {
      return msg.channel.send('🆘 Error loading images.')
    }

    ctx.drawImage(avatar, 25, 25, 200, 200)
    ctx.filter = 'blur(20px)'
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    ctx.filter = 'none'

    ctx.strokeStyle = '#74037b'
    ctx.fillStyle = '#74037b'
    ctx.globalAlpha = 0.2
    ctx.fillRect((canvas.width / 2.5) - 10, (canvas.height / 1.8) - 20, 400, 100)

    ctx.globalAlpha = 1.0
    ctx.fillStyle = '#ffffff'
    ctx.font = applyText(canvas, user.name, canvas.width / 2.5, 70)
    ctx.fillText(user.name, canvas.width / 2.5, canvas.height / 3)
    ctx.strokeText(user.name, canvas.width / 2.5, canvas.height / 3)

    ctx.font = applyText(canvas, levelText, canvas.width / 2.5, 60)
    ctx.fillText(levelText, canvas.width / 2.5, canvas.height / 1.8)

    ctx.font = applyText(canvas, balanceText, canvas.width / 2.5, 60)
    ctx.fillText(balanceText, canvas.width / 2.5, canvas.height / 1.2)

    createProgressBar(canvas, 'XP', canvas.width / 2, canvas.height / 1.55, 200, 20, user.level.xp, expToLevelUp(user.level.level))

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 25, 25, 200, 200)

    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile.png')

    const message = await msg.channel.send(attachment).catch(error => console.log(error))

    if (!message) {
      return msg.channel.send('🆘 I can\'t send attachments.')
    }

    msg.channel.stopTyping()
  }
}

function applyText (canvas: Canvas.Canvas, text: string, x: number, maximum: number) {
  const ctx = canvas.getContext('2d')

  do {
    ctx.font = `${maximum -= 10}px sans-serif`
  } while (ctx.measureText(text).width > canvas.width - x)

  return ctx.font
}

function createProgressBar (canvas: Canvas.Canvas, text: string, x: number, y: number, width: number, height: number, filled: number, max: number) {
  const ctx = canvas.getContext('2d')
  const prevStroke = ctx.strokeStyle
  const prevFill = ctx.fillStyle

  ctx.strokeStyle = '#ffffff'
  ctx.strokeRect(x, y, width, height)

  ctx.fillStyle = '#3473d8'
  ctx.fillRect(x, y, Math.floor(width * filled / max), height)

  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${text}: ${filled} / ${max}`, x + (width / 2) - (ctx.measureText(`${text}: ${filled} / ${max}`).width / 2), y + (height / 2) + 5)

  ctx.strokeStyle = prevStroke
  ctx.fillStyle = prevFill
}

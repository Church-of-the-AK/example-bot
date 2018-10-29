import { CommandMessage } from 'discord.js-commando'
import * as Canvas from 'canvas'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'
import { getUser } from '../../util'

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
        duration: 10,
        usages: 1
      }
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const user = await getUser(msg.author.id)

    if (!user) {
      return msg.channel.send('I don\'t seem to have you in my database. Please try again.')
    }

    msg.channel.startTyping()

    const canvas = Canvas.createCanvas(700, 250)
    const ctx = canvas.getContext('2d')
    const background = await Canvas.loadImage('images/background.jpeg')
    const avatar = await Canvas.loadImage(msg.author.displayAvatarURL({ format: 'png' }))
    const levelText = `Level: ${user.level.level}, XP: ${user.level.xp}, Last message counted for XP: ${user.level.timestamp}`
    const balanceText = `Balance: ${user.balance.balance}, Net worth: ${user.balance.netWorth}, Last claimed dailies: ${user.balance.dateClaimedDailies}`

    ctx.drawImage(avatar, 25, 25, 200, 200)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#74037b'
    ctx.fillStyle = '#ffffff'

    ctx.font = applyText(canvas, user.name, canvas.width / 2.5, 70)
    ctx.fillText(user.name, canvas.width / 2.5, canvas.height / 3)
    ctx.strokeText(user.name, canvas.width / 2.5, canvas.height / 3)

    ctx.font = applyText(canvas, levelText, canvas.width / 2.5, 60)
    ctx.fillText(levelText, canvas.width / 2.5, canvas.height / 1.8)

    ctx.font = applyText(canvas, balanceText, canvas.width / 2.5, 60)
    ctx.fillText(balanceText, canvas.width / 2.5, canvas.height / 1.2)

    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 25, 25, 200, 200)

    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile.png')

    msg.channel.stopTyping()
    return msg.channel.send(attachment)
  }
}

function applyText (canvas: Canvas.Canvas, text: string, x: number, maximum: number) {
  const ctx = canvas.getContext('2d')

  do {
    ctx.font = `${maximum -= 10}px sans-serif`
  } while (ctx.measureText(text).width > canvas.width - x)

  return ctx.font
}

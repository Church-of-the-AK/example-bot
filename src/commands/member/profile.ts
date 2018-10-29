import { CommandMessage } from 'discord.js-commando'
import * as Canvas from 'canvas'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'
import { getUser } from '../../util'
import axios from 'axios'

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
    const background = await Canvas.loadImage('images/background.jpg')
    const { data: arrayBuffer }: { data: ArrayBuffer } = await axios.get(user.avatarUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(arrayBuffer)
    const avatar = await Canvas.loadImage(buffer)

    ctx.drawImage(avatar, 25, 25, 200, 200)
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#74037b'
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 25, 25, 200, 200)

    ctx.fillStyle = '#ffffff'
    ctx.font = '50px sans-serif'
    ctx.fillText(user.name, canvas.width / 2.5, canvas.height / 1.8)

    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile.png')

    msg.channel.stopTyping()
    return msg.channel.send(`${user.name}:
Levels: { Level: ${user.level.level}, XP: ${user.level.xp}, Last message counted for XP: ${new Date(user.level.timestamp)} }
Balance: { Balance: ${user.balance.balance}, Net worth: ${user.balance.netWorth}, Last claimed dailies: ${new Date(user.balance.dateClaimedDailies)} }`, attachment)
  }
}

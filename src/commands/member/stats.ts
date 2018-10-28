import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed, version } from 'discord.js'
import { api } from '../../config'
import { MachoCommand } from '../../types'

export default class StatsCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'stats',
      aliases: ['status', 'botinfo'],
      group: 'member',
      memberName: 'stats',
      description: 'Tells you the bot\'s status.',
      details: oneLine`
        Tells you The bot\'s status.
			`,
      examples: ['stats', 'status']
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const uptime = convertMS(this.client.uptime)
    const description = `
• Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime: ${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes, and ${uptime.seconds} seconds.
• User count: ${this.client.users.size}
• Server count: ${this.client.guilds.size}
• Channels: ${this.client.channels.size}
• Discord.js-Commando version: v${version}
• Node version: ${process.version}`
    const embed = new MessageEmbed()
      .setTitle(`${this.client.user.tag}'s Stats`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(description)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

function convertMS (milliseconds: number) {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  let days = Math.floor(hours / 24)

  hours = hours % 24
  seconds = seconds % 60
  minutes = minutes % 60

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  }
}

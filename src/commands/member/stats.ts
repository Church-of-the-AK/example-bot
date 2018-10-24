import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed, version } from 'discord.js'
import { api } from '../../config'

export default class StatsCommand extends commando.Command {
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

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const uptime = new Date(this.client.uptime)
    const description = `
• Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime: ${uptime.getHours()} hours, ${uptime.getMinutes()} minutes, and ${uptime.getSeconds()} seconds.
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

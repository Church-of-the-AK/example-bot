import * as commando from 'discord.js-commando'
import { Message, MessageEmbed } from 'discord.js'

export default class GuildsCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'guilds',
      group: 'member',
      memberName: 'guilds',
      description: '',
      details: ``,
      examples: ['guilds']
    })
  }

  hasPermission (msg: commando.CommandMessage) {
    if (this.client.isOwner(msg.author)) {
      return true
    }

    return false
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const guilds = this.client.guilds.map(async guild => {
      return `**-** \`${guild.name}\` (\`${guild.id}\`) - \`${guild.joinedAt.toLocaleString()}\` - ${(await guild.fetchInvites()).first().url}`
    })
    const embed = new MessageEmbed()
      .setAuthor('Macho', this.client.user.displayAvatarURL())
      .setTitle('Guilds')
      .setColor('BLUE')
      .setFooter('Macho')
      .setTimestamp(new Date())
      .setThumbnail(msg.author.displayAvatarURL())
      .setDescription(guilds)

    return msg.channel.send(embed)
  }
}

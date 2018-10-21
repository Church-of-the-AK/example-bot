import * as commando from 'discord.js-commando'
import { Message, MessageEmbed } from 'discord.js'

export default class GuildsCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'guilds',
      group: 'owner',
      memberName: 'guilds',
      description: '',
      details: ``,
      examples: [ 'guilds' ]
    })
  }

  hasPermission (msg: commando.CommandMessage) {
    if (this.client.isOwner(msg.author)) {
      return true
    }

    return false
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const guildsPromises = await this.client.guilds.map(async (guild) => {
      const invite = await guild.channels.find(channel => channel.type === 'text').createInvite({ maxAge: 0, unique: false }).catch(() => {
        return
      })

      return `**-** \`${guild.name}\` (\`${guild.id}\`) - \`${guild.joinedAt.toLocaleString()}\` - \`${invite ? invite.url : 'No invite'}\``
    })

    const guilds = await Promise.all(guildsPromises)

    const embed = new MessageEmbed()
      .setAuthor('Macho', this.client.user.displayAvatarURL())
      .setTitle('Guilds')
      .setColor('BLUE')
      .setFooter('Macho')
      .setTimestamp(new Date())
      .setThumbnail(msg.author.displayAvatarURL({ size: 512, format: 'png' }))
      .setDescription(guilds)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

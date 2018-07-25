import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed, ColorResolvable } from 'discord.js'

export default class AddNumbersCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'embed',
      aliases: [],
      group: 'member',
      memberName: 'embed',
      description: 'Makes a fancy lil\' embed.',
      details: oneLine`
        This command can be used to make an embed. It's pretty useful. To
        learn how to use it, just type \`help embed\`.
			`,
      examples: ['embed --title [title] --desc [description] --color {color}', 'embed --title Embed title --desc Embed description --color green'],

      args: [{
        key: 'content',
        label: 'content',
        prompt: 'Type `--title [title] --desc [description] --color {color}`',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run (msg: commando.CommandMessage, { content }: { content: string }): Promise<Message | Message[]> {
    const titleParam: number = content.toLowerCase().indexOf('--title')
    const descParam: number = content.toLowerCase().indexOf('--desc')
    const colorParam: number = content.toLowerCase().indexOf('--color')

    if (!(titleParam > -1 && descParam > -1)) {
      await msg.reply('Use `m!help embed` for usage instructions.')
      return msg.delete()
    }

    const title: string = content.substring(titleParam + 7, descParam)
    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `http://192.243.102.112:8000/users/${msg.author.id}`)
      .setTitle(title)
      .setFooter('Macho')
      .setThumbnail(this.client.user.displayAvatarURL())

    if (colorParam > -1) {
      const description: string = content.substring(descParam + 6, colorParam)
      const color: ColorResolvable = content.substring(colorParam + 8, content.length).toUpperCase()

      embed.setColor(color.toUpperCase())
      embed.setDescription(description)
    } else {
      const description = content.substring(descParam + 6, content.length)

      embed.setColor('BLUE')
      embed.setDescription(description)
    }

    msg.channel.send(embed)

    if (msg.channel.type === 'text') {
      return msg.delete()
    }

    return undefined
  }
}

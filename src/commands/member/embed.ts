import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed, ColorResolvable } from 'discord.js'
import { api } from '../../config'
import { MachoCommand } from '../../types'

export default class AddNumbersCommand extends MachoCommand {
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

  async run (msg: CommandMessage, { content }: { content: string }): Promise<Message | Message[]> {
    const titleParam: number = content.toLowerCase().indexOf('--title')
    const descParam: number = content.toLowerCase().indexOf('--desc')
    const colorParam: number = content.toLowerCase().indexOf('--color')

    if (!(titleParam > -1 && descParam > -1)) {
      return msg.reply('Use `m!help embed` for usage instructions.').catch(() => {
        return null
      })
    }

    const title: string = content.substring(titleParam + 7, descParam)
    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `${api.url}/users/${msg.author.id}`)
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

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

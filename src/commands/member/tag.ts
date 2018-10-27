import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { api } from '../../config'
import { getTag, getGuild, createTag } from '../../util'

export default class TagCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'tag',
      aliases: [ 'tags', 't' ],
      group: 'member',
      memberName: 'tag',
      description: 'Allows you to create/view tags.',
      details: oneLine`
        Allows you to create/view tags.
      `,
      examples: [ 'tag view tagname', 'tag create tagname content', 'tag tagname' ],
      args: [{
        key: 'subcommand',
        label: 'subcommand',
        prompt: 'Would you like to `view` or `create` a tag? You can also enter specific tag names here.',
        type: 'string',
        infinite: false
      },
      {
        key: 'name',
        label: 'name',
        prompt: '',
        type: 'string',
        infinite: false,
        default: -1
      }],
      guildOnly: true
    })
  }

  async run (msg: commando.CommandMessage, { subcommand, name }: { subcommand: string, name: string | -1 }): Promise<Message | Message[]> {
    let result: { success: boolean, message?: string, respond?: boolean }

    switch (subcommand.toLowerCase()) {
      case 'help':
        result = await this.viewHelp(msg)
        break
      case 'c':
      case 'create':
      case 'e':
      case 'edit':
        result = await this.create(msg, name)
        break
      case 'v':
      case 'view':
        result = await this.view(msg, name)
        break
      default:
        result = await this.view(msg, subcommand)
        break
    }

    if (result.respond === false) {
      return
    }

    if (!result.success) {
      return msg.channel.send(`🆘 Failed to execute command: ${result.message}`).catch(() => {
        return null
      })
    }

    return msg.channel.send(`✅ ${result.message}`).catch(() => {
      return null
    })
  }

  async viewHelp (msg: commando.CommandMessage) {
    const commands = [
      '`tag create | edit <name> <content>` - creates/edits a tag',
      '`tag view <name>` - views a tag\'s content',
      '`tag <tagName>` - views a tag\'s content'
    ]

    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setTitle('Tag Commands')
      .setDescription(commands.join('\n'))

    await msg.channel.send(embed).catch(() => {
      return null
    })

    return { success: true, respond: false }
  }

  async view (msg: commando.CommandMessage, name: string | -1) {
    if (name === -1) {
      return { success: false, message: 'Subcommand `view` requires an argument `name`.' }
    }

    const guild = await getGuild(msg.guild.id)

    if (!guild) {
      return { success: false, message: 'I could not find your guild in my database. Please try again.' }
    }

    const tag = await getTag(guild, name)

    if (!tag) {
      return { success: false, message: 'I couldn\'t find that tag. Typo much?' }
    }

    const embed = new MessageEmbed()
      .setTitle(`${tag.name}`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(tag.content)

    msg.channel.send(embed)
    return { success: true, respond: false }
  }

  async create (msg: commando.CommandMessage, args: string | -1) {
    if (args === -1 || args.length < 2) {
      return { success: false, message: 'Subcommand `create` requires an argument `name` and argument `content`.' }
    }

    const guild = await getGuild(msg.guild.id)

    if (!guild) {
      return {  success: false, message: 'I could not find your guild in my database. Please try again.' }
    }

    const name = args.substring(0, args.indexOf(' '))
    const content = args.substring(args.indexOf(' ') + 1, args.length)
    const response = await createTag(guild, name, content)

    if (!response) {
      return { success: false, message: 'Failed to create tag `' + name + '`, please contact `JasonHaxStuff [num] 2546`.' }
    }

    if (response.error) {
      return { success: false, message: response.error }
    }

    return { success: true, message: 'Created tag `' + name + '`' }
  }
}

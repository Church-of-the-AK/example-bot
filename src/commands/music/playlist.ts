import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { api } from '../../config'

export default class PlaylistCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'playlist',
      aliases: [ 'pl' ],
      group: 'staff',
      memberName: 'playlist',
      description: 'Allows you to interact with your playlists.',
      details: oneLine`
        Allows you to interact with your playlists.
      `,
      examples: [ 'playlist create dubstep', 'playlist', 'pl play dubstep' ],
      args: [{
        key: 'subcommand',
        label: 'subcommand',
        prompt: 'Would you like to `create`/`play`/`delete` a playlist, or `add`/`remove` a song from a playlist?',
        type: 'string',
        infinite: false
      },
      {
        key: 'name',
        label: 'name',
        prompt: '',
        type: 'string',
        infinite: true,
        default: -1
      }],
      guildOnly: true
    })
  }

  hasPermission (msg: commando.CommandMessage) {
    if (this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
      return true
    }

    return false
  }

  async run (msg: commando.CommandMessage, { subcommand, name }: { subcommand: string, name: string[] | -1 }): Promise<Message | Message[]> {
    let result: { success: boolean, message?: string, respond?: boolean }

    switch (subcommand.toLowerCase()) {
      case 'help':
        result = await this.viewHelp(msg)
        break
      case 'c':
      case 'create':
        result = await this.create(msg, name)
        break
      case 'p':
      case 'play':
        result = await this.play(msg, name)
        break
      case 'a':
      case 'add':
        result = await this.add(msg, name)
        break
      case 'd':
      case 'delete':
        result = await this.delete(msg, name)
        break
      case 'r':
      case 'remove':
        result = await this.remove(msg, name)
        break
      default:
        result = { success: false, message: subcommand + ` is not a valid subcommand. Type \`${msg.guild.commandPrefix}pl help\` for help.` }
        break
    }

    if (result.respond === false) {
      return
    }

    if (!result.success) {
      return msg.channel.send(`🆘 Invalid command format: ${result.message}`).catch(() => {
        return null
      })
    }

    return msg.channel.send(`✅ ${result.message}`).catch(() => {
      return null
    })
  }

  async viewHelp (msg: commando.CommandMessage) {
    const commands = [
      '`pl create <name>` - creates a playlist',
      '`pl delete <name>` - deletes a playlist',
      '`pl play <name>` - plays a playlist',
      '`pl add <song link | "this"> to <playlist name>` - adds a song to a playlist',
      '`pl remove <song link | "this"> from <playlist name>` - removes a song from a playlist'
    ]

    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setTitle('Playlist Commands')
      .setDescription(commands.join('\n'))

    await msg.channel.send(embed).catch(() => {
      return null
    })
    return { success: true, respond: false }
  }

  async create (msg: commando.CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `create` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')
    return { success: true, message: 'Created playlist ' + name }
  }

  async play (msg: commando.CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `play` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')
    return { success: true, message: 'Started playing playlist ' + name }
  }

  async add (msg: commando.CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `add` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')

    if (!name.includes(' to ')) {
      return { success: false, message: 'Proper format: `pl add <song link | "this"> to <playlist name>`' }
    }

    const songUrl = name.substring(0, name.indexOf(' to '))
    const playlistName = name.substring(name.indexOf(' to ') + 4)

    if (songUrl.length === 0 || playlistName.length === 0) {
      return { success: false, message: 'Proper format: `pl add <song link | "this"> to <playlist name>`' }
    }

    return { success: true, message: `Added ${songUrl} to ${playlistName}` }
  }

  async remove (msg: commando.CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `delete` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')

    if (!name.includes(' from ')) {
      return { success: false, message: 'Proper format: `pl remove <song link | "this"> from <playlist name>`' }
    }

    const songName = name.substring(0, name.indexOf(' from '))
    const playlistName = name.substring(name.indexOf(' from ') + 6)

    if (songName.length === 0 || playlistName.length === 0) {
      return { success: false, message: 'Proper format: `pl delete <song link | "this"> from <playlist name>`' }
    }

    return { success: true, message: `Removed ${songName} from ${playlistName}` }
  }

  async delete (msg: commando.CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `delete` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')
    return { success: true, message: 'Deleted playlist ' + name }
  }
}

import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { getGuildSettings } from '../../util'
import axios from 'axios'
import { api } from '../../config'
import { GuildSettings } from 'machobot-database'

export default class LevelUpMessagesCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'settings',
      aliases: [ 'guildsettings', 'set' ],
      group: 'staff',
      memberName: 'settings',
      description: 'Allows you to set some guild settings.',
      details: oneLine`
        Allows you to set some guild settings.
      `,
      examples: [ 'settings lum false', 'settings', 'settings lum' ],
      args: [{
        key: 'setting',
        label: 'setting',
        prompt: '',
        type: 'string',
        infinite: false,
        default: 'view'
      },
      {
        key: 'value',
        label: 'value',
        prompt: '',
        type: 'string',
        infinite: false,
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

  async run (msg: commando.CommandMessage, { setting, value }: { setting: string, value: string | -1 }): Promise<Message | Message[]> {
    const guildSettings = await getGuildSettings(msg.guild.id)

    if (!guildSettings) {
      return msg.reply('My API may be down. Give me a moment.').catch(() => {
        return null
      })
    }

    let result: { success: boolean, message?: string, respond?: boolean }

    switch (setting.toLowerCase()) {
      case 'view':
        result = await this.viewSettings(guildSettings, msg)
        break
      case 'lum':
      case 'levelupmessages':
        result = await this.levelUpMessages(guildSettings, msg, value)
        break
      case 'voteskip':
      case 'vs':
      case 'voteskipenabled':
        result = await this.voteSkipEnabled(guildSettings, msg, value)
        break
      case 'voteclear':
      case 'vc':
      case 'voteclearenabled':
        result = await this.voteClearEnabled(guildSettings, msg, value)
        break
      default:
        result = { success: false, message: setting + ' is not a valid setting.' }
        break
    }

    if (result.respond === false) {
      return
    }

    if (!result.success) {
      return msg.reply(`🆘 Invalid command format: ${result.message}`).catch(() => {
        return null
      })
    }

    return msg.reply(`✅ Setting ${setting} has been set to ${value}. ${result.message}`).catch(() => {
      return null
    })
  }

  async levelUpMessages (guildSettings: GuildSettings, msg: commando.CommandMessage, value: string | -1) {
    if (value === -1) {
      await msg.channel.send(`The \`levelupmessages\` setting is currently set to \`${guildSettings.levelUpMessages}\`.`)
      return { success: true, respond: false }
    }

    guildSettings.levelUpMessages = value === 'true' ? true : value === 'false' ? false : undefined

    if (typeof guildSettings.levelUpMessages === 'undefined') {
      return { success: false, message: 'The setting `levelupmessages` can only be set to "true" or "false".' }
    }

    await axios.put(`${api.url}/guilds/${msg.guild.id}/settings&code=${api.code}`, guildSettings).catch(error => {
      console.log(error)
    })

    return { success: true, message: `Users will ${value === 'true' ? 'now' : 'no longer'} receive level-up messages.` }
  }

  async voteSkipEnabled (guildSettings: GuildSettings, msg: commando.CommandMessage, value: string | -1) {
    if (value === -1) {
      await msg.channel.send(`The \`voteskipenabled\` setting is currently set to \`${guildSettings.voteSkipEnabled}\`.`)
      return { success: true, respond: false }
    }

    guildSettings.voteSkipEnabled = value === 'true' ? true : value === 'false' ? false : undefined

    if (typeof guildSettings.voteSkipEnabled === 'undefined') {
      return { success: false, message: 'The setting `voteskipenabled` can only be set to "true" or "false".' }
    }

    await axios.put(`${api.url}/guilds/${msg.guild.id}/settings&code=${api.code}`, guildSettings).catch(error => {
      console.log(error)
    })

    return { success: true, message: `Users will ${value === 'true' ? 'now' : 'no longer'} be able to vote to skip songs/playlists.` }
  }

  async voteClearEnabled (guildSettings: GuildSettings, msg: commando.CommandMessage, value: string | -1) {
    if (value === -1) {
      await msg.channel.send(`The \`voteclearenabled\` setting is currently set to \`${guildSettings.voteClearEnabled}\`.`)
      return { success: true, respond: false }
    }

    guildSettings.voteClearEnabled = value === 'true' ? true : value === 'false' ? false : undefined

    if (typeof guildSettings.voteClearEnabled === 'undefined') {
      return { success: false, message: 'The setting `voteclearenabled` can only be set to "true" or "false".' }
    }

    await axios.put(`${api.url}/guilds/${msg.guild.id}/settings&code=${api.code}`, guildSettings).catch(error => {
      console.log(error)
    })

    return { success: true, message: `Users will ${value === 'true' ? 'now' : 'no longer'} be able to vote to clear the queue.` }
  }

  async viewSettings (guildSettings: GuildSettings, msg: commando.CommandMessage) {
    let description = ''

    for (let setting in guildSettings) {
      if (setting !== 'id') {
        description += `\`${setting}\` - \`${guildSettings[setting]}\`\n`
      }
    }

    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `${api.url}/users/${msg.author.id}`)
      .setTitle(`${msg.guild.name} Settings`)
      .setFooter('Macho')
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor('BLUE')
      .setDescription(description)

    await msg.channel.send(embed)
    return { success: true, respond: false }
  }
}

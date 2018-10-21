import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, TextChannel } from 'discord.js'
import { getGuildSettings } from '../../util'
import axios from 'axios'
import { api } from '../../config'

export default class LevelUpMessagesCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'levelupmessages',
      aliases: [ 'lum', 'lvlupmsgs' ],
      group: 'staff',
      memberName: 'levelupmessages',
      description: 'Allows you to disable level-up messages.',
      details: oneLine`
        Allows you to disable level-up messages.
      `,
      examples: [ 'lum false', 'lum true' ],
      args: [{
        key: 'value',
        label: 'true | false',
        prompt: 'Would you like to enable (`true`) or disable (`false`) level-up messages?',
        type: 'boolean',
        infinite: false
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

  async run (msg: commando.CommandMessage, { value }: { value: boolean }): Promise<Message | Message[]> {
    const guildSettings = await getGuildSettings(msg.guild.id)

    if (!guildSettings) {
      return msg.reply('My API may be down. Give me a moment.').catch(() => {
        return null
      })
    }

    guildSettings.levelUpMessages = value

    const response = await axios.put(`${api.url}/guilds/${msg.guild.id}/settings&code=${api.code}`, guildSettings).catch(error => {
      console.log(error)
    })

    if (!response) {
      return msg.reply('My API may be down. Give me a moment.').catch(() => {
        return null
      })
    }

    return msg.reply(`Level up messages have been ${value ? 'enabled' : 'disabled'}.`).catch(() => {
      return null
    })
  }
}

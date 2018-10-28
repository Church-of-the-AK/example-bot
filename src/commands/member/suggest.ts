import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, TextChannel, MessageEmbed, GuildChannel } from 'discord.js'
import { api } from '../../config'
import { MachoCommand } from '../../types'

export default class SuggestCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'suggest',
      aliases: [],
      group: 'member',
      memberName: 'suggest',
      description: 'Make a suggestion, and have it voted on.',
      details: oneLine`
        This command is used to add a suggestion to the #suggestions channel.
        Members can either agree or disagree with the suggestion.
			`,
      examples: ['suggest <suggestion>'],
      guildOnly: true,

      args: [{
        key: 'suggestion',
        label: 'suggestion',
        prompt: 'What would you like to suggest?`',
        type: 'string'
      }]
    })
  }

  async run (msg: CommandMessage, { suggestion }): Promise<Message | Message[]> {
    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'suggestions') as TextChannel

    if (!channel) {
      return msg.reply('This server has no #suggestions channel.').catch(() => {
        return null
      })
    }

    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `${api.url}/users/${msg.author.id}`)
      .setThumbnail(this.client.user.displayAvatarURL())
      .setTimestamp(new Date())
      .setColor('BLUE')
      .setTitle('New Suggestion')
      .setFooter('Macho')
      .setDescription(suggestion)

    const suggestionMsg = await channel.send(embed).catch(() => {
      return
    }) as Message

    if (!suggestionMsg) {
      await msg.reply(`I do not have permission to send messages in the ${channel} channel.`).catch(() => {
        return null
      })
    }

    await suggestionMsg.react('👍').catch(() => {
      return
    })
    await suggestionMsg.react('👎').catch(() => {
      return
    })

    return msg.reply('Suggestion added!').catch(() => {
      return null
    })
  }
}

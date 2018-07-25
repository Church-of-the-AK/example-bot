import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, TextChannel, MessageEmbed, GuildChannel } from 'discord.js'

export default class SuggestCommand extends commando.Command {
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

  async run (msg: commando.CommandMessage, { suggestion }): Promise<Message | Message[]> {
    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'suggestions') as TextChannel

    if (!channel) {
      await msg.reply('This server has no #suggestions channel.')
      return msg.delete()
    }

    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `http://192.243.102.112:8000/users/${msg.author.id}`)
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
      await msg.reply(`I do not have permission to send messages in the ${channel} channel.`)
      msg.delete()
    }

    await suggestionMsg.react('👍')
    await suggestionMsg.react('👎')

    await msg.reply('Suggestion added!')

    return msg.delete()
  }
}

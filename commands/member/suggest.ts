import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import ec = require('embed-creator')
import { Message, TextChannel } from 'discord.js';

module.exports = class SuggestCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      aliases: [],
      group: 'member',
      memberName: 'suggest',
      description: 'Make a suggestion, and have it voted on.',
      details: oneLine`
                This command is used to add a suggestion to the #suggestions channel.
                Members can either agree with or disagree with the suggestion.
			`,
      examples: ['suggest [suggestion'],
      guildOnly: true,

      args: [{
        key: 'suggestion',
        label: 'suggestion',
        prompt: 'What would you like to suggest?`',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { suggestion }): Promise<Message> {
    if (msg.channel.type == "text") {
      try {
        let channel = msg.guild.channels.find('name', 'suggestions') as TextChannel
        if (channel) {
          const suggestionMsg = await channel.send(ec(
            "#FEAFEA", {
              "name": msg.author.username,
              "icon_url": msg.author.displayAvatarURL,
              "url": null
            }, "New Suggestion", suggestion, [], {
              "text": "MachoBot",
              "icon_url": null
            }, {
              "thumbnail": null,
              "image": null
            }, false
          )) as Message

          await suggestionMsg.react('👍')
          suggestionMsg.react('👎')

          const reply = await msg.reply("Suggestion added!")
          if (reply instanceof Message) {
            reply.delete(3000)
            msg.delete()
          }
        } else {
          const reply = await msg.reply("This server has no #suggestions channel.")
          if (reply instanceof Message) {
            reply.delete(3000)
            msg.delete()
          }
        }
      } catch (err) {
        const reply = await msg.reply("Oops can't do that srry bye now")
        if (reply instanceof Message) {
          reply.delete(3000)
          msg.delete()
        }
      }
    } else {
      const reply = await msg.reply("This command can only be used in a server.")
      if (reply instanceof Message) {
        reply.delete(3000)
        msg.delete()
      }
    }
    return undefined
  }
}

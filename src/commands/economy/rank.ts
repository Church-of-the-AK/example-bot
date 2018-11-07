import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, User } from 'discord.js'
import { getUser } from '../../util'
import { MachoCommand } from '../../types'

export default class RankCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'rank',
      aliases: [ 'level' ],
      group: 'economy',
      memberName: 'rank',
      description: 'Replies with how what level you are.',
      details: oneLine`
				This command is used to check what level you are.
			`,
      examples: ['rank', 'rank @JasonHaxStuff', 'level'],
      args: [
        {
          key: 'mention',
          label: 'mention',
          prompt: "Who's level would you like to view?",
          type: 'user',
          infinite: false,
          default: -1
        }
      ]
    })
  }

  async run (msg: CommandMessage, { mention }: { mention: User | number }): Promise<Message | Message[]> {
    const user = await getUser(mention instanceof User ? mention.id : msg.author.id).catch(error => {
      console.log(error)
    })

    if (!user) {
      return msg.reply(
        `${mention !== 1 ? `I don't have that user in the database. Wait until they send a message.`
          : `It seems as if I didn't have you in the database. Please try again.`
        }`
      ).catch(() => {
        return null
      })
    }

    return msg.channel.send(`**${user.name}** is level **${user.level.level}** and has **${user.level.xp}** xp.`).catch(() => {
      return null
    })
  }
}

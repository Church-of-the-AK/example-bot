import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, User } from 'discord.js'
import { MachoAPIUser } from '../../types/MachoAPIUser'
import { getUser } from "../../util"

export default class CreditsCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'credits',
      aliases: ['balance', 'money'],
      group: 'economy',
      memberName: 'credits',
      description: 'Replies with how many credits you have.',
      details: oneLine`
				This command is used to check how many credits you have. The end.
			`,
      examples: ['credits', 'credits @JasonHaxStuff', 'money'],
      args: [
        {
          key: 'mention',
          label: 'mention',
          prompt: "Who's credits would you like to view?",
          type: 'user',
          infinite: false,
          default: 1
        }
      ]
    })
  }

  async run(msg: commando.CommandMessage, { mention }: { mention: User | number }): Promise<Message | Message[]> {
    const user: MachoAPIUser = await getUser(mention instanceof User ? mention.id : msg.author.id)

    if (JSON.stringify(user) === '') {
      return msg.reply(
        `${mention !== 1 ? `I don't have that user in the database. Wait until they send a message.`
          : `It seems as if I didn't have you in the database. Please try again.`
        }`
      )
    }

    msg.channel.send(`**${user.name}** has **${user.balance.balance}** credits.`)

    return msg.delete()
  }
}

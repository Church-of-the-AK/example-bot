import * as  commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as request from 'request'
import { Message } from 'discord.js';
import { MachoAPIUser } from '../../types/MachoAPIUser';

module.exports = class CreditsCommand extends commando.Command {
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
      args: [{
        key: 'mention',
        label: 'mention',
        prompt: 'Who\'s credits would you like to view?',
        type: 'user',
        infinite: false,
        default: 1,
      }],
    })
  }

  async run(msg: commando.CommandMessage, { mention }): Promise<Message> {
    request
      .get(`http://localhost:8000/users/${mention != 1 ? mention.id : msg.author.id}`, async function optionalCallback(err, httpResponse, body) {
        if (body === '[]' || body === '' || body === 'Error' || body === '{}') {
          return msg.reply(`${mention != 1 ? `I don't have that user in the database. Wait until they send a message.` : `It seems as if I didn't have you in the database. Please try again.`}`)
        }
        let user: MachoAPIUser = JSON.parse(body)
        msg.channel.send(`**${user.name}** has **${user.balance.balance}** credits.`)
      })
    msg.delete()
    return undefined
  }
}

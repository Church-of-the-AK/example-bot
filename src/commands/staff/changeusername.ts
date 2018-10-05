import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import * as moment from 'moment'
import { Message } from 'discord.js'
import { ownerId } from '../../config'

export default class ChangeUsernameCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'changeusername',
      aliases: ['changename', 'changebotname'],
      group: 'staff',
      memberName: 'changeusername',
      description: 'Changes the username of the bot.',
      details: oneLine`
				This is an incredibly useful command that changes the username of the bot.
				Only usable by the owner, JasonHaxStuff.
			`,
      examples: ['changeusername ILikeDogs', 'changename KillMeNow'],

      args: [{
        key: 'name',
        label: 'name',
        prompt: 'What would you like to name the bot?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run (msg: commando.CommandMessage, { name }: { name: string }): Promise<Message | Message[]> {
    if (msg.author.id !== ownerId) {
      return msg.reply("Sorry, but you can't do that.").catch(() => {
        return null
      })
    }

    this.client.user.setUsername(name)

    let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has changed ${this.client.user.username}'s name to ${name}.`)

    return msg.reply(`Succesfully changed my username to \`${name}\`!`).catch(() => {
      return null
    })
  }
}

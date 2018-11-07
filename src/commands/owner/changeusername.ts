import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message } from 'discord.js'
import { ownerId } from '../../config'
import { MachoCommand } from '../../types'

export default class ChangeUsernameCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'changeusername',
      aliases: ['changename', 'changebotname'],
      group: 'owner',
      memberName: 'changeusername',
      description: 'Changes the username of the bot.',
      details: oneLine`
				This is an incredibly useful command that changes the username of the bot.
				Only usable by the owner, JasonHaxStuff.
			`,
      examples: ['changeusername ILikeDogs', 'changename KillMeNow'],
      ownerOnly: true,

      args: [{
        key: 'name',
        label: 'name',
        prompt: 'What would you like to name the bot?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { name }: { name: string }): Promise<Message | Message[]> {

    this.client.user.setUsername(name)

    let time = new Date()
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has changed ${this.client.user.username}'s name to ${name}.`)

    return msg.reply(`Succesfully changed my username to \`${name}\`!`).catch(() => {
      return null
    })
  }
}

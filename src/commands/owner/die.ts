import * as commando from 'discord.js-commando'
import { Message } from 'discord.js'

export default class DieCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'die',
      group: 'owner',
      memberName: 'die',
      description: 'Kills the bot.',
      details: `Kills the bot.`,
      aliases: [ 'kill', 'restart' ],
      examples: [ 'die', 'kill', 'restart' ]
    })
  }

  hasPermission (msg: commando.CommandMessage) {
    if (this.client.isOwner(msg.author)) {
      return true
    }

    return false
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const response = await msg.channel.send('Killing the bot...')

    this.client.destroy()
    process.exit()

    return response
  }
}

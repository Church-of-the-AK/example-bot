import { CommandMessage } from 'discord.js-commando'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'

export default class DieCommand extends MachoCommand {
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

  hasPermission (msg: CommandMessage) {
    if (this.client.isOwner(msg.author)) {
      return true
    }

    return false
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const response = await msg.channel.send('Killing the bot...')

    this.client.destroy()
    process.exit()

    return response
  }
}

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
      examples: [ 'die', 'kill', 'restart' ],
      ownerOnly: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const response = await msg.channel.send('Killing the bot...').catch(error => console.log(error))

    this.client.destroy()
    process.exit()

    if (response) {
      return response
    }
  }
}

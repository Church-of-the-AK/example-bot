import { CommandMessage } from 'discord.js-commando'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'

export default class ReloadAllCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'reloadall',
      group: 'owner',
      memberName: 'reloadall',
      description: 'Reloads all of the bot\'s commands.',
      details: 'Reloads all of the bot\'s commands.',
      aliases: [ 'rel' ],
      examples: [ 'reloadall', 'rel' ],
      ownerOnly: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const response = await msg.channel.send('🕙 Reloading all commands...').catch() as Message

    let failed = false
    this.client.registry.commands.forEach(command => {
      try {
        command.reload()
      } catch (err) {
        console.log(err)
        failed = true
        response.edit(`🆘 There was an error reloading the ${command.name} command.`)
      }
    })

    if (!failed) {
      response.edit('✅ Reloaded all commands.')
    }

    return response
  }
}

import { CommandMessage } from 'discord.js-commando'
import { Message } from 'discord.js'
import { exec } from 'child_process'
import { MachoCommand } from '../../types'

export default class PullCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'pull',
      group: 'owner',
      memberName: 'pull',
      description: 'Pulls from the bot\'s repo.',
      details: 'Pulls from the bot\'s repo.',
      examples: [ 'pull' ]
    })
  }

  hasPermission (msg: CommandMessage) {
    if (this.client.isOwner(msg.author)) {
      return true
    }

    return false
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const pulling = await msg.channel.send('🕙 Pulling from GitHub...') as Message

    exec('git pull', (error, stdout) => {
      if (error) {
        return pulling.edit('🆘 Failed to pull from the GitHub repo.')
      }

      if (stdout.startsWith('Already')) {
        return pulling.edit('✅ Already up-to-date.')
      }

      return pulling.edit('✅ Successfully pulled from the GitHub repo.')
    })

    return pulling
  }
}

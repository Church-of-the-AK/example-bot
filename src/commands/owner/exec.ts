import { CommandMessage } from 'discord.js-commando'
import { Message } from 'discord.js'
import { exec } from 'child_process'
import { MachoCommand } from '../../types'

export default class ExecCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'exec',
      group: 'owner',
      memberName: 'exec',
      description: 'Executes a command in the system\'s terminal.',
      details: 'Executes a command in the system\'s terminal.',
      examples: [ 'exec ls' ],
      ownerOnly: true,
      args: [{
        key: 'command',
        label: 'command',
        prompt: 'What would you like to execute?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { command }: { command: string }): Promise<Message | Message[]> {
    const running = await msg.channel.send(`🕙 Running \`${command}\``).catch(error => console.log(error)) as Message

    exec(command, (error, stdout) => {
      if (error) {
        return running.edit(`🆘 Failed to run \`${command}\``)
      }

      return running.edit(`✅ Successfully ran \`${command}\`\n\nOutput:\n\`\`\`bash\n${stdout}\`\`\``)
    })

    return running
  }
}

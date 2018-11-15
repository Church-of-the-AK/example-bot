import { CommandMessage } from 'discord.js-commando'
import { Message, MessageEmbed } from 'discord.js'
import { exec } from 'child_process'
import { MachoCommand } from '../../types'
import { api } from '../../config'
import { createHaste } from '../../util'

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
    const embed = new MessageEmbed()
      .setTitle(`Execution Info`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(`🕙 Running \`${command}\``)
    const running = await msg.channel.send(embed).catch() as Message

    exec(command, async (error, stdout) => {
      if (error) {
        embed.setDescription(`🆘 Failed to run \`${command}\``)
        return running.edit(embed)
      }

      if (stdout.length > 1000) {
        const haste = await createHaste(stdout, 'bash')

        if (!haste) {
          embed.setDescription('🆘 Error posting haste to hastebin. Not my fault, I swear.')
          return running.edit(embed)
        }

        embed.setDescription(`✅ Successfully ran \`${command}\``)
        embed.addField('Output', haste)
        return running.edit(embed)
      }

      embed.setDescription(`✅ Successfully ran \`${command}\``)
      embed.addField('Output', `\`\`\`bash\n${stdout}\`\`\``)
      return running.edit(embed)
    })

    return running
  }
}

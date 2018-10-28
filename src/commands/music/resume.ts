import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'

export default class ResumeCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'resume',
      aliases: ['start', 'resume'],
      group: 'music',
      memberName: 'resume',
      description: 'Resume the queue for the server.',
      details: oneLine`
        This command is used to resume the current queue.
			`,
      examples: ['resume', 'start'],
      guildOnly: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const serverQueue = this.client.getQueue(msg.guild.id)

    if (!serverQueue || serverQueue.playing) {
      return msg.channel.send('There is nothing paused.').catch(() => {
        return null
      })
    }

    serverQueue.playing = true
    serverQueue.connection.dispatcher.resume()

    return msg.channel.send('▶ Resumed the music for you!').catch(() => {
      return null
    })
  }
}

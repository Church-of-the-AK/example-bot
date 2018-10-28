import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'

export default class PauseCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'pause',
      aliases: [],
      group: 'music',
      memberName: 'pause',
      description: 'Pause the queue for the server.',
      details: oneLine`
        This command is used to pause the current queue.
			`,
      examples: ['pause'],
      guildOnly: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const serverQueue = this.client.getQueue(msg.guild.id)

    if (!serverQueue) {
      return msg.channel.send('There is nothing playing.').catch(() => {
        return null
      })
    }

    if (!serverQueue.playing) {
      return msg.channel.send('The music is already paused.').catch(() => {
        return null
      })
    }

    serverQueue.playing = false
    serverQueue.connection.dispatcher.pause()

    return msg.channel.send('⏸ Paused the music for you!').catch(() => {
      return null
    })
  }
}

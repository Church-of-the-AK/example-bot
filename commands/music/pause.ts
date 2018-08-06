import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js'

export default class PauseCommand extends commando.Command {
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

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const serverQueue = queue.get(msg.guild.id)

    if (!serverQueue) {
      return msg.channel.send('There is nothing playing.')
    }

    if (!serverQueue.playing) {
      return msg.channel.send('The music is already paused.')
    }

    serverQueue.playing = false
    serverQueue.connection.dispatcher.pause()

    return msg.channel.send('⏸ Paused the music for you!')
  }
}

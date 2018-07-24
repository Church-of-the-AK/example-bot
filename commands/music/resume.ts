import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js';

module.exports = class ResumeCommand extends commando.Command {
  constructor(client) {
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

  async run(msg: commando.CommandMessage): Promise<Message> {
    const serverQueue = queue.get(msg.guild.id)

    if (!serverQueue || serverQueue.playing) {
      msg.channel.send('There is nothing paused.')
      return msg.delete()
    }

    serverQueue.playing = true
    serverQueue.connection.dispatcher.resume()

    msg.channel.send('▶ Resumed the music for you!')
    return msg.delete()
  }
}

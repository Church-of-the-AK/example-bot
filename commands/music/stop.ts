import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js';
import { ServerQueue } from '../../types/ServerQueue';

module.exports = class ClearCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      aliases: ['clearqueue'],
      group: 'music',
      memberName: 'clear',
      description: 'Clear the queue for the server.',
      details: oneLine`
        This command is used to skip every song in
        the current queue.
			`,
      examples: ['clear'],
      guildOnly: true,
    })
  }

  async run(msg: commando.CommandMessage): Promise<Message> {
    const serverQueue: ServerQueue = queue.get(msg.guild.id)
    if (!msg.member.voiceChannel) {
      msg.channel.send('You are not in a voice channel!')
      return msg.delete()
    }
    if (!serverQueue) {
      msg.channel.send('There is nothing playing that I could stop for you.')
      return msg.delete()
    }
    serverQueue.songs = []
    serverQueue.connection.dispatcher.end('Stop command has been used!')
    msg.channel.send("Cleared the queue.")
    return msg.delete()
  }
}

import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js';

module.exports = class SkipCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['skipsong'],
      group: 'music',
      memberName: 'skip',
      description: 'Skip a song from the bot\'s queue.',
      details: oneLine`
                This command is used to skip a song in the current queue
                of songs.
			`,
      examples: ['skip'],
      guildOnly: true,
    })
  }

  async run(msg: commando.CommandMessage): Promise<Message> {
    const serverQueue = queue.get(msg.guild.id)
    if (!msg.member.voiceChannel) {
      msg.channel.send('You are not in a voice channel!')
      return msg.delete()
    }
    if (!queue) {
      msg.channel.send('There is nothing playing that I could skip for you.')
      return msg.delete()
    }
    serverQueue.connection.dispatcher.end('Skip command has been used!')
    return msg.delete()
  }
}

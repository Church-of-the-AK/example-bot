import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js'

export default class NowPlayingCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'np',
      aliases: ['nowplaying', 'current', 'song'],
      group: 'music',
      memberName: 'np',
      description: 'See what song the bot is currently playing.',
      details: oneLine`
        This command is used to see what song is playing
        in a certain server.
			`,
      examples: ['np', 'song'],
      guildOnly: true
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const serverQueue = queue.get(msg.guild.id)

    if (!serverQueue) {
      return msg.channel.send('There is nothing playing.')
    }

    const song = serverQueue.songs[0]

    return msg.channel.send(`🎶 Now playing: \`${song.title}\` - \`${song.member.nickname ? song.member.nickname : song.member.user.username}\``)
  }
}

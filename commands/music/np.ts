import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'

module.exports = class NowPlayingCommand extends commando.Command {
  constructor(client) {
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
      guildOnly: true,
    })
  }

  async run(msg: commando.CommandMessage) {
    const serverQueue = queue.get(msg.guild.id)
    if (!serverQueue) {
      return msg.channel.send('There is nothing playing.')
    }
    msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`)
    return msg.delete()
  }
}

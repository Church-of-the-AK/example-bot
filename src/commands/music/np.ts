import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message, MessageEmbed } from 'discord.js'

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
      return msg.channel.send('There is nothing playing. Why don\'t *you* start the party?').catch(() => {
        return null
      })
    }

    const song = serverQueue.songs[0]
    const embed = new MessageEmbed()
      .setTitle('🎶 Now Playing')
      .setAuthor(msg.author.username, msg.author.displayAvatarURL())
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(`**${song.title}** - ${song.member.user.tag}`)
      .setThumbnail(song.thumbnail)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { MachoCommand } from '../../types'

export default class NowPlayingCommand extends MachoCommand {
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

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const serverQueue = this.client.getQueue(msg.guild.id)

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
      .setDescription(`[${song.title}](${song.url}) - ${song.member.user.tag}`)
      .setThumbnail(song.thumbnail)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

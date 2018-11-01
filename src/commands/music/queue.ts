import { CommandMessage } from 'discord.js-commando'
import { oneLine, stripIndents } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { api } from '../../config'
import { MachoCommand } from '../../types'
import { paginate } from '../../util'

export default class QueueCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'queue',
      aliases: ['songs'],
      group: 'music',
      memberName: 'queue',
      description: 'Lists every song in the current queue.',
      details: oneLine`
        This command is used to list every song currently
        in the bot's queue.
			`,
      examples: ['queue', 'songs'],
      guildOnly: true,

      args: [{
        key: 'pageNum',
        label: 'page',
        prompt: 'What page would you like to look at?',
        type: 'integer',
        default: 1,
        validate: page => page > 0
      }]
    })
  }

  async run (msg: CommandMessage, { pageNum }: { pageNum: number }): Promise<Message | Message[]> {
    const serverQueue = this.client.getQueue(msg.guild.id)

    if (!serverQueue) {
      return msg.channel.send('There is nothing playing. Why don\'t *you* start the jam session?').catch(() => {
        return null
      })
    }

    const songs = serverQueue.songs.map((song, index) => {
      if (index === 0) {
        return ''
      }

      return `**-** ${song.title} - \`${song.member.user.tag}\``
    })

    const pages: Map<number, string> = paginate(songs)

    if (!pages.get(pageNum)) {
      return msg.channel.send(`There are only ${pages.size} pages.`).catch(() => {
        return null
      })
    }

    const nowPlaying = serverQueue.songs[0]

    const description = stripIndents`
			${pages.get(pageNum)}
      **Now playing:** ${nowPlaying.title} - \`${nowPlaying.member.user.tag}\`
    `

    const embed = new MessageEmbed()
      .setColor('BLUE')
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `${api.url}/users/${msg.author.id}`)
      .setTitle('Song Queue')
      .setDescription(description)
      .setFooter(`Page ${pageNum}/${pages.size}. View different pages with ${msg.guild.commandPrefix}queue <number>.`)
      .setThumbnail(this.client.user.displayAvatarURL())

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

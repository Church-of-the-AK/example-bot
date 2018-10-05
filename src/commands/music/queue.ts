import * as commando from 'discord.js-commando'
import { oneLine, stripIndents } from 'common-tags'
import { queue } from '../../index'
import { Message, MessageEmbed } from 'discord.js'
import { api } from '../../config'

export default class QueueCommand extends commando.Command {
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
        default: 1
      }]
    })
  }

  async run (msg: commando.CommandMessage, { pageNum }: { pageNum: number }): Promise<Message | Message[]> {
    const serverQueue = queue.get(msg.guild.id)

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
    const pages: Map<number, string> = new Map()
    let page = 1

    for (let i = 0; i < songs.length; i++) {
      if (pages.has(page)) {
        pages.set(page, pages.get(page) + songs[i] + '\n')
      } else {
        pages.set(page, songs[i] + '\n')
      }

      if ((i + 1) % 10 === 0) {
        page++
      }
    }

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

import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { api, youtubeKey } from '../../config'
import { MachoCommand } from '../../types'
import { YouTube } from 'better-youtube-api'

const youtube = new YouTube(youtubeKey)

export default class YtSearchCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'ytsearch',
      aliases: [ 'yt' ],
      group: 'member',
      memberName: 'stats',
      description: 'Searches for a video on YouTube.',
      details: oneLine`
        Searches for a video on YouTube.
			`,
      examples: ['ytsearch gangnam style', 'yt never gonna give you up'],
      args: [{
        key: 'search',
        label: 'search',
        prompt: 'Would you like to search for on YouTube?',
        type: 'string'
      }]
    })
  }

  async run (msg: CommandMessage, { search }: { search: string }): Promise<Message | Message[]> {
    const videos = await youtube.searchVideos(search, 1).catch(() => {
      return
    })

    if (!videos) {
      return msg.channel.send('🆘 I couldn\'t find that video.').catch(() => {
        return null
      })
    }

    const video = await videos[0].fetch()
    const desc = video.description.slice(0, 250)
    const description = `${desc.length < video.description.length ? `${desc}...` : desc}`
    const embed = new MessageEmbed()
      .setTitle(`Video Information`)
      .setAuthor(video.title, video.url)
      .setColor('BLUE')
      .setThumbnail(video.thumbnails.default.url)
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(description)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

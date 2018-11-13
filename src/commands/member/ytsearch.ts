import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed, Util } from 'discord.js'
import { youtubeKey } from '../../config'
import { MachoCommand } from '../../types'
import { YouTube } from 'better-youtube-api'

const youtube = new YouTube(youtubeKey)

export default class YtSearchCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'ytsearch',
      aliases: [ 'yt' ],
      group: 'member',
      memberName: 'ytsearch',
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
    const channel = await youtube.getChannel(video.channelId)

    const stats = Util.escapeMarkdown(`Views: ${numberWithCommas(video.views)}
Likes: ${numberWithCommas(video.likes)}
Dislikes: ${numberWithCommas(video.dislikes)}
Date published: ${video.datePublished.toString()}
Length: ${video.minutes}m and ${video.seconds}s`)

    const channelInfo = `Channel: [${channel.name}](${channel.url})\n` +
Util.escapeMarkdown(`Date created: ${channel.dateCreated.toString()}
Total Views: ${numberWithCommas(channel.views)}
Subscribers: ${channel.subCount !== -1 ? numberWithCommas(channel.subCount) : 'Hidden'}`)

    const embed = new MessageEmbed()
      .setTitle(`Video Information`)
      .setAuthor(video.title, null, video.url)
      .setColor('RED')
      .setThumbnail(video.thumbnails.default.url)
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .addField('Desciption', description)
      .addField('Stats', stats)
      .addField('Channel', channelInfo)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

function numberWithCommas (num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

import { Videos as VideosClass } from 'pornhub-api'
import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { MachoCommand } from '../../types'

const Videos = new VideosClass()

export default class PhSearchCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'phsearch',
      aliases: [ 'ph', 'porn' ],
      group: 'nsfw',
      memberName: 'phsearch',
      description: 'Search for a video on PornHub.',
      details: oneLine`
        Search for a video on PornHub.
      `,
      nsfw: true,
      examples: ['phsearch yoga pants', 'porn overwatch'],
      args: [{
        key: 'search',
        label: 'search',
        prompt: 'Would you like to search for on PornHub?',
        type: 'string'
      }]
    })
  }

  async run (msg: CommandMessage, { search }: { search: string }): Promise<Message | Message[]> {
    const videos = (await Videos.searchVideos({ search, thumbsize: 'medium' })).videos

    if (videos.length === 0) {
      return msg.channel.send('🆘 I couldn\'t find that video.')
    }

    const video = videos[0]

    const stats = `Views: ${numberWithCommas(Number(video.views))}
Rating: ${numberWithCommas(Number(video.rating))}
Rates: ${numberWithCommas(video.ratings)}`

    const info = `Date published: ${video.publish_date}
Duration: ${video.duration}
Categories: ${video.categories.map(cat => cat.category).join(', ')}
Tags: ${video.tags.map(tag => tag.tag_name).join(', ')}
Pornstars: ${video.pornstars.map(star => star.pornstar_name).join(', ')}`

    const embed = new MessageEmbed()
      .setTitle('Video Information')
      .setAuthor(video.title, null, video.url)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setThumbnail(video.default_thumb)
      .addField('Stats', stats)
      .addField('Info', info)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

function numberWithCommas (num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

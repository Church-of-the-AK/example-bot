import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { soundcloudKey } from '../../config'
import { MachoCommand } from '../../types'
import { SoundCloud } from 'better-soundcloud-api'

const soundcloud = new SoundCloud(soundcloudKey)

export default class ScSearchCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'scsearch',
      aliases: [ 'sc' ],
      group: 'member',
      memberName: 'scsearch',
      description: 'Searches for a track on SoundCloud.',
      details: oneLine`
        Searches for a track on SoundCloud.
			`,
      examples: ['scsearch gangnam style', 'sc never gonna give you up'],
      args: [{
        key: 'search',
        label: 'search',
        prompt: 'Would you like to search for on SoundCloud?',
        type: 'string'
      }]
    })
  }

  async run (msg: CommandMessage, { search }: { search: string }): Promise<Message | Message[]> {
    const tracks = await soundcloud.searchTracks(search).catch(() => {
      return
    })

    if (!tracks) {
      return msg.channel.send('🆘 I couldn\'t find that track.').catch(() => {
        return null
      })
    }

    const track = await tracks[0].fetch()
    const author = await soundcloud.getUser(`${track.user.id}`)
    const desc = track.description.slice(0, 250)
    const description = `${desc.length < track.description.length ? `${desc}...` : desc}`

    const stats = `Favorites: ${numberWithCommas(track.favorites)}
Tags: ${track.tags.join(', ')}
Date published: ${track.datePublished.toString()}
Length: ${track.minutes}m and ${track.seconds.toFixed(0)}s`

    const authorInfo = `Username: [${author.username}](${author.url})
Followers: ${author.followersCount}
Following: ${author.followingsCount}
Full name: ${author.firstName} ${author.lastName}
Last modified: ${author.lastModified.toString()}
Website: ${author.website}
Tracks: ${author.trackCount}
Playlists: ${author.playlistCount}
Plan: ${author.plan}`

    const embed = new MessageEmbed()
      .setTitle(`Track Information`)
      .setAuthor(track.title, null, track.url)
      .setColor('ORANGE')
      .setThumbnail(track.artwork)
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .addField('Desciption', description)
      .addField('Stats', stats)
      .addField('Author', authorInfo)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

function numberWithCommas (num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

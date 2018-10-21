import * as commando from 'discord.js-commando'
import { oneLine, stripIndents } from 'common-tags'
import { queue } from '../../index'
import { Util, VoiceChannel, TextChannel, Guild, MessageEmbed, Collection, Message } from 'discord.js'
import * as ytdl from 'ytdl-core'
import { YouTube, Video } from 'better-youtube-api'
import { youtubeKey, api } from '../../config'
import { ServerQueue, Song } from '../../types'

const youtube = new YouTube(youtubeKey)

export default class PlayCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'play',
      aliases: ['playsong'],
      group: 'music',
      memberName: 'play',
      description: 'Add a song to the bot\'s queue.',
      details: oneLine`
        This command is used to add a song to the current queue
        of songs.
			`,
      examples: ['play <youtube link or search term>'],
      guildOnly: true,

      args: [{
        key: 'link',
        label: 'youtube link or search term',
        prompt: 'What song would you like to play?',
        type: 'string',
        default: -1,
        infinite: false
      }]
    })
  }

  async run (msg: commando.CommandMessage, { link }: { link: string | number }): Promise<Message | Message[]> {
    const url = link && typeof link === 'string' ? link.replace(/<(.+)>/g, '$1') : ''
    const searchString = link
    const voiceChannel = msg.member.voice.channel
    const serverQueue = queue.get(msg.guild.id)

    if (!voiceChannel) {
      return msg.channel.send('I\'m sorry, but you need to be in a voice channel to play music!').catch(() => {
        return null
      })
    }

    const permissions = voiceChannel.permissionsFor(msg.client.user)

    if (!permissions.has('CONNECT')) {
      return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!').catch(() => {
        return null
      })
    }

    if (!permissions.has('SPEAK')) {
      return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!').catch(() => {
        return null
      })
    }

    if (link === -1) {
      if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()

        return msg.channel.send('▶ Resumed the music for you!').catch(() => {
          return null
        })
      } else {
        return msg.reply(`Nothing is paused. Use \`${msg.guild.commandPrefix}play <youtube link or search term>\` to play music.`).catch(() => {
          return null
        })
      }
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylistByUrl(url).catch(() => {
        return
      })

      if (!playlist) {
        return msg.channel.send('I couldn\'t find that playlist!').catch(() => {
          return null
        })
      }

      const responseMsg = await msg.channel.send(`🕙 Adding playlist **${playlist.title}** to the queue... ${playlist.itemCount >= 100 ? 'This may take a while.' : ''}`).catch(() => {
        return null
      }) as Message

      const videos = await playlist.fetchVideos()

      for (let i = 0; i < videos.length; i++) {
        if (videos[i].private) {
          await videos[i].fetch().catch(() => {
            // It's private
          })
        }

        if (!videos[i].private) {
          await handleVideo(videos[i], msg, voiceChannel, true).catch(err => {
            console.log(err)
          })
        }
      }

      if (responseMsg) {
        await responseMsg.edit(`✅ Playlist: **${playlist.title}** has been added to the queue!`)
      }

      return
    }

    let video = await youtube.getVideoByUrl(url).catch(() => {
      return
    })

    if (video) {
      handleVideo(video, msg, voiceChannel)
      return
    }

    const videos = await youtube.searchVideos(searchString as string).catch(() => {
      return
    })

    if (!videos || videos.length === 0) {
      return msg.channel.send('🆘 I could not obtain any search results.').catch(() => {
        return null
      })
    }

    let index = 0
    const description = stripIndents`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`
    const embed = new MessageEmbed()
      .setColor('BLUE')
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), `${api.url}/users/${msg.author.id}`)
      .setTitle('Song Selection')
      .setFooter('Please provide a value to select one of the search results ranging from 1-10.')
      .setDescription(description)
      .setThumbnail(this.client.user.displayAvatarURL())

    msg.channel.send(embed).catch(() => {
      return
    })

    const response: Collection<string, Message> | void = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
      max: 1,
      time: 10000,
      errors: ['time']
    }).catch(() => {
      return
    })

    if (!response) {
      return msg.channel.send('No or invalid value entered, cancelling video selection.').catch(() => {
        return null
      })
    }

    const videoIndex = parseInt(response.first().content)
    video = await youtube.getVideo(videos[videoIndex - 1].id)

    handleVideo(video, msg, voiceChannel)
  }
}

async function handleVideo (video: Video, msg: commando.CommandMessage, voiceChannel: VoiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id)
  const song: Song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: video.url,
    member: msg.member
  }

  if (!serverQueue) {
    const queueConstruct: ServerQueue = {
      textChannel: msg.channel as TextChannel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    }

    queue.set(msg.guild.id, queueConstruct)
    queueConstruct.songs.push(song)

    const connection = await voiceChannel.join()
    queueConstruct.connection = connection

    play(msg.guild, queueConstruct.songs[0])
  } else {
    serverQueue.songs.push(song)

    if (playlist) {
      return true
    }

    return msg.channel.send(`✅ **${song.title}** has been added to the queue!`).catch(() => {
      return null
    })
  }
}

function play (guild: Guild, song: Song) {
  const serverQueue = queue.get(guild.id)

  if (!song) {
    serverQueue.voiceChannel.leave()
    queue.delete(guild.id)

    return
  }

  const dispatcher = serverQueue.connection.play(ytdl(song.url))
    .on('end', reason => {
      if (reason) console.error(reason)

      serverQueue.songs.shift()
      play(guild, serverQueue.songs[0])
    })
    .on('error', error => console.error(error))

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
  serverQueue.textChannel.send(`🎶 Started playing: **${song.title}**, requested by \`${song.member.user.tag}\`.`).catch(() => {
    return
  })
}

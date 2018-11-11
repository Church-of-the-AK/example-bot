import { CommandMessage, Command } from 'discord.js-commando'
import { oneLine, stripIndents } from 'common-tags'
import { Util, VoiceChannel, TextChannel, Guild, MessageEmbed, Collection, Message } from 'discord.js'
import * as ytdl from 'ytdl-core'
import { YouTube, Video } from 'better-youtube-api'
import { SoundCloud, Track } from 'better-soundcloud-api'
import { youtubeKey, api, soundcloudKey } from '../../config'
import { ServerQueue, Song, MachoCommand, MachoClient } from '../../types'
import { Readable } from 'stream'
import axios from 'axios'

const youtube = new YouTube(youtubeKey)
const soundcloud = new SoundCloud(soundcloudKey)

export default class PlayCommand extends MachoCommand {
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

  async run (msg: CommandMessage, { link }: { link: string | number }): Promise<Message | Message[]> {
    const url = link && typeof link === 'string' ? link.replace(/<(.+)>/g, '$1') : ''
    const searchString = link
    const voiceChannel = msg.member.voice.channel
    const serverQueue = this.client.getQueue(msg.guild.id)

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
      return this.playlist(msg, url, voiceChannel)
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/watch(.*)$/)) {
      return this.video(msg, url, voiceChannel)
    }

    if (url.match(/^https?:\/\/(www.soundcloud.com|soundcloud.com)\/(.*)\/[a-zA-Z](.*)$/)) {
      return this.soundcloud(msg, url, voiceChannel)
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
    const video = await youtube.getVideo(videos[videoIndex - 1].id)

    handleVideo(video, msg, voiceChannel, this.client)
  }

  async soundcloud (msg: CommandMessage, url: string, voiceChannel: VoiceChannel) {
    const track = await soundcloud.getTrackByUrl(url).catch(() => {
      return
    })

    if (!track) {
      const playlist = await soundcloud.getPlaylistByUrl(url).catch(() => {
        return
      })

      if (!playlist) {
        return msg.channel.send('🆘 I couldn\'t find that SoundCloud item!')
      }

      const response = await msg.channel.send(`🕙 Adding playlist ${playlist.title} to the queue... ${playlist.length >= 100 ? 'This may take a while' : ''}`).catch(() => {
        return
      }) as Message

      await playlist.fetchTracks()

      for (let i = 0; i < playlist.tracks.length; i++) {
        await handleTrack(playlist.tracks[i], msg, voiceChannel, this.client, true).catch(err => {
          console.log(err)
        })
      }

      if (response) {
        return response.edit(`✅ Playlist: **${playlist.title}** has been added to the queue!`)
      }

      return
    }

    return handleTrack(track, msg, voiceChannel, this.client)
  }

  async video (msg: CommandMessage, url: string, voiceChannel: VoiceChannel) {
    const video = await youtube.getVideoByUrl(url).catch(() => {
      return
    })

    if (video) {
      return handleVideo(video, msg, voiceChannel, this.client)
    }

    return msg.channel.send('🆘 I couldn\'t find that video!')
  }

  async playlist (msg: CommandMessage, url: string, voiceChannel: VoiceChannel) {
    const playlist = await youtube.getPlaylistByUrl(url).catch(() => {
      return
    })

    if (!playlist) {
      return msg.channel.send('🆘 I couldn\'t find that playlist!').catch(() => {
        return null
      })
    }

    const responseMsg = await msg.channel.send(`🕙 Adding playlist **${playlist.title}** to the queue... ${playlist.length >= 100 ? 'This may take a while.' : ''}`).catch(() => {
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
        await handleVideo(videos[i], msg, voiceChannel, this.client, true).catch(err => {
          console.log(err)
        })
      }
    }

    if (responseMsg) {
      await responseMsg.edit(`✅ Playlist: **${playlist.title}** has been added to the queue!`)
    }

    return
  }
}

export async function handleTrack (track: Track, msg: CommandMessage, voiceChannel: VoiceChannel, client: MachoClient, playlist = false) {
  const serverQueue = client.getQueue(msg.guild.id)
  const song: Song = {
    id: track.id,
    title: Util.escapeMarkdown(track.title),
    url: track.url,
    member: msg.member,
    votes: [],
    thumbnail: track.artwork,
    soundcloud: true,
    streamUrl: track.streamUrl
  }

  if (!serverQueue) {
    const queueConstruct: ServerQueue = {
      textChannel: msg.channel as TextChannel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
      votes: []
    }

    client.createQueue(msg.guild.id, queueConstruct)
    queueConstruct.songs.push(song)

    const connection = await voiceChannel.join()
    queueConstruct.connection = connection

    play(msg.guild, queueConstruct.songs[0], client)
  } else {
    try {
      client.addSong(msg.guild.id, song)
    } catch (error) {
      return msg.channel.send(`🆘 Error: ${error.message}`)
    }
  }

  if (playlist) {
    return true
  }

  return msg.channel.send(`✅ **${song.title}** has been added to the queue!`).catch(() => {
    return null
  })
}

export async function handleVideo (video: Video, msg: CommandMessage, voiceChannel: VoiceChannel, client: MachoClient, playlist = false) {
  const serverQueue = client.getQueue(msg.guild.id)
  const song: Song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: video.url,
    member: msg.member,
    votes: [],
    thumbnail: video.thumbnails.default.url,
    soundcloud: false,
    streamUrl: video.url
  }

  if (!serverQueue) {
    const queueConstruct: ServerQueue = {
      textChannel: msg.channel as TextChannel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
      votes: []
    }

    client.createQueue(msg.guild.id, queueConstruct)
    queueConstruct.songs.push(song)

    const connection = await voiceChannel.join()
    queueConstruct.connection = connection

    play(msg.guild, queueConstruct.songs[0], client)
  } else {
    try {
      client.addSong(msg.guild.id, song)
    } catch (error) {
      return msg.channel.send(`🆘 Error: ${error.message}`)
    }
  }

  if (playlist) {
    return true
  }

  return msg.channel.send(`✅ **${song.title}** has been added to the queue!`).catch(() => {
    return null
  })
}

async function play (guild: Guild, song: Song, client: MachoClient) {
  const serverQueue = client.getQueue(guild.id)

  if (!song) {
    serverQueue.voiceChannel.leave()
    return client.deleteQueue(guild.id)
  }

  let stream: Readable

  if (song.soundcloud) {
    stream = (await axios.get(song.streamUrl, { responseType: 'stream' })).data
  } else {
    stream = ytdl(song.url)
  }

  const dispatcher = serverQueue.connection.play(stream)
    .on('end', reason => {
      if (reason) console.error(reason)

      serverQueue.songs.shift()
      play(guild, serverQueue.songs[0], client)
    })
    .on('error', error => console.error(error))

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
}

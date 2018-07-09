import * as commando from 'discord.js-commando'
import { oneLine, stripIndents } from 'common-tags'
import { queue } from '../../index'
import { Util, VoiceChannel, TextChannel, Guild } from 'discord.js'
import * as ytdl from 'ytdl-core'
import * as YouTube from 'simple-youtube-api'
import { youtubeKey } from '../../config'
import ec = require('embed-creator')
import { Message } from 'discord.js'
import { ServerQueue } from '../../types/ServerQueue'
import { Song } from '../../types/Song';

const youtube = new YouTube(youtubeKey)

module.exports = class PlayCommand extends commando.Command {
  constructor(client) {
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
      examples: ['play [youtube link or search term]'],
      guildOnly: true,

      args: [{
        key: 'link',
        label: 'youtube link or search term',
        prompt: 'What song would you like to play?',
        type: 'string',
        default: 'unpause it my dude please!',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { link }): Promise<Message> {
    const url = link ? link.replace(/<(.+)>/g, '$1') : ''
    const searchString = link
    const voiceChannel = msg.member.voiceChannel
    const serverQueue = queue.get(msg.guild.id)

    if (!voiceChannel) {
      msg.channel.send('I\'m sorry, but you need to be in a voice channel to play music!')
      return msg.delete()
    }
    const permissions = voiceChannel.permissionsFor(msg.client.user)
    if (!permissions.has('CONNECT')) {
      msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!')
      return msg.delete()
    }
    if (!permissions.has('SPEAK')) {
      msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!')
      return msg.delete()
    }

    if (link === 'unpause it my dude please!') {
      if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()
        msg.channel.send('▶ Resumed the music for you!')
        return msg.delete()
      } else {
        msg.reply(`Nothing is paused. Use \`${(msg.guild as commando.GuildExtension).commandPrefix}play <youtube link or search term>\` to play music.`)
        return undefined
      }
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url)
      let responseMsg = await msg.channel.send(`🕙 Adding playlist **${playlist.title}** to the queue...`) as Message
      const videos = await playlist.getVideos()
      for (const video of videos) {
        if (video.description != 'This video is private.' && video.description != 'This video is unavailable.') {
          try {
            const video2 = await youtube.getVideoByID(video.id) // eslint-disable-line no-await-in-loop
            await handleVideo(video2, msg, voiceChannel, true) // eslint-disable-line no-await-in-loop
          } catch (err) { }
        }
      }
      responseMsg.edit(`✅ Playlist: **${playlist.title}** has been added to the queue!`)
      return msg.delete()
    } else {
      try {
        var video = await youtube.getVideo(url)
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10)
          let index = 0
          let realDesc = stripIndents`
                    	${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`
          msg.channel.send(ec(
            "#4286F4", {
              "name": msg.author.username,
              "icon_url": this.client.user.displayAvatarURL,
              "url": null
            }, 'Song Selection:', realDesc, [], {
              "text": `Please provide a value to select one of the search results ranging from 1-10.`,
              "icon_url": null
            }, {
              "thumbnail": null,
              "image": null
            }, false
          ))
          // eslint-disable-next-line max-depth
          try {
            var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
              maxMatches: 1,
              time: 10000,
              errors: ['time']
            })
          } catch (err) {
            console.error(err)
            msg.channel.send('No or invalid value entered, cancelling video selection.')
            try {
              return msg.delete()
            } catch (err) {
              return
            }
          }
          const videoIndex = parseInt(response.first().content)
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id)
        } catch (err) {
          console.error(err)
          msg.channel.send('🆘 I could not obtain any search results.')
          return msg.delete()
        }
      }
      handleVideo(video, msg, voiceChannel)
      return msg.delete()
    }
  }
}

async function handleVideo(video, msg: commando.CommandMessage, voiceChannel: VoiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id)
  const song: Song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`
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

    var connection = await voiceChannel.join()
    queueConstruct.connection = connection
    play(msg.guild, queueConstruct.songs[0])
  } else {
    serverQueue.songs.push(song)
    if (playlist) return undefined
    else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`)
  }
  return undefined
}

function play(guild: Guild, song: Song) {
  const serverQueue = queue.get(guild.id)

  if (!song) {
    serverQueue.voiceChannel.leave()
    queue.delete(guild.id)
    return
  }

  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', reason => {
      if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.')
      else console.log(reason)
      serverQueue.songs.shift()
      play(guild, serverQueue.songs[0])
    })
    .on('error', error => console.error(error))
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)

  serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`)
}
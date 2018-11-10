import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { api, youtubeKey } from '../../config'
import { getUser, createPlaylist, addSong, getPlaylist, getSong, createSong, removeSong, getUserPlaylists, getGuildSettings } from '../../util'
import { YouTube } from 'better-youtube-api'
import { handleVideo } from './play'
import { MachoCommand } from '../../types'

const youtube = new YouTube(youtubeKey)

export default class PlaylistCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'playlist',
      aliases: [ 'pl' ],
      group: 'music',
      memberName: 'playlist',
      description: 'Allows you to interact with your playlists.',
      details: oneLine`
        Allows you to interact with your playlists.
      `,
      examples: [ 'playlist create dubstep', 'playlist', 'pl play dubstep' ],
      args: [{
        key: 'subcommand',
        label: 'subcommand',
        prompt: 'Would you like to `create`/`play` a playlist, or `add`/`remove` a song from a playlist?',
        type: 'string',
        infinite: false
      },
      {
        key: 'name',
        label: 'name',
        prompt: '',
        type: 'string',
        infinite: true,
        default: -1
      }],
      guildOnly: true
    })
  }

  async run (msg: CommandMessage, { subcommand, name }: { subcommand: string, name: string[] | -1 }): Promise<Message | Message[]> {
    let result: { success: boolean, message?: string, respond?: boolean }

    switch (subcommand.toLowerCase()) {
      case 'help':
        result = await this.viewHelp(msg)
        break
      case 'c':
      case 'create':
        result = await this.create(msg, name)
        break
      case 'p':
      case 'play':
        result = await this.play(msg, name)
        break
      case 'a':
      case 'add':
        result = await this.add(msg, name)
        break
      case 'r':
      case 'remove':
        result = await this.remove(msg, name)
        break
      case 's':
      case 'songs':
        result = await this.songList(msg, name)
        break
      case 'l':
      case 'list':
        result = await this.list(msg, name)
        break
      default:
        result = { success: false, message: subcommand + ` is not a valid subcommand. Type \`${msg.guild.commandPrefix}pl help\` for help.` }
        break
    }

    if (result.respond === false) {
      return
    }

    if (!result.success) {
      return msg.channel.send(`🆘 Failed to execute command: ${result.message}`).catch(() => {
        return null
      })
    }

    return msg.channel.send(`✅ ${result.message}`).catch(() => {
      return null
    })
  }

  async viewHelp (msg: CommandMessage) {
    const commands = [
      '`pl create <name>` - creates a playlist',
      '`pl play <name>` - plays a playlist',
      '`pl add <song link | "this"> to <playlist name>` - adds a song to a playlist',
      '`pl remove <song link | "this"> from <playlist name>` - removes a song from a playlist',
      '`pl songs <name>` - gets the first 20 songs of a playlist',
      '`pl list` - gets the first 20 playlists that you own'
    ]

    const embed = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setTitle('Playlist Commands')
      .setDescription(commands.join('\n'))

    await msg.channel.send(embed).catch(() => {
      return null
    })

    return { success: true, respond: false }
  }

  async list (msg: CommandMessage, nameArray: string[] | -1) {
    const playlists = await getUserPlaylists(msg.author.id)

    if (!playlists) {
      return { success: false, message: 'I can\'t find any playlists to your name.' }
    }

    if (playlists.length > 20) {
      playlists.splice(20, playlists.length - 20)
    }

    const description = playlists.map(playlist => `- \`${playlist.name}\``).join('\n')
    const embed = new MessageEmbed()
      .setTitle(`${msg.author.username}'s Playlists`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(description)

    msg.channel.send(embed)
    return { success: true, respond: false }
  }

  async songList (msg: CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `list` requires an argument `name`.' }
    }

    const user = await getUser(msg.author.id)

    if (!user) {
      return {  success: false, message: 'I don\'t seem to have you in my database. Please try again.' }
    }

    const playlistName = nameArray.join(' ')
    const playlist = await getPlaylist(playlistName, user)

    if (!playlist) {
      return { success: false, message: 'I couldn\'t find that playlist.' }
    }

    if (playlist.songs.length > 20) {
      playlist.songs.splice(20, playlist.songs.length - 20)
    }

    const description = playlist.songs.map(song => `- [${song.title}](${song.url})`).join('\n')
    const embed = new MessageEmbed()
      .setTitle(`Playlist Songs List for ${playlist.name}`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(description)

    msg.channel.send(embed)
    return { success: true, respond: false }
  }

  async create (msg: CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `create` requires an argument `name`.' }
    }

    const user = await getUser(msg.author.id)

    if (!user) {
      return {  success: false, message: 'I don\'t seem to have you in my database. Please try again.' }
    }

    const name = nameArray.join(' ')
    const response = await createPlaylist(name, user)

    if (!response) {
      return { success: false, message: 'Failed to create playlist `' + name + '`, please contact `JasonHaxStuff [num] 2546`.' }
    }

    if (response.error) {
      return { success: false, message: response.error }
    }

    return { success: true, message: 'Created playlist `' + name + '`' }
  }

  async play (msg: CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `play` requires an argument `name`.' }
    }

    if (!msg.member.voice.channel) {
      return { success: false, message: 'You must be in a voice channel to use this command.' }
    }

    const settings = await getGuildSettings(msg.guild.id)

    if (!settings) {
      return { success: false, message: 'I couldn\'t find your guild\'s settings in my database. Try again.' }
    }

    if (settings.voteClearEnabled === false) {
      return { success: false, message: 'This guild has vote clearing disabled, so I cannot allow you to play playlists.' }
    }

    const user = await getUser(msg.author.id)

    if (!user) {
      return {  success: false, message: 'I don\'t seem to have you in my database. Please try again.' }
    }

    const playlistName = nameArray.join(' ')
    const playlist = await getPlaylist(playlistName, user)
    const serverQueue = this.client.getQueue(msg.guild.id)

    if (!playlist) {
      return { success: false, message: 'I couldn\'t find that playlist.' }
    }

    const message = await msg.channel.send(`🕙 Adding ${playlist.name} (${playlist.songs.length} songs) to the queue...`) as Message

    for (let i = 0; i < playlist.songs.length; i++) {
      const video = await youtube.getVideo(playlist.songs[i].id).catch(() => {
        // it's private
      })

      if (video) {
        await handleVideo(video, msg, serverQueue ? serverQueue.voiceChannel : msg.member.voice.channel, this.client, true).catch(err => {
          console.log(err)
        })
      }
    }

    message.edit(`✅ Playlist: **${playlist.name}** has been added to the queue!`)

    return { success: true, respond: false }
  }

  async add (msg: CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `add` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')

    if (!name.includes(' to ')) {
      return { success: false, message: 'Proper format: `pl add <song link | "this"> to <playlist name>`' }
    }

    let songUrl = name.substring(0, name.indexOf(' to '))
    const playlistName = name.substring(name.indexOf(' to ') + 4)

    if (songUrl.length === 0 || playlistName.length === 0) {
      return { success: false, message: 'Proper format: `pl add <song link | "this"> to <playlist name>`' }
    }

    if (songUrl.toLowerCase() === 'this') {
      const serverQueue = this.client.getQueue(msg.guild.id)

      if (!serverQueue || !serverQueue.playing) {
        return { success: false, message: 'There is nothing playing in the server right now.' }
      }

      songUrl = serverQueue.songs[0].url
    }

    songUrl = songUrl.replace(/<(.+)>/g, '$1')
    const video = await youtube.getVideoByUrl(songUrl).catch(() => {
      return
    })

    if (!video) {
      return { success: false, message: 'Couldn\'t quite find a song with that link.' }
    }

    const user = await getUser(msg.author.id)

    if (!user) {
      return { success: false, message: 'I don\'t seem have you in my database. Please try again.' }
    }

    const playlist = await getPlaylist(playlistName, user)

    if (!playlist) {
      return { success: false, message: 'I couldn\'t find that playlist.' }
    }

    let song = await getSong(video.id)

    if (!song) {
      await createSong(video.url, video.title, video.id)
      song = await getSong(video.id)

      if (!song) {
        return { success: false, message: 'I couldn\'t create that song. Please try again.' }
      }
    }

    const response = await addSong(playlist, song)

    if (!response) {
      return { success: false, message: 'The API failed to add the song to the playlist. Please contact `JasonHaxStuff [num] 2546`.' }
    }

    return { success: true, message: `Added \`${song.title}\` to \`${playlist.name}\`.` }
  }

  async remove (msg: CommandMessage, nameArray: string[] | -1) {
    if (nameArray === -1) {
      return { success: false, message: 'Subcommand `delete` requires an argument `name`.' }
    }

    const name = nameArray.join(' ')

    if (!name.includes(' from ')) {
      return { success: false, message: 'Proper format: `pl remove <song link | "this"> from <playlist name>`.' }
    }

    let songUrl = name.substring(0, name.indexOf(' from '))
    const playlistName = name.substring(name.indexOf(' from ') + 6)

    if (songUrl.length === 0 || playlistName.length === 0) {
      return { success: false, message: 'Proper format: `pl delete <song link | "this"> from <playlist name>`.' }
    }

    if (songUrl.toLowerCase() === 'this') {
      const serverQueue = this.client.getQueue(msg.guild.id)

      if (!serverQueue || !serverQueue.playing) {
        return { success: false, message: 'There is nothing playing in the server right now.' }
      }

      songUrl = serverQueue.songs[0].url
    }

    const video = await youtube.getVideoByUrl(songUrl).catch(() => {
      return
    })

    if (!video) {
      return { success: false, message: 'Couldn\'t quite find a song with that link.' }
    }

    const user = await getUser(msg.author.id)

    if (!user) {
      return { success: false, message: 'I don\'t seem have you in my database. Please try again.' }
    }

    const playlist = await getPlaylist(playlistName, user)

    if (!playlist) {
      return { success: false, message: 'I couldn\'t find that playlist.' }
    }

    const song = await getSong(video.id)

    if (!song) {
      return { success: false, message: 'That song isn\'t in that playlist.' }
    }

    const response = await removeSong(playlist, song)

    if (!response) {
      return { success: false, message: 'The API failed to remove the song from the playlist. Please contact `JasonHaxStuff [num] 2546`.' }
    }

    if (response.error) {
      return { success: false, message: response.error }
    }

    return { success: true, message: `Removed \`${song.title}\` from \`${playlist.name}\`` }
  }
}

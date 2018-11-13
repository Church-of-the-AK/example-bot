import { client } from '../index'
import { VoiceState } from 'discord.js'

export async function handleVoiceStateUpdate (oldState: VoiceState, newState: VoiceState) {
  const newMember = newState.member || await newState.guild.members.fetch(newState.id).catch(error => console.log(error))

  if (!newMember) {
    return
  }

  if (newMember.user.bot) {
    return false
  }

  if (oldState.channel && !(newState.channel) && oldState.channel.members.filter(member => !member.user.bot).size <= 0) {
    const serverQueue = client.getQueue(oldState.guild.id)

    if (!serverQueue || oldState.channel.id !== serverQueue.voiceChannel.id) {
      return
    }

    if (serverQueue.playing) {
      const currentSongIndex = serverQueue.songs[0].votes.indexOf(newState.member.id)
      const serverQueueIndex = serverQueue.votes.indexOf(newState.member.id)

      if (currentSongIndex >= 0) {
        serverQueue.songs[0].votes.splice(currentSongIndex, 1)
      }

      if (serverQueueIndex >= 0) {
        serverQueue.votes.splice(serverQueueIndex, 1)
      }

      serverQueue.playing = false
      serverQueue.connection.dispatcher.pause()

      return serverQueue.textChannel.send('⏸ Since everyone has left the voice channel, I\'ve paused the music.').catch(() => {
        return null
      })
    }

    return
  }

  if (!(oldState.channel) && newState.channel && newState.channel.members.filter(member => !member.user.bot).size <= 1) {
    const serverQueue = client.getQueue(oldState.guild.id)

    if (!serverQueue || newState.channel.id !== serverQueue.voiceChannel.id) {
      return
    }

    if (!serverQueue.playing) {
      serverQueue.playing = true
      serverQueue.connection.dispatcher.resume()

      return serverQueue.textChannel.send('▶ Resumed the music for you!').catch(() => {
        return null
      })
    }

    return
  }
}

import { queue } from '../index'
import { VoiceState } from 'discord.js'

export function handleVoiceStateUpdate (oldState: VoiceState, newState: VoiceState) {
  if (newState.member.user.bot) {
    return false
  }

  if (oldState.channel && !(newState.channel) && oldState.channel.members.filter(member => !member.user.bot).size <= 0) {
    const serverQueue = queue.get(oldState.guild.id)

    if (!serverQueue) {
      return
    }

    if (serverQueue.playing) {
      serverQueue.playing = false
      serverQueue.connection.dispatcher.pause()

      return serverQueue.textChannel.send('⏸ Since everyone has left the voice channel, I\'ve paused the music.').catch(() => {
        return null
      })
    }

    return
  }

  if (!(oldState.channel) && newState.channel && newState.channel.members.filter(member => !member.user.bot).size <= 1) {
    const serverQueue = queue.get(oldState.guild.id)

    if (!serverQueue) {
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

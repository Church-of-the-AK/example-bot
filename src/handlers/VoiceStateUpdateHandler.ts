import { queue } from '../index'
import { GuildMember } from 'discord.js'

export function handleVoiceStateUpdate (oldMember: GuildMember, newMember: GuildMember) {
  if (oldMember.user.bot) {
    return false
  }

  if (oldMember.voice.channel && !(newMember.voice.channel) && oldMember.voice.channel.members.size <= 0) {
    const serverQueue = queue.get(oldMember.guild.id)

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

  if (!(oldMember.voice.channel) && newMember.voice.channel && newMember.voice.channel.members.size <= 1) {
    const serverQueue = queue.get(oldMember.guild.id)

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

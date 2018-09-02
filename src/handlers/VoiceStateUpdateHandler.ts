import { GuildMember } from 'discord.js'
import { ServerQueue } from '../types'
import { queue } from '..'

export function handleVoiceStateUpdate (oldMember: GuildMember, newMember: GuildMember) {
  const oldVoice = oldMember.voice.channel
  const newVoice = newMember.voice.channel
  const serverQueue = queue.get(oldMember.guild.id)

  if (!serverQueue) {
    console.log('return false')
    return false
  }

  if (!serverQueue.connection) {
    console.log('return false')
    return false
  }

  if (oldVoice && !newVoice && oldVoice.id === serverQueue.voiceChannel.id) {
    if (serverQueue.voiceChannel.members.size === 0) {
      if (serverQueue.playing) {
        console.log('Pausing')
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        serverQueue.textChannel.send('All users have left the voice channel. The music has been paused.')
      }
    }
  } else if (!oldVoice && newVoice && newVoice.id === serverQueue.voiceChannel.id) {
    if (!serverQueue.playing) {
      console.log('Playing')
      serverQueue.playing = true
      serverQueue.connection.dispatcher.resume()
    }
  }
}

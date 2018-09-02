import { GuildMember } from 'discord.js'
import { ServerQueue } from '../types'

export async function handleVoiceStateUpdate (oldMember: GuildMember, newMember: GuildMember, queue: Map<string, ServerQueue>) {
  const oldVoice = oldMember.voice.channel
  const newVoice = newMember.voice.channel
  let serverQueue: ServerQueue

  if (queue.has(oldMember.guild.id)) {
    serverQueue = queue.get(oldMember.guild.id)
  }

  if (!serverQueue) {
    return false
  }

  if (oldVoice && !newVoice && oldVoice.id === serverQueue.voiceChannel.id) {
    if (serverQueue.voiceChannel.members.size === 0) {
      if (serverQueue.playing) {
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        serverQueue.textChannel.send('All users have left the voice channel. The music has been paused.')
      }
    }
  } else if (!oldVoice && newVoice && newVoice.id === serverQueue.voiceChannel.id) {
    if (!serverQueue.playing) {
      serverQueue.playing = true
      serverQueue.connection.dispatcher.resume()
    }
  }
}

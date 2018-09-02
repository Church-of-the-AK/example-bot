import { GuildMember } from 'discord.js'
import { queue } from '..'

export function handleVoiceStateUpdate (oldMember: GuildMember, newMember: GuildMember) {
  const oldVoice = oldMember.voice
  const newVoice = newMember.voice
  const serverQueue = queue.get(oldMember.guild.id)

  if (!serverQueue || !serverQueue.connection) {
    return false
  }

  if (oldVoice.channel && !newVoice.channel && oldVoice.channel.id === serverQueue.voiceChannel.id) {
    if (serverQueue.voiceChannel.members.size === 0) {
      if (serverQueue.playing) {
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        serverQueue.textChannel.send('All users have left the voice channel. The music has been paused.')
      }
    }
  } else if (!oldVoice.channel && newVoice.channel && newVoice.channel.id === serverQueue.voiceChannel.id) {
    if (!serverQueue.playing) {
      serverQueue.playing = true
      serverQueue.connection.dispatcher.resume()
    }
  }
}

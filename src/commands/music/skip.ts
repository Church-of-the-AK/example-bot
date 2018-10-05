import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js'

export default class SkipCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      aliases: ['skipsong'],
      group: 'music',
      memberName: 'skip',
      description: 'Skip a song from the bot\'s queue.',
      details: oneLine`
        This command is used to skip a song in the current queue
        of songs.
			`,
      examples: ['skip'],
      guildOnly: true
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const serverQueue = queue.get(msg.guild.id)
    const song = serverQueue.songs[0]

    if ((msg.member.id !== song.member.id) && !msg.member.hasPermission('MANAGE_MESSAGES')) {
      return msg.channel.send('You need to have the Manage Messages permission to skip other user\'s songs.').catch(() => {
        return null
      })
    }

    if (!msg.member.voice.channel) {
      return msg.channel.send('You are not in a voice channel!').catch(() => {
        return null
      })
    }

    if (!serverQueue) {
      return msg.channel.send('There is nothing that I can skip for you.').catch(() => {
        return null
      })
    }

    serverQueue.connection.dispatcher.end('Skip command has been used.')

    return msg.channel.send(`Skipped **${song.title}** - Requested by \`${song.member.user.tag}\``).catch(() => {
      return null
    })
  }
}

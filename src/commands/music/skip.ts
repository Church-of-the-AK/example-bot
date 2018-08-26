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
      return msg.channel.send('You need to have the Manage Messages permission to delete other user\'s songs.')
    }

    if (!msg.member.voice.channel) {
      return msg.channel.send('You are not in a voice channel!')
    }

    if (!serverQueue) {
      return msg.channel.send('There is nothing that I can skip for you.')
    }

    serverQueue.connection.dispatcher.end('Skip command has been used.')

    return msg.channel.send(`Skipped \`${song.title}\` - Requested by \`${song.member.nickname ? song.member.nickname : song.member.user.username}\``)
  }
}

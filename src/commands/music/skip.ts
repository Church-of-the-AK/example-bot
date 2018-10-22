import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js'
import { getGuildSettings } from '../../util'
import { ServerQueue, Song } from '../../types'

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

    if (!serverQueue) {
      return msg.channel.send('There is nothing that I can skip for you.').catch(() => {
        return null
      })
    }

    if (!msg.member.voice.channel) {
      return msg.channel.send('You are not in a voice channel!').catch(() => {
        return null
      })
    }

    const song = serverQueue.songs[0]

    if ((msg.member.id === song.member.id) || msg.member.hasPermission('MANAGE_MESSAGES')) {
      return this.skip(serverQueue, msg, song)
    }

    const guildSettings = await getGuildSettings(msg.guild.id)

    if (!guildSettings) {
      return msg.reply('My API may be down. Give me a moment.').catch(() => {
        return null
      })
    }

    if (!guildSettings.voteSkipEnabled) {
      return msg.channel.send('This server doesn\'t have vote skips enabled.').catch(() => {
        return null
      })
    }

    if (song.votes.indexOf(msg.author.id) >= 0) {
      return msg.channel.send('You have already voted to skip this song.').catch(() => {
        return null
      })
    }

    song.votes.push(msg.member.id)
    const reply = await msg.channel.send(`There are now ${song.votes.length} votes to skip this song. `).catch(() => {
      return null
    })

    if (song.votes.length >= msg.member.voice.channel.members.size / 2) {
      return this.skip(serverQueue, msg, song)
    }

    if (reply) {
      return reply.edit(reply.content + 'You still need ' + Math.floor(msg.member.voice.channel.members.size / 2) + ' more votes to skip this song.').catch(() => {
        return null
      })
    }
  }

  skip (serverQueue: ServerQueue, msg: commando.CommandMessage, song: Song) {
    serverQueue.connection.dispatcher.end('Skip command has been used.')

    return msg.channel.send(`Skipped **${song.title}** - Requested by \`${song.member.user.tag}\``).catch(() => {
      return null
    })
  }
}

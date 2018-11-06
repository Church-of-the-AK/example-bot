import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { getGuildSettings } from '../../util'
import { ServerQueue, Song, MachoCommand } from '../../types'

export default class SkipCommand extends MachoCommand {
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
      examples: [ 'skip' ],
      guildOnly: true,
      args: [{
        key: 'amount',
        label: 'amount',
        prompt: '',
        type: 'integer',
        default: 1,
        validate: amount => amount > 0
      }]
    })
  }

  async run (msg: CommandMessage, { amount }: { amount: number }): Promise<Message | Message[]> {
    const serverQueue = this.client.getQueue(msg.guild.id)

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

    if ((msg.member.id === song.member.id) || msg.member.hasPermission('MANAGE_MESSAGES') || this.client.isOwner(msg.author)) {
      return this.skip(serverQueue, msg, song, amount)
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

    if (song.votes.length >= msg.member.voice.channel.members.filter(member => !member.user.bot).size / 2) {
      return this.skip(serverQueue, msg, song, 1)
    }

    if (reply) {
      return reply.edit(reply.content + 'You still need ' + Math.floor(msg.member.voice.channel.members.filter(member => !member.user.bot).size / 2 - song.votes.length) + ' more votes to skip this song.').catch(() => {
        return null
      })
    }
  }

  skip (serverQueue: ServerQueue, msg: CommandMessage, song: Song, amount: number) {
    serverQueue.songs = serverQueue.songs.filter((song, index) => index - amount >= -1)
    serverQueue.connection.dispatcher.end('Skip command has been used.')

    if (amount > 1) {
      return msg.channel.send(`Skipped **${song.title}** - Requested by \`${song.member.user.tag}\` + ${amount - 1} more songs.`).catch(() => {
        return null
      })
    }

    return msg.channel.send(`Skipped **${song.title}** - Requested by \`${song.member.user.tag}\`.`).catch(() => {
      return null
    })
  }
}

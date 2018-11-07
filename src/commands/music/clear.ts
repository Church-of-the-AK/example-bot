import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { ServerQueue } from '../../types/ServerQueue'
import { getGuildSettings } from '../../util'
import { MachoCommand } from '../../types'

export default class ClearCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'clear',
      aliases: ['clearqueue'],
      group: 'music',
      memberName: 'clear',
      description: 'Clear the queue for the server.',
      details: oneLine`
        This command is used to skip every song in
        the current queue.
			`,
      examples: ['clear'],
      guildOnly: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const serverQueue: ServerQueue = this.client.getQueue(msg.guild.id)
    const guildSettings = await getGuildSettings(msg.guild.id)

    if (!guildSettings) {
      return msg.reply('My API may be down. Give me a moment.').catch(() => {
        return null
      })
    }

    if (!serverQueue) {
      return msg.channel.send('The queue is already empty.').catch(() => {
        return null
      })
    }

    if (msg.member.hasPermission('MANAGE_MESSAGES') || this.client.isOwner(msg.author)) {
      return this.clear(serverQueue, msg)
    }

    if (!msg.member.voice.channel) {
      return msg.channel.send('You are not in a voice channel!').catch(() => {
        return null
      })
    }

    if (!guildSettings.voteClearEnabled) {
      return msg.channel.send('This server doesn\'t have vote clears enabled.').catch(() => {
        return null
      })
    }

    if (serverQueue.votes.indexOf(msg.author.id) >= 0) {
      return msg.channel.send('You have already voted to clear the queue.').catch(() => {
        return null
      })
    }

    serverQueue.votes.push(msg.author.id)
    const reply = await msg.channel.send(`There are now ${serverQueue.votes.length} votes to clear the queue. `).catch(() => {
      return null
    })

    if (serverQueue.votes.length >= msg.member.voice.channel.members.filter(member => !member.user.bot).size / 2) {
      return this.clear(serverQueue, msg)
    }

    if (reply) {
      return reply.edit(reply.content + 'You still need ' + Math.floor(msg.member.voice.channel.members.filter(member => !member.user.bot).size / 2) + ' more votes to clear the queue.').catch(() => {
        return null
      })
    }
  }

  clear (serverQueue: ServerQueue, msg: CommandMessage) {
    serverQueue.connection.dispatcher.end('Clear command has been used.')
    serverQueue.voiceChannel.leave()
    this.client.deleteQueue(msg.guild.id)

    return msg.channel.send('Cleared the queue.').catch(() => {
      return null
    })
  }
}

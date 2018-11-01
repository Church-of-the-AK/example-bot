import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'
import { shuffle } from '../../util'

export default class ShuffleCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'shuffle',
      aliases: [ 'shufflesongs', 'mix' ],
      group: 'music',
      memberName: 'shuffle',
      description: 'Shuffle the queue for the server.',
      details: oneLine`
        This command is used to shuffle the current queue.
			`,
      examples: [ 'shuffle', 'shufflesongs', 'mix' ],
      guildOnly: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const serverQueue = this.client.getQueue(msg.guild.id)

    if (!serverQueue) {
      return msg.channel.send('There is no queue to shuffle. Why don\'t you play something?').catch(() => {
        return null
      })
    }

    const shuffled = shuffle(serverQueue.songs.splice(1, serverQueue.songs.length - 1))
    shuffled.unshift(serverQueue.songs[0])
    serverQueue.songs = shuffled

    return msg.channel.send('🔀 Shuffled the music for you!').catch(() => {
      return null
    })
  }
}

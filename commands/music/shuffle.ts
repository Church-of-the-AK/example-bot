import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js'

module.exports = class ShuffleCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      aliases: ['shufflesongs', 'mix'],
      group: 'music',
      memberName: 'shuffle',
      description: 'Shuffle the queue for the server.',
      details: oneLine`
        This command is used to shuffle the current queue.
			`,
      examples: ['shuffle', 'shufflesongs', 'mix']
    })
  }

  async run(msg: commando.CommandMessage): Promise<Message> {
    if (msg.channel.type != 'text') {
      msg.reply(`This command can only be used in a server!`)
      return undefined
    }
    const serverQueue = queue.get(msg.guild.id)
    if (serverQueue) {
      let songs2 = []
      for (let i = 1; i < serverQueue.songs.length; i++) {
        songs2.push(serverQueue.songs[i])
      }
      songs2 = shuffle(songs2)
      songs2.unshift(serverQueue.songs[0])
      serverQueue.songs = songs2
      msg.channel.send('🔀 Shuffled the music for you!')
      return msg.delete()
    }
    msg.channel.send('There is no queue to shuffle, you nerd.')
    return msg.delete()
  }
}

function shuffle(a: any[]) {
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

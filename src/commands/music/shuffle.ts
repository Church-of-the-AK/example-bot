import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { queue } from '../../index'
import { Message } from 'discord.js'

export default class ShuffleCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'shuffle',
      aliases: ['shufflesongs', 'mix'],
      group: 'music',
      memberName: 'shuffle',
      description: 'Shuffle the queue for the server.',
      details: oneLine`
        This command is used to shuffle the current queue.
			`,
      examples: ['shuffle', 'shufflesongs', 'mix'],
      guildOnly: true
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const serverQueue = queue.get(msg.guild.id)

    if (!serverQueue) {
      return msg.channel.send('There is no queue to shuffle.')
    }

    let shuffled = []

    for (let i = 1; i < serverQueue.songs.length; i++) {
      shuffled.push(serverQueue.songs[i])
    }

    shuffled = shuffle(shuffled)
    shuffled.unshift(serverQueue.songs[0])
    serverQueue.songs = shuffled

    return msg.channel.send('🔀 Shuffled the music for you!')
  }
}

function shuffle (a: any[]) {
  let j
  let x
  let i

  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

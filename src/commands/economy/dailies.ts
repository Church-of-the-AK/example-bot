import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { api } from '../../config'
import * as numeral from 'numeral'
import axios from 'axios'
import { getUser } from '../../util'

export default class DailiesCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'dailies',
      aliases: ['daily', 'freemoney'],
      group: 'economy',
      memberName: 'dailies',
      description: 'Gives you your 200 daily credits.',
      details: oneLine`
        Gives you your 200 daily credits. Can be used once every 24
        hours.
			`,
      examples: ['dailies', 'daily', 'freemoney']
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const user = await getUser(msg.author.id)
    let diffHrs: number

    if (!user) {
      return msg.reply('I couldn\'t find you in my database, please try again.')
    }

    if (user.balance.dateClaimedDailies) {
      diffHrs = Math.abs(new Date().getTime() - parseInt(user.balance.dateClaimedDailies)) / 36e5
    } else {
      diffHrs = 24
    }

    if (diffHrs < 24) {
      const hours = parseFloat(numeral(24 - diffHrs).format('0'))
      const minutes = parseFloat(numeral(24 - diffHrs).format('.00')) * 100 * .6

      return msg.channel.send(`**${user.name}**, you still have **${hours}** hours and ${minutes} minutes until you can claim your dailies again.`)
    }

    user.balance.balance += 200
    user.balance.netWorth += 200
    user.balance.dateClaimedDailies = new Date().getTime().toString()

    msg.channel.send(`**${user.name}**, you have claimed your **200** daily credits!`)

    await axios.put(`${api.url}/users/${msg.author.id}/balance&code=${api.code}`, user.balance)
    return msg.delete()
  }
}

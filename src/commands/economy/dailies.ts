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
        hours.`,
      examples: ['dailies', 'daily', 'freemoney']
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const user = await getUser(msg.author.id)
    let diffHrs: number

    if (!user) {
      return msg.reply('I couldn\'t find you in my database, please try again.').catch(() => {
        return null
      })
    }

    if (user.balance.dateClaimedDailies) {
      diffHrs = Math.abs(new Date().getTime() - parseInt(user.balance.dateClaimedDailies)) / 36e5
    } else {
      diffHrs = 24
    }

    if (diffHrs < 24) {
      const hours = Math.floor(24 - diffHrs)
      const minutes = (parseFloat(numeral(24 - diffHrs).format('.00')) * 100 * .6).toFixed(0)

      return msg.channel.send(`**${user.name}**, you still have **${hours}** hours and **${minutes}** minutes until you can claim your dailies again.`).catch(() => {
        return null
      })
    }

    user.balance.balance += 200
    user.balance.netWorth += 200
    user.balance.dateClaimedDailies = new Date().getTime().toString()

    await msg.channel.send(`**${user.name}**, you have claimed your **200** daily credits!`).catch(() => {
      return
    })

    await axios.put(`${api.url}/users/${msg.author.id}/balance&code=${api.code}`, user.balance).catch(error => {
      console.log(error)
    })
  }
}

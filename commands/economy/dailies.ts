import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { code } from '../../config'
import { MachoAPIUser } from '../../types/MachoAPIUser'
import * as numeral from 'numeral'
import axios from 'axios'

module.exports = class DailiesCommand extends commando.Command {
  constructor(client) {
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

  async run(msg: commando.CommandMessage): Promise<Message | Message[]> {
    let { data: user }: { data: MachoAPIUser } = await axios.get(`http://localhost:8000/users/${msg.author.id}`)
    let diffHrs

    if (user.balance.dateclaimeddailies) {
      diffHrs = Math.abs(new Date().getTime() - parseInt(user.balance.dateclaimeddailies)) / 36e5
    } else {
      diffHrs = 24
    }

    if (diffHrs >= 24) {
      user = this.claimDailies(user)

      msg.channel.send(`**${user.name}**, you have claimed your **200** daily credits!`)
    } else {
      const waitTime = parseFloat(numeral(24 - diffHrs).format('0.00'))

      return msg.channel.send(`**${user.name}**, you still have **${waitTime}** hours until you can claim your dailies again.`)
    }

    await axios({
      method: 'put',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: `http://localhost:8000/users/${msg.author.id}&code=${code}`,
      data: user
    })

    return msg.delete()
  }

  claimDailies(user: MachoAPIUser): MachoAPIUser {
    user.balance.balance = `${parseInt(user.balance.balance) + 200}`
    user.balance.networth = `${parseInt(user.balance.networth) + 200}`
    user.balance.dateclaimeddailies = `${new Date().getTime()}`

    return user
  }
}

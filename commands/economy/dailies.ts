import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as request from 'request'
import * as numeral from 'numeral'
import { Message } from 'discord.js'
import { code } from '../../config'
import { MachoAPIUser } from '../../types/MachoAPIUser'

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

  async run(msg: commando.CommandMessage): Promise<Message> {
    let user: MachoAPIUser
    request.get(
      `http://localhost:8000/users/${msg.author.id}`,
      function optionalCallback(err, httpResponse, body) {
        if (body === '[]') {
          return msg.reply(
            `It seems as if I didn't have you in the database. Please try again.`
          )
        }
        user = JSON.parse(body)
        if (user.balance.dateclaimeddailies) {
          let diffHrs =
            Math.abs(
              new Date().getTime() - parseInt(user.balance.dateclaimeddailies)
            ) / 36e5
          if (diffHrs >= 24) {
            user.balance.balance = `${parseInt(user.balance.balance) + 200}`
            user.balance.networth = `${parseInt(user.balance.networth) + 200}`
            user.balance.dateclaimeddailies = `${new Date().getTime()}`
            msg.channel.send(
              `**${user.name}**, you have claimed your **200** daily credits!`
            )
          } else {
            let waitTime = parseFloat(numeral(24 - diffHrs).format('0.00'))
            msg.channel.send(
              `**${
                user.name
              }**, you still have **${waitTime}** hours until you can claim your dailies again.`
            )
          }
        } else {
          user.balance.balance = `${parseInt(user.balance.balance) + 200}`
          user.balance.networth = `${parseInt(user.balance.networth) + 200}`
          user.balance.dateclaimeddailies = `${new Date().getTime()}`
          msg.channel.send(
            `**${user.name}**, you have claimed your **200** daily credits!`
          )
        }

        let options = {
          method: 'PUT',
          url: `http://localhost:8000/users/${msg.author.id}&code=${code}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          form: user
        }

        request(options, function(error, response, body) {
          if (error) throw new Error(error)
        })
      }
    )
    msg.delete()
    return undefined
  }
}

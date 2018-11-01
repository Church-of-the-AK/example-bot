import speedTest from 'speedtest-net'
import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'

export default class SpeedTestCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'speedtest',
      aliases: [ 'speed', 'internet' ],
      group: 'member',
      memberName: 'speedtest',
      description: 'Gives you the result of an internet speedtest.',
      details: oneLine`
        Gives you the result of an internet speedtest.
			`,
      examples: [ 'speedtest', 'speed' ],
      throttling: {
        duration: 60,
        usages: 1
      }
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const test = speedTest({ maxTime: 5000 })
    const result = await msg.channel.send('🕙 Getting results...') as Message

    test.on('data', speedInfo => {
      const message = `Speeds:
      Download: ${speedInfo.speeds.download} mbps
      Upload: ${speedInfo.speeds.upload} mbps
    Client:
      ISP: ${speedInfo.client.isp} (${speedInfo.client.isprating}/5 stars)
    Hosting:
      Host: ${speedInfo.server.sponsor}
      Location: ${speedInfo.server.location} (${speedInfo.server.distance} km)
      Ping: ${speedInfo.server.ping} ms`

      return result.edit(message)
    })

    test.on('error', err => {
      console.error(err)
      return result.edit('Well, this is embarassing. There was an error, try again later.')
    })

    return result
  }
}

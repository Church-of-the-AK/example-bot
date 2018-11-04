import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'
import { parse } from 'node-html-parser'
import axios from 'axios'

export default class R34Command extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'r34',
      aliases: [ 'rule34' ],
      group: 'nsfw',
      memberName: 'r34',
      description: 'Sends a random image from the Rule 34 website.',
      details: oneLine`
        Sends a random image from the Rule 34 website.
      `,
      examples: [ 'r34' ],
      guildOnly: false,
      nsfw: true
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const { data } = await axios.get('https://rule34.xxx/index.php?page=post&s=random', { responseType: 'text' })
    const html = parse(data)
    const image = html.querySelector('#image')
    // @ts-ignore
    const attachment = new MessageAttachment(image.src)

    return msg.channel.send(attachment)
  }
}

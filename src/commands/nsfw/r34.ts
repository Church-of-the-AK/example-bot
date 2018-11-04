import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'
import { parse, Node } from 'node-html-parser'
import axios from 'axios'
import { randomItem } from '../../util'

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
      nsfw: true,
      args: [{
        key: 'search',
        label: 'search',
        prompt: '',
        type: 'string',
        default: -1,
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { search }: { search: string | -1 }): Promise<Message | Message[]> {
    if (search !== -1) {
      search = search.replace(' ', '_')
    }

    const { data } = await axios.get(`https://rule34.xxx/index.php?page=post&s=${search === -1 ? 'random' : `list&tags=${search}`}`, { responseType: 'text' })
    const html = parse(data)

    let link: string

    if (search === -1) {
      const image = html.querySelector('#image')

      // @ts-ignore
      link = image.rawAttrs.substring(image.rawAttrs.indexOf('src="') + 5, image.rawAttrs.indexOf('"', image.rawAttrs.indexOf('src="') + 5))
    } else {
      // @ts-ignore
      const thumbnail = randomItem(html.childNodes.filter(node => node.rawAttrs.includes('class="preview"')))

      // @ts-ignore
      link = thumbnail.rawAttrs.substring(thumbnail.rawAttrs.indexOf('src="') + 5, thumbnail.rawAttrs.indexOf('"', thumbnail.rawAttrs.indexOf('src="') + 5))
      const { data } = await axios.get(link.substring(link.indexOf('?') + 1, link.length))
      const newHtml = parse(data)
      const image = newHtml.querySelector('#image')

      // @ts-ignore
      link = image.rawAttrs.substring(image.rawAttrs.indexOf('src="') + 5, image.rawAttrs.indexOf('"', image.rawAttrs.indexOf('src="') + 5))
    }

    const attachment = new MessageAttachment(link)

    return msg.channel.send(attachment)
  }
}

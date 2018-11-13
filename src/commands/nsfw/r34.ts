import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'
import { parse, Node, HTMLElement, TextNode, NodeType } from 'node-html-parser'
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
      examples: [ 'r34', 'r34 sans' ],
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

    const response = await axios.get(`https://rule34.xxx/index.php?page=post&s=${search === -1 ? 'random' : `list&tags=${search}`}`, { responseType: 'text' }).catch(error => console.log(error))

    if (!response) {
      return msg.channel.send('🆘 Error searching for r34 stuff. Not on my end.')
    }

    const html = parse(response.data)

    let link: string

    if (search === -1) {
      const image = html.querySelector('#image')

      // @ts-ignore
      link = image.rawAttrs.substring(image.rawAttrs.indexOf('src="') + 5, image.rawAttrs.indexOf('"', image.rawAttrs.indexOf('src="') + 5))
    } else {
      const nodes = getChildNodes(html)
      const elements = getElements(nodes)
      const images = getImages(elements)

      if (images.length === 0) {
        return msg.channel.send('🆘 I couldn\'t find any images with that tag.')
      }

      const thumbnail: string = randomItem(images)
      const response = await axios.get('https://rule34.xxx/index.php?page=post&s=view&id=' + thumbnail.substring(thumbnail.indexOf('?') + 1, thumbnail.length), { responseType: 'text' }).catch(error => console.log(error))

      if (!response) {
        link = thumbnail
      } else {
        const newHtml = parse(response.data)
        const image = newHtml.querySelector('#image')

        // @ts-ignore
        link = image.rawAttrs.substring(image.rawAttrs.indexOf('src="') + 5, image.rawAttrs.indexOf('"', image.rawAttrs.indexOf('src="') + 5))
      }
    }

    const attachment = new MessageAttachment(link)

    return msg.channel.send(attachment)
  }
}

function getImages (elements: HTMLElement[]) {
  const results: string[] = []

  elements.forEach(element => {
    if (element.tagName === 'img') {
      const attributes = element.rawAttributes

      if (attributes.src && attributes.class === 'preview') {
        results.push(attributes.src)
      }
    }
  })

  return results
}

function getChildNodes (data: Node | TextNode) {
  const nodes: Node[] = []

  if (data.childNodes.length > 0) {
    for (const node of data.childNodes) {
      if (node.childNodes.length > 0) {
        nodes.push(...getChildNodes(node))
      } else {
        nodes.push(node)
      }
    }
  }

  return nodes
}

function getElements (nodes: Node[]) {
  const results: HTMLElement[] = []

  nodes.forEach(node => {
    if (node.nodeType === NodeType.ELEMENT_NODE) {
      results.push(node as HTMLElement)
    } else {
      nodes.push(...getChildNodes(node as TextNode))
    }
  })

  return results
}

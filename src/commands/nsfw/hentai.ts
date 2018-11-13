import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'
import { parse, Node, HTMLElement, TextNode, NodeType } from 'node-html-parser'
import axios from 'axios'
import { randomItem } from '../../util'

export default class HentaiCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'hentai',
      group: 'nsfw',
      memberName: 'hentai',
      description: 'Sends a random image from the Konachan website.',
      details: oneLine`
        Sends a random image from the Konachan website.
      `,
      examples: [ 'hentai breasts', 'hentai' ],
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

    const response = await axios.get(`https://konachan.com/post?tags=${'order%3Arandom+' + (search === -1 ? 'nude' : search)}`, { responseType: 'text' }).catch(error => console.log(error))

    if (!response) {
      return msg.channel.send('🆘 Error searching for hentai, not on my end.')
    }

    const html = parse(response.data)

    const nodes = getChildNodes(html)
    const elements = getElements(nodes)
    const images = getImages(elements)

    if (images.length === 0) {
      return msg.channel.send(' I couldn\'t find any images with that tag.')
    }

    const thumbnail: string = randomItem(images)
    const attachment = new MessageAttachment(thumbnail)

    return msg.channel.send(attachment)
  }
}

function getImages (elements: HTMLElement[]) {
  const results: string[] = []

  elements.forEach(element => {
    if (element.tagName === 'img') {
      const attributes = element.rawAttributes

      if (attributes.src && attributes.class && attributes.class.includes('preview')) {
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

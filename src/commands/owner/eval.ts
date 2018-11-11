import { inspect } from 'util'
import { MachoCommand } from '../../types'
import { CommandMessage } from 'discord.js-commando'
import { MessageEmbed } from 'discord.js'
import Axios from 'axios'
import { YouTube } from 'better-youtube-api'
import { SoundCloud } from 'better-soundcloud-api'
import { youtubeKey, soundcloudKey } from '../../config'
import * as Util from '../../util'

const youtube = new YouTube(youtubeKey)
const soundcloud = new SoundCloud(soundcloudKey)

const nl = '!!NL!!'
const nlPattern = new RegExp(nl, 'g')

export default class EvalCommand extends MachoCommand {
  public lastResult: any
  public hrStart: [ number, number ]

  constructor (client) {
    super(client, {
      name: 'eval',
      group: 'util',
      memberName: 'eval',
      description: 'Executes JavaScript code.',
      details: 'Only the bot owner(s) may use this command.',
      ownerOnly: true,

      args: [
        {
          key: 'script',
          prompt: 'What code would you like to evaluate?',
          type: 'string'
        }
      ]
    })

    this.lastResult = null
  }

  async run (msg: CommandMessage, args) {
    const message = msg
    const client = this.client
    const objects = client.registry.evalObjects
    const lastResult = this.lastResult
    const axios = Axios
    const util = Util
    const doReply = val => {
      if (val instanceof Error) {
        msg.reply(`Callback error: \`${val}\``)
      } else {
        const result = this.makeResultMessages(val, process.hrtime(this.hrStart))
        if (Array.isArray(result)) {
          for (const item of result) msg.reply(item)
        } else {
          msg.reply(result)
        }
      }
    }

    let hrDiff

    try {
      const hrStart = process.hrtime()
      this.lastResult = await Promise.resolve(eval(args.script))

      hrDiff = process.hrtime(hrStart)
    } catch (err) {
      return msg.reply(`Error while evaluating: \`${err}\``)
    }

    this.hrStart = process.hrtime()
    const result = this.makeResultMessages(this.lastResult, hrDiff, args.script)

    if (Array.isArray(result)) {
      result.map(item => msg.reply(item))
    } else if (result.output) {
      const fields = [ { name: 'Output', value: result.output } ]

      if (result.input) {
        const output = fields.pop()
        fields.push({ name: 'Input', value: result.input })
        fields.push(output)
      }

      const embed = new MessageEmbed({ description: result.none, fields })
      return msg.channel.send(`<@${msg.author.id}>`, { split: result.options, embed })
    } else {
      const haste = await Util.createHaste(result.longOutput, 'js')
      const fields = [ { name: 'Output', value: haste } ]

      if (result.input) {
        const output = fields.pop()
        fields.push({ name: 'Input', value: result.input })
        fields.push(output)
      }

      const embed = new MessageEmbed({ description: result.none, fields })
      return msg.channel.send(`<@${msg.author.id}>`, { split: result.options, embed })
    }
  }

  makeResultMessages (result, hrDiff, input = null) {
    const inspected = inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--')
    const split = inspected.split('\n')
    const last = inspected.length - 1
    const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0]
    const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last]
    const prepend = `\`\`\`js\n${prependPart}\n`
    const append = `\n${appendPart}\n\`\`\``
    if (input && inspected.length <= 1000) {
      return {
        none: `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`,
        input: `\`\`\`js\n${input}\n\`\`\``,
        output: `\`\`\`js\n${inspected}\n\`\`\``,
        options: { prepend, append } }
    } else if (!input) {
      return {
        none: `*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`,
        output: `\`\`\`js\n${inspected}\n\`\`\``,
        options: { prepend, append }
      }
    } else {
      return {
        input: `\`\`\`js\n${input}\n\`\`\``,
        longOutput: inspected,
        options: { prepend, append }
      }
    }
  }

  get sensitivePattern () {
    // @ts-ignore
    if (!this._sensitivePattern) {
      const client = this.client
      let pattern = ''
      if (client.token) pattern += escapeRegex(client.token)
      Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') })
    }
    // @ts-ignore
    return this._sensitivePattern
  }
}

function escapeRegex (str) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageAttachment } from 'discord.js'
import { MachoCommand } from '../../types'

export default class GamersCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'gamers',
      aliases: [ 'gamer', 'oppression' ],
      group: 'member',
      memberName: 'gamers',
      description: 'Tells you the truth.',
      details: oneLine`
        Tells you the truth.
			`,
      examples: [ 'gamers', 'oppression' ]
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const message = oneLine`
Gamers are arguably one of the most persecuted classes in history. Unlike minorities, nobody has ever received a job or scholarship solely because they're a gamer.
In fact, there has never even been the opportunity for a gamer to self-identify as such on any sort of job application, college application, or standardized test form.
Furthermore, whereas minorities are widely considered to embody coolness and attractiveness by virtue of their race, gamers have been historically stereo-typed as nerdy
and unattractive since the dawn of our craft. When minorities speak out in the media about whitewashing, appropriation, and similar intrusions into their exclusive culture
and values, they are universally lauded. However, when a gamer raises a comparable concern about our community, we are branded as sexist, racist, misogynistic, and similar
slurs, and accused of overreacting. Gamers are undeniably subject to excessive and extremely detrimental discrimination. The same cannot be said for racial minorities.`

    const attachment = new MessageAttachment('images/gamer.jpg')
    return msg.channel.send(message, attachment).catch(() => {
      return null
    })
  }
}

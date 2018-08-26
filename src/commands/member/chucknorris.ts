import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import axios from 'axios'
import { AllHtmlEntities } from 'html-entities'
import { Message } from 'discord.js'

export default class ChuckNorrisCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'chucknorris',
      aliases: ['cnjoke', 'chuckjoke'],
      group: 'member',
      memberName: 'chucknorris',
      description: 'Tells you a random joke involving Chuck Norris.',
      details: oneLine`
        This command is used to tell you a random joke involving Chuck Norris...
        That's it.
			`,
      examples: ['chucknorris', 'cnjoke']
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const { data: joke } = await axios.get('http://api.icndb.com/jokes/random')
    const decoded = AllHtmlEntities.decode(joke.value.joke)

    msg.reply(decoded)

    return msg.delete()
  }
}

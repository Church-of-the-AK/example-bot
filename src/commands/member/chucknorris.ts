import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import axios from 'axios'
import { AllHtmlEntities } from 'html-entities'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'

export default class ChuckNorrisCommand extends MachoCommand {
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

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const { data: joke } = await axios.get('http://api.icndb.com/jokes/random').catch(error => {
      console.log(error)
      return { data: 'Error retrieving a joke from the database.' }
    })
    const decoded = AllHtmlEntities.decode(joke.value.joke)

    return msg.reply(decoded).catch(() => {
      return null
    })
  }
}

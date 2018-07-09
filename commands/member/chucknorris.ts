import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as request from 'request'
import { AllHtmlEntities } from 'html-entities'
import { Message } from 'discord.js';

module.exports = class ChuckNorrisCommand extends commando.Command {
  constructor(client) {
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
      examples: ['chucknorris', 'cnjoke'],
    })
  }

  async run(msg: commando.CommandMessage): Promise<Message> {
    request.get({
      url: 'http://api.icndb.com/jokes/random',
      json: true,
      headers: {
        'User-Agent': 'request'
      }
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        let joke = AllHtmlEntities.decode(data.value.joke)

        msg.reply(joke)
      }
    });
    msg.delete()
    return undefined
  }
}

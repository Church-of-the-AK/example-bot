import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, MessageEmbed } from 'discord.js'
import { api } from '../../config'
import { MachoCommand } from '../../types'

export default class LegalCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'legal',
      aliases: [ 'privacy' ],
      group: 'member',
      memberName: 'legal',
      description: 'Tells you the bot\'s legal stuff.',
      details: oneLine`
        Tells you The bot's legal stuff.
			`,
      examples: [ 'legal', 'privacy' ]
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const description = oneLine`
"The Bot" refers to ${this.client.user.tag} and "The Developer" refers to ${this.client.owners[0].tag}.
The Bot stores non-identifying information publicly, via The Developer's [API](${api.url}/users/${msg.author.id})
At any time, you can use the \`${msg.guild.commandPrefix}delete\` command to delete any user data The Bot has of you.
By being a member of a guild with The Bot in it, you agree to have this non-identifying information stored publicly.` + '\n\n' +
oneLine`
THE BOT IS PROVIDED "AS IS", WITHOUT
WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE DEVELOPER OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE BOT OR THE USE OR OTHER
DEALINGS IN THE BOT.`

    const embed = new MessageEmbed()
      .setTitle(`Legal`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setDescription(description)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}

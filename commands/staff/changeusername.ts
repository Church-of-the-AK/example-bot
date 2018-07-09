import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class ChangeUsernameCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'changeusername',
      aliases: ['changename', 'changebotname'],
      group: 'staff',
      memberName: 'changeusername',
      description: 'Changes the username of the bot.',
      details: oneLine`
				This is an incredibly useful command that changes the username of the bot.
				Only usable by the owner, JasonHaxStuff.
			`,
      examples: ['changeusername ILikeDogs', 'changename KillMeNow'],

      args: [{
        key: 'name',
        label: 'name',
        prompt: 'What would you like to name the bot?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { name }): Promise<Message> {
    if (msg.author.id == "176785428450377728") {
      this.client.user.setUsername(name)
      let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
      if (channel) {
        channel.send(`${msg.author.username} has changed ${this.client.user.username}'s name to ${name}.`)
      }
      let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
      Logger.log(`\r\n[${time}] ${msg.author.username} has changed ${this.client.user.username}'s name to ${name}.`)
      const reply = await msg.reply(`Succesfully changed my username to ${name}!`) as Message
      reply.delete(3000)
      if (msg.channel.type == 'text') {
        msg.delete()
      }
    } else {
      const reply = await msg.reply("Sorry, but you can't do that.") as Message
      reply.delete(3000)
      if (msg.channel.type == 'text') {
        msg.delete()
      }
    }
    return undefined
  }
}

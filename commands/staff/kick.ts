import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class KickCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      aliases: ['kickuser'],
      group: 'staff',
      memberName: 'kick',
      description: 'Kicks a mentioned user.',
      details: oneLine`
        This command is used to kick a user that is mentioned. 
        Very useful indeed.
			`,
      examples: ['kick @JasonHaxStuff', 'kickuser @KillMeNow'],
      guildOnly: true,

      args: [{
        key: 'mention',
        label: 'mention',
        prompt: 'Who would you like to kick?',
        type: 'user',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { mention }): Promise<Message> {
    if (msg.channel.type != "text") {
      const reply = await msg.reply("This command can only be used in a server.") as Message
      reply.delete(3000)
    }
    if (msg.member.hasPermission("KICK_MEMBERS")) {
      let memberKicked = msg.guild.member(mention)
      try {
        memberKicked.kick()
        let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
        if (channel) {
          channel.send(`${msg.author.username} has kicked ${memberKicked} from ${msg.guild.name}.`)
        }
        let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
        Logger.log(`\r\n[${time}] ${msg.author.username} has kicked ${memberKicked} from ${msg.guild.name}.`)
      } catch (err) {
        const reply = await msg.reply(`Yo ${msg.author} I couldn't kick because of this stupid thing: ${err}`) as Message
        reply.delete(3000)
        msg.delete()
      }
      const reply = await msg.reply(mention.tag + " has been kicked!") as Message
      reply.delete(3000)
      msg.delete()
    } else {
      const reply = await msg.reply("Sorry, but you're a nerd and can't kick members.") as Message
      reply.delete(3000)
      msg.delete()
    }
    return undefined
  }
}

import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class BanCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['banuser', 'banhammer'],
      group: 'staff',
      memberName: 'ban',
      description: 'Bans a mentioned user.',
      details: oneLine`
        This command is used to ban a user that is mentioned.
        Very useful indeed.
			`,
      examples: ['ban @JasonHaxStuff', 'banhammer @KillMeNow'],
      guildOnly: true,

      args: [{
        key: 'mention',
        label: 'mention',
        prompt: 'Who would you like to ban?',
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
    if (msg.member.hasPermission("BAN_MEMBERS")) {
      let memberBanned = msg.guild.member(mention)
      let userBanned = memberBanned.user
      try {
        msg.guild.ban(memberBanned)
        let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
        if (channel) {
          channel.send(`${msg.author.username} has banned ${memberBanned} from ${msg.guild.name}.`)
        }
        let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
        Logger.log(`\r\n[${time}] ${msg.author.username} has banned ${memberBanned} from ${msg.guild.name}.`)
      } catch (err) {
        const reply = await msg.reply(`Yo ${msg.author} I couldn't ban because of this stupid thing: ${err}`) as Message
        reply.delete(3000)
        msg.delete()
      }
      const reply = await msg.reply(userBanned.tag + " has been banned!") as Message
      reply.delete(3000)
      msg.delete()
    } else {
      const reply = await msg.reply("Sorry, but you're a nerd and can't ban members.") as Message
      reply.delete(3000)
      msg.delete()
    }
    return undefined
  }
}

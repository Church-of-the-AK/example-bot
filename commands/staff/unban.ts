import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class UnbanCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      aliases: ['revokeban', 'pardon'],
      group: 'staff',
      memberName: 'unban',
      description: 'Unbans a user by ID.',
      details: oneLine`
        This command is pretty nice. You can unban a user using
        the user ID, used mainly for detailed auditing purposes.
			`,
      examples: ['unban 32787387784556', 'unban 291090488499879'],
      guildOnly: true,

      args: [{
        key: 'id',
        label: 'id',
        prompt: 'Who would you like to unban (ID)?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { id }): Promise<Message> {
    if (msg.member.hasPermission("BAN_MEMBERS")) {
      let memberUnbanned = id
      try {
        msg.guild.unban(memberUnbanned)
        let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
        if (channel) {
          channel.send(`${msg.author.username} has unbanned ${memberUnbanned} from ${msg.guild.name}.`)
        }
        let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
        Logger.log(`\r\n[${time}] ${msg.author.username} has unbanned ${memberUnbanned} from ${msg.guild.name}.`)
      } catch (err) {
        const reply = await msg.reply(`Yo ${msg.author} I couldn't unban because of this stupid thing: ${err}`) as Message
        reply.delete(3000)
        msg.delete()
      }
      const reply = await msg.reply("Member unbanned!") as Message
      reply.delete(3000)
      msg.delete()
    } else {
      const reply = await msg.reply("You can't do that, dude. No.") as Message
      reply.delete(3000)
      msg.delete()
    }
    return undefined
  }
}

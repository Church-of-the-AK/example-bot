import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class RemoveRoleCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'removerole',
      aliases: ['delrole', 'demote'],
      group: 'staff',
      memberName: 'removerole',
      description: 'Removes a mentioned role from a mentioned user.',
      details: oneLine`
        This command takes in a mentioned user and a mentioned role, 
        and removes that role from that user.
			`,
      examples: ['removerole @JasonHaxStuff @Owner', 'demote @JasonHaxStuff @Owner'],
      guildOnly: true,

      args: [{
        key: 'username',
        label: 'username',
        prompt: 'Who would you like to remove the role from?',
        type: 'user',
        infinite: false
      },
      {
        key: 'role',
        label: 'role',
        prompt: 'What role would you like to remove from the user?',
        type: 'role',
        infinite: false
      }
      ]
    })
  }

  async run(msg: commando.CommandMessage, { username, role }): Promise<Message> {
    if (msg.member.hasPermission("ADMINISTRATOR")) {
      let rank = role
      let user = msg.guild.member(username)
      if (rank != null) {
        try {
          user.removeRole(rank)
          let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
          if (channel) {
            channel.send(`${msg.author.username} has removed ${rank.name} from ${user.displayName}.`)
          }
          let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
          Logger.log(`\r\n[${time}] ${msg.author.username} has removed ${rank.name} from ${user.displayName}.`)
          const reply = await msg.reply(`Removed rank ${rank.name} from ${user.displayName}.`) as Message
          reply.delete(3000)
          msg.delete()
        } catch (err) {
          const reply = await msg.reply("I couldn't complete your request, sorry 'bout that.") as Message
          reply.delete(3000)
          msg.delete()
        }
      }
    } else {
      const reply = await msg.reply("FeelsBad(Wo)Man (it's 2018") as Message
      reply.delete(3000)
      msg.delete()
    }
    return undefined
  }
}

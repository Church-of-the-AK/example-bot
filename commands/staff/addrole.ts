import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class AddRoleCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'addrole',
      aliases: ['addrank', 'promote'],
      group: 'staff',
      memberName: 'addrole',
      description: 'Adds a mentioned role to a mentioned user.',
      details: oneLine`
				This is an incredibly useful command that changes the username of the bot.
				Only usable by the owner, JasonHaxStuff.
			`,
      examples: ['addrole @JasonHaxStuff @Owner', 'promote @JasonHaxStuff @Owner'],
      guildOnly: true,

      args: [{
        key: 'username',
        label: 'username',
        prompt: 'Who would you like to add the role to?',
        type: 'user',
        infinite: false
      },
      {
        key: 'role',
        label: 'role',
        prompt: 'What role would you like to add?',
        type: 'role',
        infinite: false
      }
      ]
    })
  }

  async run(msg: commando.CommandMessage, { username, role }): Promise<Message> {
    if (msg.channel.type != "text") {
      const reply = await msg.reply("This command can only be used in a server.") as Message
      reply.delete(3000)
    }
    if (msg.member.hasPermission("ADMINISTRATOR")) {
      let rank = role
      let user = msg.guild.member(username)
      if (rank != null) {
        try {
          user.addRole(rank)
          let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
          if (channel) {
            channel.send(`${msg.author.username} has added ${rank.name} to ${user.displayName}.`)
          }
          let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
          Logger.log(`\r\n[${time}] ${msg.author.username} has added ${rank.name} to ${user.displayName}.`)
          const reply = await msg.reply(`Added rank ${rank.name} to ${user.displayName}.`) as Message
          reply.delete(3000)
          msg.delete()
        } catch (err) {
          console.log(err)
          const reply = await msg.reply("I couldn't complete your request, sorry 'bout that.") as Message
          reply.delete(3000)
          msg.delete()
        }
      }
    } else {
      const reply = await msg.reply("Too bad, so sad. Very sad.") as Message
      reply.delete(3000)
      msg.delete()
    }
    return undefined
  }
}

import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel } from 'discord.js';

module.exports = class PurgeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      aliases: ['delete', 'purgemsg'],
      group: 'staff',
      memberName: 'purge',
      description: 'Deletes a defined number of messages.',
      details: oneLine`
        This command deletes [amount{2 ... 100}] messages from the channel
        it is executed in.
			`,
      examples: ['purge 2', 'delete 100'],
      guildOnly: true,

      args: [{
        key: 'deleteCount',
        label: 'deleteCount',
        prompt: 'How many messages would you like to delete?',
        type: 'integer',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { deleteCount }): Promise<Message> {
    if (msg.channel.type != "text") {
      const reply = await msg.reply("This command can only be used in a server.") as Message
      reply.delete(3000)
    }
    if (!(msg.member.hasPermission("MANAGE_MESSAGES"))) {
      const reply = await msg.reply("Thoust mayst notst doest thatst.") as Message
      reply.delete(3000)
      msg.delete()
    }
    if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
      const reply = await msg.reply("Gimme a number between 2 and 100 you human.") as Message
      reply.delete(3000)
      msg.delete()
    }
    try {
      msg.channel.bulkDelete(deleteCount)
      let channel = msg.guild.channels.find('name', 'machobot-audit') as TextChannel
      if (channel) {
        if (msg.channel instanceof TextChannel) {
          channel.send(`${msg.author.username} has purged ${deleteCount} messages from ${msg.channel.name}.`)
        }
      }
      let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
      if (msg.channel instanceof TextChannel) {
        Logger.log(`\r\n[${time}] ${msg.author.username} has purged ${deleteCount} messages from ${msg.channel.name}.`)
      }
    } catch (err) {
      const reply = await msg.reply(`I couldn't delete le messages because of this stupid shiz: ${err}`) as Message
      reply.delete(3000)
    }
    return undefined
  }
}

import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel, GuildChannel } from 'discord.js'

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

  async run(msg: commando.CommandMessage, { id }: { id: string }): Promise<Message> {
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      await msg.reply("You can't unban members.")
      return msg.delete()
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const unbanResponse = await msg.guild.members.unban(id).catch(() => {
      return
    })

    if (!unbanResponse) {
      await msg.reply('I can\'t unban that user.')
      return msg.delete()
    }

    if (channel) {
      channel.send(`\`${msg.author.username}\` has unbanned \`${id}\` from ${msg.guild.name}.`)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    Logger.log(`\r\n[${time}] ${msg.author.username} has unbanned ${id} from ${msg.guild.name}.`)

    await msg.reply("Member unbanned.")
    return msg.delete()
  }
}

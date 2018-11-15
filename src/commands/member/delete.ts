import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'
import { MachoCommand } from '../../types'
import { confirm, deleteUser } from '../../util'

export default class DeleteCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'forget',
      group: 'member',
      memberName: 'forget',
      description: 'Forget\'s your Macho profile.',
      details: oneLine`
        Forget's your Macho profile.
			`,
      examples: [ 'forget' ]
    })
  }

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const confirmed = await confirm('Are you sure you want to delete ***__all__*** of your Macho profile?', msg.channel, msg.author)

    if (!confirmed) {
      return msg.channel.send('Okay, cancelled.').catch()
    }

    const response = await deleteUser(msg.author.id).catch(error => {
      console.log(error)
    })

    if (!response) {
      return msg.channel.send('There was an error deleting your profile. Please try again later.').catch()
    }

    return msg.channel.send('Profile deleted.').catch()
  }
}

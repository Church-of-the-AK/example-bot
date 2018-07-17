/* eslint-disable no-console */
import * as commando from 'discord.js-commando'
import * as path from 'path'
import { oneLine } from 'common-tags'
import * as sqlite from 'sqlite'
import * as config from './config'
import { ServerQueue } from './types/ServerQueue';
import { handleMessage } from './handlers/MessageHandler'
import { Role } from 'discord.js';

export const queue: Map<string, ServerQueue> = new Map()

export const client = new commando.CommandoClient({
  owner: config.ownerId,
  commandPrefix: config.prefix,
  unknownCommandResponse: false
})

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.log)
  .on('ready', () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`)
    client.user.setActivity('Macho, the bot for everything (soon).', {
      url: config.twitch
    })
  })
  .on('guildMemberAdd', member => {
    if (member.user.bot) {
      return
    }

    const commonerRole = member.guild.roles.find((role: Role) => role.name.toLowerCase() === 'commoner')
    const memberRole = member.guild.roles.find((role: Role) => role.name.toLowerCase() === 'member')
    const acceptRulesRole = member.guild.roles.find((role: Role) => role.name.toLowerCase() === 'accept rules')

    member.roles.add(acceptRulesRole).catch(() => {
      member.roles.add(commonerRole ? commonerRole : memberRole).catch(() => {
        // eat the error, not important
      })
    })
  })
  .on('disconnect', () => {
    console.warn('Disconnected!')
  })
  .on('reconnecting', () => {
    console.warn('Reconnecting...')
  })
  .on('commandError', (cmd, err) => {
    if (err instanceof commando.FriendlyError) return
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err)
  })
  .on('commandBlocked', (msg, reason) => {
    console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`)
  })
  .on('commandPrefixChange', (guild, prefix) => {
    console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`)
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`)
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`)
  })
  .on('message', (msg) => {
    handleMessage(msg)
  })
  .setProvider(
    sqlite.open(path.join(__dirname, 'database.sqlite3')).then(db => new commando.SQLiteProvider(db))
  ).catch(console.error)

client.registry
  .registerGroups([
    ['staff', 'Functional Staff Commands'],
    ['member', 'Commands for Members'],
    ['music', 'Music Commands'],
    ['economy', 'Money Commands']
  ])
  .registerDefaults()
  .registerTypesIn(path.join(__dirname, 'commandArgTypes'))
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.login(config.token)

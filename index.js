const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js')
const { Routes } = require('discord-api-types/v10')
const { REST } = require('@discordjs/rest')
const fs = require('fs')

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] })

client.commands = new Collection();

//Exports
module.exports.client = client;

const commands = []
const events = []
const cmdF = fs.readdirSync('./src/commands/')
const evtF = fs.readdirSync(`./src/events/`)

for (const file of evtF) {
    const event = require(`./src/events/${file}`)
    events.push(event.name)
    if (event.once) client.once(event.name, (...args) => event.execute(...args))
    else client.on(event.name, (...args) => event.execute(...args))
}
console.log(`[~] Loaded ${events.length} events`)

for (const file of cmdF) {
    const command = require(`./src/commands/${file}`)
    commands.push(command.data.toJSON())
    client.commands.set(command.data.name, command)
}
console.log('[~] Registered ' + commands.length + ' commands')


//Dotenv stuff
require('dotenv').config()
const token = process.env.TOKEN
const clientID = process.env.CLIENT_ID
const guildID = process.env.GUILD_ID

const rest = new REST({
    version: '10'
  }).setToken(token);

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(clientID, guildID), { //, guildID), {
        body: commands
      })
      console.log('[~] Refreshed commands')
    } catch (error) {
      console.error(error);
    }
  })();

client.login(process.env.TOKEN)
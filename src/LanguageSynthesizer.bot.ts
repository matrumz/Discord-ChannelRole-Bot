import DiscordJs = require("discord.js");
import fs = require("fs");

class LanguageSynthesizer
{
    constructor()
    {
        this.config = JSON.parse(fs.readFileSync("./bot.config.json").toString());

        this.client = new DiscordJs.Client();
        this.client.on("ready", this.onReady.bind(this));
        this.client.on("message", this.onMessage.bind(this));
    }

    public start(): void
    {
        this.client.login(this.config.token);
    }

    private client: DiscordJs.Client;
    private config: any;

    private onReady(): void
    {
        console.log("Ready to learn you some knowledge! (Or play some ping pong)");
    }

    private onMessage(message: DiscordJs.Message): void
    {
        if (message.content === "ping")
            message.reply("pong");
    }
}

var bot = new LanguageSynthesizer()
bot.start()
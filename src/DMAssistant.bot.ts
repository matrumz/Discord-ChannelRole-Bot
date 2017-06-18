import DiscordJs = require("discord.js");
import fs = require("fs");
import q = require("q");
import { Language } from "./utils/language";
import { Types } from "./utils/system";

class LanguageSynthesizer
{
    constructor()
    {
        this.config = JSON.parse(fs.readFileSync("./bot.config.json").toString());
        this.client = new DiscordJs.Client();
        this.registerEvents();
    }

    private UMainiacs: DiscordJs.Guild;
    private everyoneRole: DiscordJs.Role;
    private dMRole: DiscordJs.Role;
    private client: DiscordJs.Client;
    private config: any;

    public registerEvents(): void
    {
        this.client.on("ready", this.onReady.bind(this));
        this.client.on("message", this.onMessage.bind(this));
    }

    public start(): void
    {
        this.client.login(this.config.token);
    }

    private onReady(): void
    {
        console.log("Ready to learn you some knowledge! (Or play some ping pong)");
        this.UMainiacs = this.client.guilds.filterArray((server) =>
        {
            return server.name === this.config.server;
        }).pop();
        console.log((this.UMainiacs ? "Found " : "Did not find ") + "UMainiacs");
        if (this.UMainiacs) {
            this.everyoneRole = this.UMainiacs.roles.find("name", "@everyone");
            this.dMRole = this.UMainiacs.roles.find("name", "Dungeon Master")
        }
    }

    private onMessage(message: DiscordJs.Message): void
    {
        if (message.content.charAt(0) != this.config.beckonChar)
            return;

        if (!(this.config.authorizedRoles as Array<string>).some((authRole) =>
        {
            return message.member.roles.exists("name", authRole);
        })) {
            message.reply("One does not simply create a new language. One should play DnD instead!");
            return;
        }

        this.handleInstruction(message);
    }

    private handleInstruction(command: DiscordJs.Message): void
    {
        let args = command.content.split(" ");
        let instruction: string = args.shift().replace(this.config.beckonChar, "");

        switch (instruction) {
            case "synth":
                args.forEach((arg) =>
                {
                    this.synthLanguage(arg).then((summary) =>
                    {
                        if (summary.InfoMessages.length > 0)
                            command.channel.send(summary.blockifyMessages("info"));
                        if (summary.WarningMessages.length > 0)
                            command.channel.send("WARNING:\n" + summary.blockifyMessages("warn"));
                        if (summary.ErrorMessages.length > 0)
                            command.channel.send("ERROR:\n" + summary.blockifyMessages("err"));
                    });
                });
                break;
            case ("mischiefmanaged"):
                console.log("Getting outta dodge");
                this.client.destroy();
                break;
        }
    }

    private synthLanguage(lang: string): Promise<Types.System.ProcessSummary>
    {
        let newLang = new Language(lang, this.UMainiacs)
        return newLang.coin();
    }
}

var bot = new LanguageSynthesizer()
bot.start()
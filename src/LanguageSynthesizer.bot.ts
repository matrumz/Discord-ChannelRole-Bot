import DiscordJs = require("discord.js");
import fs = require("fs");
import q = require("q");

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
    private defaultLangRole: DiscordJs.PermissionObject =
    {
        ADMINISTRATOR: false,
        CREATE_INSTANT_INVITE: false,
        KICK_MEMBERS: false,
        BAN_MEMBERS: false,
        MANAGE_CHANNELS: false,
        MANAGE_GUILD: false,
        ADD_REACTIONS: true,
        READ_MESSAGES: true,
        SEND_MESSAGES: true,
        SEND_TTS_MESSAGES: true,
        MANAGE_MESSAGES: false,
        EMBED_LINKS: false,
        ATTACH_FILES: false,
        READ_MESSAGE_HISTORY: true,
        MENTION_EVERYONE: true,
        USE_EXTERNAL_EMOJIS: false,
        EXTERNAL_EMOJIS: false,
        CONNECT: false,
        SPEAK: false,
        MUTE_MEMBERS: false,
        DEAFEN_MEMBERS: false,
        MOVE_MEMBERS: false,
        USE_VAD: false,
        CHANGE_NICKNAME: false,
        MANAGE_NICKNAMES: false,
        MANAGE_ROLES: false,
        MANAGE_ROLES_OR_PERMISSIONS: false,
        MANAGE_WEBHOOKS: false,
        MANAGE_EMOJIS: false
    };
    private dMLangRole: DiscordJs.PermissionObject =
    {
        ADMINISTRATOR: false,
        CREATE_INSTANT_INVITE: false,
        KICK_MEMBERS: false,
        BAN_MEMBERS: false,
        MANAGE_CHANNELS: false,
        MANAGE_GUILD: false,
        ADD_REACTIONS: true,
        READ_MESSAGES: true,
        SEND_MESSAGES: true,
        SEND_TTS_MESSAGES: true,
        MANAGE_MESSAGES: true,
        EMBED_LINKS: true,
        ATTACH_FILES: true,
        READ_MESSAGE_HISTORY: true,
        MENTION_EVERYONE: true,
        USE_EXTERNAL_EMOJIS: false,
        EXTERNAL_EMOJIS: false,
        CONNECT: false,
        SPEAK: false,
        MUTE_MEMBERS: false,
        DEAFEN_MEMBERS: false,
        MOVE_MEMBERS: true,
        USE_VAD: false,
        CHANGE_NICKNAME: false,
        MANAGE_NICKNAMES: false,
        MANAGE_ROLES: false,
        MANAGE_ROLES_OR_PERMISSIONS: false,
        MANAGE_WEBHOOKS: false,
        MANAGE_EMOJIS: false
    };
    private everyoneLangRole: DiscordJs.PermissionObject =
    {
        ADMINISTRATOR: false,
        CREATE_INSTANT_INVITE: false,
        KICK_MEMBERS: false,
        BAN_MEMBERS: false,
        MANAGE_CHANNELS: false,
        MANAGE_GUILD: false,
        ADD_REACTIONS: false,
        READ_MESSAGES: false,
        SEND_MESSAGES: false,
        SEND_TTS_MESSAGES: false,
        MANAGE_MESSAGES: false,
        EMBED_LINKS: false,
        ATTACH_FILES: false,
        READ_MESSAGE_HISTORY: false,
        MENTION_EVERYONE: false,
        USE_EXTERNAL_EMOJIS: false,
        EXTERNAL_EMOJIS: false,
        CONNECT: false,
        SPEAK: false,
        MUTE_MEMBERS: false,
        DEAFEN_MEMBERS: false,
        MOVE_MEMBERS: false,
        USE_VAD: false,
        CHANGE_NICKNAME: false,
        MANAGE_NICKNAMES: false,
        MANAGE_ROLES: false,
        MANAGE_ROLES_OR_PERMISSIONS: false,
        MANAGE_WEBHOOKS: false,
        MANAGE_EMOJIS: false
    }

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
            message.reply("One does not simply create a new language. One should play DnD instead.");
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
                    this.synthLanguage(arg).then(
                        (result) =>
                        {
                            command.channel.send('"' + arg + '" has been introduced to the land.')
                        },
                        (error) =>
                        {
                            command.channel.send('"' + arg + '" is too complex for the land: ' + error);
                        }
                    );
                });
        }
    }

    private synthLanguage(lang: string): Promise<boolean>
    {
        var deferred = q.defer<boolean>();

        this.UMainiacs.createChannel(lang.toLowerCase(), "text").then(
            (channelResult) =>
            {
                let roleData: DiscordJs.RoleData = {
                    name: lang.toLowerCase(),
                    color: "GREY",
                    hoist: false,
                    position: 99,
                    permissions: [],
                    mentionable: false
                };
                this.UMainiacs.createRole(roleData).then(
                    (roleResult) =>
                    {
                        channelResult.overwritePermissions(roleResult, this.defaultLangRole).then(
                            (overrideResult) =>
                            {
                                deferred.resolve(true);
                            },
                            (overrideError) =>
                            {
                                deferred.reject("Failed to override on channel.");
                            }
                        );
                        channelResult.overwritePermissions(this.everyoneRole, this.everyoneLangRole).catch((error) =>
                        {
                            console.log("Cannot expel the riffraff from " + lang + ": " + error);
                        });
                        console.log(this.dMRole.toString())
                        channelResult.overwritePermissions(this.dMRole, this.dMLangRole).catch((error) =>
                        {
                            console.log("Cannot include our glorious leader in " + lang + ": " + error);
                        });
                    },
                    (roleError) =>
                    {
                        deferred.reject("Failed to create role.");
                    }
                );
            },
            (channelError) =>
            {
                deferred.reject("Failed to create channel.");
            }
        );

        return deferred.promise;
    }
}

var bot = new LanguageSynthesizer()
bot.start()
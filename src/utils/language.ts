import DiscordJs = require("discord.js");
import q = require("q");

export class Language
{
    /** Currently, the spoken value is not used */
    constructor(
        public name: string,
        public isWritten: boolean = true,
        public isSpoken: boolean = false
    )
    {
        this.langId = "lang-" + this.name;
        this.langRoleData = {
            name: this.langId,
            color: "GREY",
            hoist: false,
            position: 99,
            permissions: [],
            mentionable: false
        }
    }

    private langRoleData: DiscordJs.RoleData;
    private langId: string;

    private static readonly defaultLangRolePerms: DiscordJs.PermissionObject =
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
    private static readonly defaultEveryoneRolePerms: DiscordJs.PermissionObject =
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
    };
    private static readonly defaultDMRolePerms: DiscordJs.PermissionObject =
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

    public textChannel: DiscordJs.TextChannel;
    public voiceChannel: DiscordJs.VoiceChannel;
    public role: DiscordJs.Role;

    public coin(server: DiscordJs.Guild): void
    {
        var promises: Promise<any>[] = [];
        var promisedTextChannel: Promise<DiscordJs.TextChannel>;

        if (this.isWritten && !server.channels.find((channel): boolean =>
        {
            return (channel.name.toLowerCase() === this.langId.toLowerCase()
                && channel.type === "text")
        })) {
            promisedTextChannel = server.createChannel(this.langId, "text");
            this.createAndAttachRoles(promisedTextChannel, this.textChannel);
        }
    }

    private createAndAttachRoles(channelPromise: Promise<DiscordJs.GuildChannel>, saveChannelTo: DiscordJs.GuildChannel): void
    {
        channelPromise.then(
            (channelResult) =>
            {
                saveChannelTo = channelResult;
                saveChannelTo.overwritePermissions(saveChannelTo.guild.roles.find("name", "@everyone"), Language.defaultEveryoneRolePerms).catch((error) =>
                {
                    console.log("Cannot expel the riffraff from " + this.langId + ": " + error);
                });
                saveChannelTo.overwritePermissions(saveChannelTo.guild.roles.find("name", "Dungeon Master"), Language.defaultDMRolePerms).catch((error) =>
                {
                    console.log("Cannot include our glorious leader in " + this.langId + ": " + error);
                });

                let targetRole = saveChannelTo.guild.roles.find("name", this.langId);
                if (!targetRole) {
                    saveChannelTo.guild.createRole(this.langRoleData).then(
                        (roleResult) =>
                        {
                            saveChannelTo.overwritePermissions(roleResult, Language.defaultLangRolePerms).catch((error) =>
                            {
                                console.log("Cannot teach the natives: " + error);
                            });
                        },
                        (roleError) =>
                        {
                            console.log("Cannot create the natives: " + roleError);
                        }
                    );
                }
                else {
                    console.log("That role already exists.");
                }
            },
            (channelError) =>
            {
                console.log("Completely failed to create language");
            }
        );
    }
}
import DiscordJs = require("discord.js");
import q = require("q");
import { Types } from "./system"

export class Language
{
    /** Currently, the spoken value is not used */
    constructor(
        public name: string,
        public server: DiscordJs.Guild,
        public isWritten: boolean = true,
        public isSpoken: boolean = false
    )
    {
        this.langId = ("lang-" + this.name).toLowerCase();
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

    /** Always resolves */
    public coin(): Promise<Types.System.ProcessSummary>
    {
        var deferred = q.defer<Types.System.ProcessSummary>();
        var promises: Promise<Types.System.ProcessSummary>[] = [];

        if (this.isWritten && !this.server.channels.find((channel): boolean =>
        {
            return (channel.name.toLowerCase() === this.langId.toLowerCase()
                && channel.type === "text")
        })) {
            promises.push(this.createLanguageOnServer(this.textChannel, "text"));
        }

        q.all(promises).then(
            (results) =>
            {
                deferred.resolve(results[0]);
            },
            (error) =>
            {
                deferred.resolve(new Types.System.ProcessSummary([error]));
            }
        );

        return deferred.promise;
    }

    /** Always resolves */
    private createLanguageOnServer(destChannel: DiscordJs.GuildChannel, channelType: "text" | "voice"): Promise<Types.System.ProcessSummary>
    {
        var deferred = q.defer<Types.System.ProcessSummary>();
        var summary = new Types.System.ProcessSummary();

        /* Create the channel for the "new" language. */
        this.server.createChannel(this.langId, channelType).then(
            (channelResult) =>
            {
                summary.InfoMessages.push('"' + this.name + '" has been introduced to the land.');
                destChannel = channelResult;

                /* Create/override role/perms on the new channel for teh assocated role */
                let targetRoleSetUp: Promise<any> = undefined;
                let targetRole = this.server.roles.find("name", this.langId);
                if (!targetRole) {
                    this.server.createRole(this.langRoleData).then(
                        (createNativeResult) =>
                        {
                            targetRoleSetUp = destChannel.overwritePermissions(createNativeResult, Language.defaultLangRolePerms);
                        },
                        (createNativeError) =>
                        {
                            let targetRoleSetUpDefer = q.defer<Types.System.ProcessSummary>();
                            targetRoleSetUp = targetRoleSetUpDefer.promise;
                            targetRoleSetUpDefer.reject('Cannot create the natives "' + this.name + '": ' + createNativeError);
                        }
                    );
                } else {
                    targetRoleSetUp = channelResult.overwritePermissions(targetRole, Language.defaultLangRolePerms);
                }
                // targetRoleSetUp.catch((error) =>
                // {
                //     error = "Cannot set up target role for " + this.langId + ": " + error;
                //     summary.ErrorMessages.push(error);
                // });

                /* Assign DM role perms */
                let dmRoleSetUp = destChannel.overwritePermissions(this.server.roles.find("name", "Dungeon Master"), Language.defaultDMRolePerms);
                dmRoleSetUp.catch((error) =>
                {
                    error = "Cannot include our glorious leader in " + this.langId + ": " + error;
                    summary.ErrorMessages.push(error);
                });

                /* Assign @everyone role perms */
                let everyoneRoleSetUp = destChannel.overwritePermissions(this.server.roles.find("name", "@everyone"), Language.defaultEveryoneRolePerms);
                everyoneRoleSetUp.catch((error) =>
                {
                    error = "Cannot expel the riffraff from " + this.langId + ": " + error;
                    summary.ErrorMessages.push(error);
                });

                /* Resolve when all role overrides are accounted for, error or not. */
                q.all([targetRoleSetUp, dmRoleSetUp, everyoneRoleSetUp]).finally(() =>
                {
                    deferred.resolve(summary);
                })
            },
            (channelError) =>
            {
                summary.ErrorMessages.push('The land rejected "' + this.name + '": ' + channelError);
                deferred.resolve(summary);
            }
        );

        return deferred.promise;
    }
}
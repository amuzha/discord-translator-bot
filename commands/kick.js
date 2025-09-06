import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { safeReply } from '../utils/helper.js';
import { config } from '../utils/config.js';

export const name = 'kick';
export const description = 'Kick a user from the guild';
export const aliases = [];

export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the guild')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('User to kick')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Reason for kicking')
            .setRequired(false)
    );

export async function execute(context, args, client) {
    const member = context.member || (context.guild ? await context.guild.members.fetch(context.user.id) : null);
    if (!member?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        const msg = '❌ You dont have permission.';
        return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
    }

    let targetMember, reason;

    if (context.isChatInputCommand?.()) {
        targetMember = context.options.getMember('user');
        reason = context.options.getString('reason') || 'No reason provided';
    } else {
        targetMember = context.mentions?.members?.first();
        if (!targetMember) {
            const msg = `⚠️ Use: ${config.prefix}kick <@user> [reason]`;
            return context.channel.send(msg);
        }
        reason = args.slice(1).join(' ') || 'No reason provided';
    }

    const botMember = await context.guild.members.fetchMe();
    if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
        const msg = '❌ Cannot kick members with a higher role than bot.';
        return context.isChatInputCommand?.() ? await safeReply(context, msg) : context.channel.send(msg);
    }

    try {
        await targetMember.kick(reason);
        const replyMsg = `✅ User ${targetMember.user.tag} has been kicked.\nReason: ${reason}`;
        if (context.isChatInputCommand?.()) {
            await safeReply(context, replyMsg);
        } else {
            await context.channel.send(replyMsg);
        }
    } catch (err) {
        console.error(err);
        const errMsg = '❌ Failed to kick user.';
        if (context.isChatInputCommand?.()) {
            await safeReply(context, errMsg);
        } else {
            await context.channel.send(errMsg);
        }
    }
}

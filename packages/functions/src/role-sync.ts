import { REST, Routes } from "discord.js";
import { Config } from "sst/node/config";

const GUILD_ID = "898508425997217795";
const ROLE_ID = "1085544076541177917";

const rest = new REST({ version: "10" }).setToken(Config.DISCORD_TOKEN);

export async function* members() {
  let after: string | undefined = undefined;
  while (true) {
    const params = new URLSearchParams({
      limit: "1000",
    });
    if (after) params.set("after", after);
    const members = (await rest.get(Routes.guildMembers(GUILD_ID), {
      query: params,
    })) as any[];
    if (members.length === 0) return;
    yield* members;
    after = members[members.length - 1].user.id;
  }
}

export async function handler() {
  const roles = await rest
    .get(Routes.guildRoles(GUILD_ID))
    .then((roles) =>
      Object.fromEntries((roles as any[]).map((r) => [r.id, r.name]))
    );
  for await (const member of members()) {
    const subscribesToAnyone = member.roles.some((role: string) =>
      roles[role].startsWith("subscriber (")
    );
    const hasSubscriberRole = member.roles.includes(ROLE_ID);
    if (!subscribesToAnyone && hasSubscriberRole) {
      console.log("Removing role from", member.user.username);
      await rest.delete(
        Routes.guildMemberRole(GUILD_ID, member.user.id, ROLE_ID)
      );
    }
    if (subscribesToAnyone && !hasSubscriberRole) {
      console.log("Adding role to", member.user.username);
      await rest.put(Routes.guildMemberRole(GUILD_ID, member.user.id, ROLE_ID));
    }
  }
}

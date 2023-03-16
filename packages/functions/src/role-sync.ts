import { Config } from "sst/node/config";
import { Client, GuildMember } from "discord.js";

const subscriberRoleId = "1085544076541177917";

export async function handler() {
  return new Promise<void>((resolve) => {
    const client = new Client({ intents: ["Guilds", "GuildMembers"] });

    const updateMemberRoles = async (member: GuildMember) => {
      const subscribesToAnyone = member.roles.cache.find((role) =>
        role.name.startsWith("subscriber (")
      );
      if (subscribesToAnyone && !member.roles.cache.has(subscriberRoleId)) {
        console.log("Adding role to", member.user.tag);
        await member.roles.add(subscriberRoleId);
      }
      if (!subscribesToAnyone && member.roles.cache.has(subscriberRoleId)) {
        console.log("Removing role from", member.user.tag);
        await member.roles.remove(subscriberRoleId);
      }
    };

    client.once("ready", async () => {
      console.log(`Logged in as ${client.user?.tag}!`);

      const guild = await client.guilds.fetch("898508425997217795");

      try {
        // Fetch all members from the server
        const members = await guild.members.fetch();
        console.log(`There are ${members.size} members in the server.`);

        await Promise.all(members.map(updateMemberRoles));
      } catch (error) {
        console.error("Error fetching members:", error);
      }

      resolve();
    });

    client.login(Config.DISCORD_TOKEN);
  });
}

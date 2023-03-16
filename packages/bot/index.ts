import { Client, GuildMember } from "discord.js";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const subscriberRoleId = "1085544076541177917";

(async () => {
  const secretArn = process.env.DISCORD_SECRET_ARN;

  const secretsManagerClient = new SecretsManagerClient({
    region: "us-east-1",
  });
  const getSecretValueCommand = new GetSecretValueCommand({
    SecretId: secretArn,
  });

  try {
    const response = await secretsManagerClient.send(getSecretValueCommand);
    const { DISCORD_TOKEN: token } = JSON.parse(response.SecretString!) as {
      DISCORD_TOKEN: string;
    };

    const client = new Client({ intents: ["Guilds", "GuildMembers"] });

    const updateMemberRoles = (member: GuildMember) => {
      const subscribesToAnyone = member.roles.cache.find((role) =>
        role.name.startsWith("subscriber (")
      );
      if (subscribesToAnyone) member.roles.add(subscriberRoleId);
      if (!subscribesToAnyone && member.roles.cache.has(subscriberRoleId))
        member.roles.remove(subscriberRoleId);
    };

    client.once("ready", async () => {
      console.log(`Logged in as ${client.user?.tag}!`);

      const guild = await client.guilds.fetch("898508425997217795");

      try {
        // Fetch all members from the server
        const members = await guild.members.fetch();
        console.log(`There are ${members.size} members in the server.`);

        members.each(updateMemberRoles);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    });

    client.on("guildMemberUpdate", (_, newMember) => {
      if (newMember.roles.cache.size === 0) return;
      updateMemberRoles(newMember);
    });

    client.login(token);
  } catch (error) {
    console.error("Error retrieving secret:", error);
  }
})();

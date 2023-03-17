import { SSTConfig } from "sst";
import { Config, Cron } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "watchdev",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Default(ctx) {
      const DISCORD_TOKEN = new Config.Secret(ctx.stack, "DISCORD_TOKEN");
      new Cron(ctx.stack, "roleSync", {
        job: {
          function: {
            handler: "packages/functions/src/role-sync.handler",
            runtime: "nodejs16.x",
            bind: [DISCORD_TOKEN],
          },
        },
        schedule: "rate(1 minute)",
      });
    });
  },
} satisfies SSTConfig;

// hardcoded const minutes in a day

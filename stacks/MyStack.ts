import { StackContext } from "sst/constructs";
import * as ssm from "aws-cdk-lib/aws-secretsmanager";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";

export function API({ stack }: StackContext) {
  const secret = ssm.Secret.fromSecretNameV2(stack, "secret", "discord");

  const cluster = new Cluster(stack, "Cluster", {});

  const asset = new DockerImageAsset(stack, "asset", {
    directory: "./packages/bot",
  });

  // compute repo name from asset image
  // const parts = asset.imageUri.split("@")[0].split("/");
  // const repoName = parts.slice(1, parts.length).join("/").split(":")[0];

  const image = ContainerImage.fromDockerImageAsset(asset);

  const service = new ApplicationLoadBalancedFargateService(stack, "service", {
    cluster,
    taskImageOptions: {
      image,
      // containerPort: 80,
      environment: { DISCORD_SECRET_ARN: secret.secretArn },
      enableLogging: true,
    },
    memoryLimitMiB: 512,
    cpu: 256,
    desiredCount: 1,
    publicLoadBalancer: false,
    assignPublicIp: false,
  });

  secret.grantRead(service.taskDefinition.taskRole);

  stack.addOutputs({
    // ApiEndpoint: api.url,
    Service: service.service.serviceArn,
  });
}

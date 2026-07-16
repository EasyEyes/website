import type { DeploySucceededEvent } from "@netlify/functions";

export default {
  deploySucceeded(event: DeploySucceededEvent) {
    console.log(`Deploy ${event.deploy.id} succeeded for ${event.site.name}`);
    console.log("[deploy-success-probe] deploySucceeded event received", {
      deploymentId: event.deploy.id,
      context: event.deploy.context,
      publishedAt: event.deploy.publishedAt,
      siteId: event.site.id,
    });
  },
};

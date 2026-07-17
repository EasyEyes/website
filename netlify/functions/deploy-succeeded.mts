import {
  createLegacyDeploySucceededHandler,
  deploySucceeded,
} from "./compiler-deployment/index";

export default createLegacyDeploySucceededHandler({
  handleDeploySucceeded: deploySucceeded,
  logger: console,
});

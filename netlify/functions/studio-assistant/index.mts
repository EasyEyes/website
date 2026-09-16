import { withLambda } from "@netlify/aws-lambda-compat";
import { handler, config } from "./handler";

export { handler, config } from "./handler";
export default withLambda(handler);

import { withLambda } from "@netlify/aws-lambda-compat";
import { handler } from "./handler";

export { handler } from "./handler";
export default withLambda(handler);

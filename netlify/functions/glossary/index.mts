import { handler } from "./handler";
import { nativeHandler } from "../shared/nativeHandler";

export { handler } from "./handler";
export default nativeHandler(handler);

import { v2 } from "@google-cloud/speech";
import { createChirp3Server } from "./server.mjs";
import { createGoogleStreamFactory } from "./googleStream.mjs";

const location = process.env.CHIRP3_LOCATION;
if (!["eu", "us"].includes(location))
  throw new Error("Set CHIRP3_LOCATION to eu or us.");
const client = new v2.SpeechClient({
  apiEndpoint: `${location}-speech.googleapis.com`,
});
await client.initialize();
const service = createChirp3Server({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location,
  publicUrl: process.env.CHIRP3_RELAY_URL,
  ticketSecret: process.env.CHIRP3_TICKET_SECRET,
  maxConnections: Number(process.env.CHIRP3_MAX_CONNECTIONS ?? 80),
  createStream: createGoogleStreamFactory(client),
});
const port = Number(process.env.PORT ?? 8080);
service.server.listen(port, "0.0.0.0");
const stop = async () => {
  await service.close();
  await client.close();
};
process.once("SIGTERM", stop);
process.once("SIGINT", stop);

import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createRequire } from "node:module";
import { v2, protos } from "@google-cloud/speech";
import { createGoogleStreamFactory } from "../googleStream.mjs";
import { buildRecognitionRequest } from "../config.mjs";

const sdkRequire = createRequire(import.meta.resolve("@google-cloud/speech"));
const grpc = sdkRequire("@grpc/grpc-js");
const Request = protos.google.cloud.speech.v2.StreamingRecognizeRequest;
const Response = protos.google.cloud.speech.v2.StreamingRecognizeResponse;

test("official v2 client exchanges real protobuf requests and stream status with a local gRPC server", async (t) => {
  const received = [];
  const server = new grpc.Server();
  server.addService(
    {
      streamingRecognize: {
        path: "/google.cloud.speech.v2.Speech/StreamingRecognize",
        requestStream: true,
        responseStream: true,
        requestSerialize: (value) =>
          Buffer.from(Request.encode(Request.fromObject(value)).finish()),
        requestDeserialize: (value) => Request.decode(value),
        responseSerialize: (value) =>
          Buffer.from(Response.encode(Response.fromObject(value)).finish()),
        responseDeserialize: (value) => Response.decode(value),
      },
    },
    {
      streamingRecognize: (call) => {
        call.on("data", (message) => {
          received.push(message);
          if (message.audio?.length)
            call.write({
              results: [
                {
                  isFinal: true,
                  alternatives: [{ transcript: "cat dog fish" }],
                },
              ],
            });
        });
        call.on("end", () => call.end());
      },
    },
  );
  const port = await new Promise((resolve, reject) =>
    server.bindAsync(
      "127.0.0.1:0",
      grpc.ServerCredentials.createInsecure(),
      (error, value) => (error ? reject(error) : resolve(value)),
    ),
  );
  const client = new v2.SpeechClient({
    apiEndpoint: "127.0.0.1",
    port,
    sslCreds: grpc.credentials.createInsecure(),
    projectId: "test-project",
    universeDomain: "googleapis.com",
  });
  t.after(async () => {
    await client.close();
    server.forceShutdown();
  });
  await client.initialize();
  const stream = createGoogleStreamFactory(client)();
  const outputs = [];
  stream.on("data", (response) => outputs.push(response));
  const status = once(stream, "status");
  const ended = once(stream, "end");
  stream.write(
    buildRecognitionRequest("test-project", "eu", {
      type: "start",
      protocolVersion: 1,
      utteranceId: "trial",
      languageCode: "en-US",
      keyterms: ["cat", "dog", "fish"],
      useKeyterms: true,
    }),
  );
  stream.write({ audio: Buffer.from([1, 0, 2, 0]) });
  stream.end();
  await ended;
  assert.equal((await status)[0].code, 0);
  assert.equal(received[0].streamingConfig.config.model, "chirp_3");
  assert.equal(
    received[0].streamingConfig.config.explicitDecodingConfig.encoding,
    1,
  );
  assert.equal(received[1].audio.length, 4);
  assert.equal(
    outputs[0].results[0].alternatives[0].transcript,
    "cat dog fish",
  );
});

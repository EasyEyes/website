// The convenience wrapper treats writes as v1 audio, not v2 request objects.
export const createGoogleStreamFactory = (client) => () =>
  client._streamingRecognize({ retry: null });

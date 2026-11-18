export function buildRecognitionRequest(project, location, message) {
  if (
    !message ||
    message.type !== "start" ||
    message.protocolVersion !== 1 ||
    typeof message.utteranceId !== "string" ||
    !/^[\w-]{1,180}$/.test(message.utteranceId) ||
    typeof message.languageCode !== "string" ||
    !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(message.languageCode) ||
    typeof message.useKeyterms !== "boolean" ||
    !Array.isArray(message.keyterms) ||
    message.keyterms.length > 1000 ||
    message.keyterms.some(
      (term) => typeof term !== "string" || !term.trim() || term.length > 100,
    )
  )
    throw new Error("Invalid speech configuration.");
  if (message.keyterms.join("").length > 10000)
    throw new Error("Too many keyterms.");
  return {
    recognizer: `projects/${project}/locations/${location}/recognizers/_`,
    streamingConfig: {
      config: {
        model: "chirp_3",
        languageCodes: [message.languageCode],
        explicitDecodingConfig: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          audioChannelCount: 1,
        },
        features: { enableAutomaticPunctuation: false },
        ...(message.useKeyterms && message.keyterms.length
          ? {
              adaptation: {
                phraseSets: [
                  {
                    inlinePhraseSet: {
                      phrases: [...new Set(message.keyterms)].map((value) => ({
                        value,
                      })),
                    },
                  },
                ],
              },
            }
          : {}),
      },
      streamingFeatures: { interimResults: true },
    },
  };
}

const BoxSDK = require("box-node-sdk");
const stream = require("stream");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { image, filename } = JSON.parse(event.body);

    if (!image || !filename) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: image, filename",
        }),
      };
    }

    if (!process.env.BOX_CONFIG) {
      console.error("Missing BOX_CONFIG environment variable");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Box service configuration error" }),
      };
    }

    // For individual accounts, use developer token (simpler than JWT)
    // Get token from: https://app.box.com/developers/console → Your App → Configuration → Developer Token
    let client;
    if (process.env.BOX_DEVELOPER_TOKEN) {
      const sdk = new BoxSDK({ clientID: "", clientSecret: "" });
      client = sdk.getBasicClient(process.env.BOX_DEVELOPER_TOKEN);
    } else {
      // Fallback to JWT for enterprise accounts
      const boxConfig = JSON.parse(process.env.BOX_CONFIG);
      const sdk = BoxSDK.getPreconfiguredInstance(boxConfig);
      client = sdk.getAppAuthClient("enterprise");
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const readable = new stream.PassThrough();
    readable.end(buffer);

    const folderId = process.env.BOX_FOLDER_ID || "0";

    const uploadResponse = await client.files.uploadFile(
      folderId,
      filename,
      readable,
    );
    const uploadedFile = uploadResponse.entries[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
      }),
    };
  } catch (error) {
    console.error("Box upload error:", error);

    if (error.statusCode === 409) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: "File already exists",
          details: error.message,
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to upload image to Box",
        details: error.message,
      }),
    };
  }
};

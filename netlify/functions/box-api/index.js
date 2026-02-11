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
    const { image, experimentID, participantID } = JSON.parse(event.body);

    if (!image || !experimentID || !participantID) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: image, experimentID, participantID",
        }),
      };
    }

    // Privacy-compliant filename: code number only (no participant ID) + expiration date
    const timestamp = Date.now();
    const codeNumber = `${timestamp}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    const expirationDate = new Date(timestamp);
    expirationDate.setFullYear(expirationDate.getFullYear() + 10);
    const expirationStr = expirationDate.toISOString().split("T")[0];
    const filename = `snapshot_${codeNumber}_expires_${expirationStr}.jpg`;

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

    // Create nested folder structure: [experiment]/[participantID]/
    const rootFolderId = "0";
    let targetFolderId = rootFolderId;

    try {
      let experimentFolderItems = await client.folders.getItems(rootFolderId, {
        fields: ["id", "name", "type"],
      });
      let experimentFolder = experimentFolderItems.entries?.find(
        (item) => item.type === "folder" && item.name === experimentID,
      );

      if (!experimentFolder) {
        experimentFolder = await client.folders.create(rootFolderId, experimentID);
      }
      const experimentFolderId = experimentFolder.id;

      // Step 2: Find or create participant folder inside session folder
      let participantFolderItems = await client.folders.getItems(experimentFolderId, {
        fields: ["id", "name", "type"],
      });
      let participantFolder = participantFolderItems.entries?.find(
        (item) => item.type === "folder" && item.name === participantID,
      );

      if (!participantFolder) {
        participantFolder = await client.folders.create(experimentFolderId, participantID);
      }
      targetFolderId = participantFolder.id;
    } catch (folderErr) {
      console.warn("Could not create/find folder structure:", folderErr.message);
      // Fall back to root if folder creation fails
      targetFolderId = rootFolderId;
    }

    const uploadResponse = await client.files.uploadFile(
      targetFolderId,
      filename,
      readable,
    );
    const uploadedFile = uploadResponse.entries[0];

    // Create a view-only shared link for the folder
    let sharedLinkUrl = null;
    try {
      const folderWithSharedLink = await client.folders.update(targetFolderId, {
        shared_link: {
          access: 'open', // 'open' = anyone with link, 'company' = company only
          permissions: {
            can_download: false,
            can_preview: true,
          },
        },
      });
      sharedLinkUrl = folderWithSharedLink.shared_link.url;
    } catch (linkError) {
      console.warn('Could not create shared link:', linkError.message);
      // Continue without shared link if it fails
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        fileName: uploadedFile.name,
        snapshotsLink: sharedLinkUrl,
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

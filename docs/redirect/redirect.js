// Parse query parameters from the OAuth callback
const urlSearchParams = new URLSearchParams(window.location.search);
const authCode = urlSearchParams.get("code");
const state = urlSearchParams.get("state");
const error = urlSearchParams.get("error");
const errorDescription = urlSearchParams.get("error_description");

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

sleep(500).then(() => {
  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    alert(`OAuth error: ${error}\n${errorDescription || ""}`);
    return;
  }

  // Decode state to extract return URL
  // Supports both OLD and NEW formats for backward compatibility:
  // - NEW format: base64(csrfToken|returnUrl)
  // - OLD format: URL-encoded URL
  let returnUrl = "/compiler/"; // Default fallback

  if (state) {
    try {
      // Try NEW format first: base64-encoded compound state
      const decoded = atob(state);
      const parts = decoded.split("|");

      if (parts.length === 2) {
        // NEW format: parts[0] is CSRF token, parts[1] is return URL
        returnUrl = parts[1];
        console.log(
          "Decoded return URL from compound state (NEW format):",
          returnUrl,
        );
      } else {
        // Might be OLD format that happened to be valid base64
        // Fall through to OLD format handling
        throw new Error("Not compound state format");
      }
    } catch (error) {
      // Failed to decode as NEW format, try OLD format
      try {
        // OLD format: URL-encoded URL
        returnUrl = decodeURI(state);
        console.log(
          "Decoded return URL from URI-encoded state (OLD format):",
          returnUrl,
        );
      } catch (oldFormatError) {
        console.error(
          "Failed to decode state parameter in any format:",
          error,
          oldFormatError,
        );
        // Fall back to default return URL
      }
    }
  }

  // Redirect back to original page with authorization code and state
  if (authCode && state) {
    // Append the authorization code and state to the return URL
    const separator = returnUrl.includes("?") ? "&" : "?";
    const redirectUrl = `${returnUrl}${separator}code=${authCode}&state=${state}`;

    console.log("OAuth redirect: returning to", redirectUrl);
    window.location.replace(redirectUrl);
  } else {
    console.error("Missing authorization code or state parameter");
    alert("OAuth redirect failed: missing code or state parameter");
  }
});

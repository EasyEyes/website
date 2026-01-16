// Parse query parameters from the OAuth callback
const urlSearchParams = new URLSearchParams(window.location.search);
const authCode = urlSearchParams.get("code");
const state = urlSearchParams.get("state");
const error = urlSearchParams.get("error");
const errorDescription = urlSearchParams.get("error_description");

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

//todo: possibly it should remove
sleep(500).then(() => {
  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    alert(`OAuth error: ${error}\n${errorDescription || ""}`);
    return;
  }

  // Decode compound state to extract return URL
  // Format: base64(csrfToken|returnUrl)
  let returnUrl = "/compiler/"; // Default fallback

  if (state) {
    try {
      const decoded = atob(state);
      const parts = decoded.split("|");
      if (parts.length === 2) {
        // parts[0] is CSRF token, parts[1] is return URL
        returnUrl = parts[1];
        console.log("Decoded return URL from state:", returnUrl);
      } else {
        console.warn("State parameter has unexpected format, using default");
      }
    } catch (error) {
      console.error("Failed to decode state parameter:", error);
      // Fall back to default return URL
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

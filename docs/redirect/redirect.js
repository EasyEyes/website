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

  // Get return URL from sessionStorage (stored by GitLabAuth.startAuthorization)
  // Default to /compiler/ if not found
  const returnUrl = sessionStorage.getItem("oauth_return_url") || "/compiler/";

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

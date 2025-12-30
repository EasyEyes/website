// Parse query parameters from the OAuth callback
const urlSearchParams = new URLSearchParams(window.location.search);
const authCode = urlSearchParams.get("code");
const redirectTarget = urlSearchParams.get("state");
const error = urlSearchParams.get("error");
const errorDescription = urlSearchParams.get("error_description");

// var dots = window.setInterval(function () {
//   var wait = document.getElementById("wait");
//   switch ((wait.innerHTML.match(/\./g) || []).length) {
//     case 0:
//       wait.innerHTML = ".&nbsp;&nbsp;";
//       break;
//     case 1:
//       wait.innerHTML = "..&nbsp;";
//       break;
//     case 2:
//       wait.innerHTML = "...";
//       break;
//     case 3:
//       wait.innerHTML = "&nbsp;&nbsp;&nbsp;";
//       break;
//     default:
//       break;
//   }
// }, 500);

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

  // Redirect back to original page with authorization code
  if (authCode && redirectTarget) {
    // Decode the state parameter to get the original URL
    const targetUrl = decodeURI(redirectTarget);

    // Append the authorization code to the target URL
    const separator = targetUrl.includes("?") ? "&" : "?";
    const redirectUrl = `${targetUrl}${separator}code=${authCode}`;

    window.location.replace(redirectUrl);
  } else {
    console.error("Missing authorization code or redirect target");
    alert("OAuth redirect failed: missing code or state parameter");
  }
});

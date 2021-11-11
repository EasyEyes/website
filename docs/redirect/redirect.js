const hrefSplit = window.location.href.split("/redirect/");

const urlSearchParams = new URLSearchParams(window.location.href);
const redirectTarget = urlSearchParams.get("state");

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

sleep(500).then(() => {
  if (hrefSplit.length > 1 && redirectTarget) {
    const tokenInfo = hrefSplit[1];
    console.log(tokenInfo.includes(`#access_token`));
    if (tokenInfo.includes(`#access_token`)) {
      window.location.replace(redirectTarget + tokenInfo);
    }
  }
});

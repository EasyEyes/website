const hrefSplit = window.location.href.split("/redirect/");

const urlSearchParams = new URLSearchParams(window.location.href);
const redirectTarget = urlSearchParams.get("state");

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
  if (hrefSplit.length > 1 && redirectTarget) {
    const tokenInfo = hrefSplit[1];
    if (tokenInfo.includes(`#access_token`)) {
      window.location.replace(redirectTarget + tokenInfo);
    }
  }
});

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const panelHolder = document.querySelector("#rc-panel-holder");
const resultsElement = document.querySelector("#rc-panel-results");
let resultsTitle, gazeMsg, distanceMsg;
let titleAdded = false; // "Results from the Calibrator" title

RemoteCalibrator.init({ id: "session_demo" });
RemoteCalibrator.panel(
  [
    {
      name: "screenSize",
      callback: (data) => {
        addTitle();
        printMessage(
          `Screen size is ${data.value.screenWidthCm} x ${data.value.screenHeightCm} cm.`
        );
      }, // If multiple, make a list
    },
    {
      name: "trackDistance",
      options: {
        showVideo: false,
        nearPoint: false,
      },
      callbackTrack: (data) => {
        addTitle();
        if (!distanceMsg)
          distanceMsg = printMessage(
            `Viewing distance is ${data.value.viewingDistanceCm} cm.`
          );
        printMessage(
          `Viewing distance is ${data.value.viewingDistanceCm} cm.`,
          distanceMsg
        );
      },
    },
    {
      name: "trackGaze",
      options: {
        showVideo: false,
        calibrationCount: 1,
      },
      callback: (data) => {
        addTitle();
        if (!gazeMsg)
          gazeMsg = printMessage(
            `Gaze is at (${data.value.x}, ${data.value.y}) px.`
          );
        printMessage(
          `Gaze is at (${data.value.x}, ${data.value.y}) px.`,
          gazeMsg
        );
      },
    },
  ],
  "#rc-panel-holder",
  {
    _demoActivateAll: true, // Only for this demo
  },
  () => {
    party.confetti(document.querySelector(".rc-panel-next-button"), {
      count: party.variation.range(40, 60),
    });
  }
);

const addTitle = () => {
  // panelHolder.style.marginBottom = '3rem'
  if (titleAdded) return;
  resultsElement.innerHTML += '<h3 class="rc-results-title">Results</h3>';
  titleAdded = true;
};

const printMessage = (msg, target = null) => {
  if (target) {
    target.innerHTML = msg;
    return target;
  }
  const p = document.createElement("p");
  p.className = "rc-result";
  p.innerHTML = msg;
  resultsElement.appendChild(p);
  return p;
};

function parseTimestamp(timestamp) {
  return `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}:${timestamp.getMilliseconds()}`;
}

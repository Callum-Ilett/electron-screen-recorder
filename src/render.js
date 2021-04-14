// window.api.receive("fromMain", (data) => {
//   console.log(`Received ${data} from main process`);
// });

// window.api.send("toMain", "some data");

const videoElement = document.querySelector("video");

const videoSelectBtn = document.getElementById("videoSelectBtn");
const startButton = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

videoSelectBtn.onclick = getVideoSources;

startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Recording";
};

stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};

let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

// // Get the available video sources
function getVideoSources() {
  const sources = window.electron.send("getVideoSources");
  window.electron.send("showMenu", sources);
  window.electron.receive("selectedOption", (data) => selectSource(data));
}

async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  // Create a Stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  // Create the Media Recorder
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  recordedChunks.push(e.data);
}

async function handleStop(e) {
  window.electron.send("saveFile");
}

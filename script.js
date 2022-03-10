navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.getUserMedia({ video: false, audio: true }, callback, console.log);

function callback(stream) {
  var ctx = new AudioContext();
  var mic = ctx.createMediaStreamSource(stream);
  var analyser = ctx.createAnalyser();
  analyser.threshold = 128;
  analyser.fftSize = 512;
  var osc = ctx.createOscillator();
  let dtmfFreqs = [
    [656, 750, 843, 937],
    [1218, 1312, 1500],
  ];
  let dtmfValues = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  mic.connect(analyser);
  osc.connect(ctx.destination);
  osc.start(0);

  var data = new Uint8Array(analyser.frequencyBinCount);

  function play() {
    analyser.getByteFrequencyData(data);

    // get fullest bin
    var idx = 0;
    var idx2 = 0;
    for (var j = 0; j < 12; j++) {
      if (data[j] > data[idx]) {
        idx = j;
      }
    }
    for (var j = 12; j < analyser.frequencyBinCount; j++) {
      if (idx !== j && data[j] > data[idx2]) {
        idx2 = j;
      }
    }

    var f1 = Math.floor((idx * ctx.sampleRate) / analyser.fftSize);
    var f2 = Math.floor((idx2 * ctx.sampleRate) / analyser.fftSize);

    // console.log(f1, f2);
    console.log(dtmfFreqs[0].indexOf(f1));
    console.log(dtmfFreqs[1].indexOf(f2));
    value = '';
    if (dtmfFreqs[0].includes(f1) && dtmfFreqs[1].includes(f2)) {
      value = dtmfValues[dtmfFreqs[0].indexOf(f1)][[dtmfFreqs[1].indexOf(f2)]];
    }

    document.getElementById('dtmf').innerText = value;
    osc.frequency.value = f1;

    requestAnimationFrame(play);
  }

  play();
}
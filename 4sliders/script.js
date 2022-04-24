navigator.mediaDevices
  .getUserMedia({ video: false, audio: true })
  .then(stream => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(val => handleDeviceList(val));
  });

function startAudio(deviceIndex) {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: { deviceId: { exact: deviceIndex } } })
    .then(stream => {
      var ctx = new AudioContext();
      var mic = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
      console.log(`Sample Rate: ${ctx.sampleRate}`);
      let inc = 0;
      for (let i = 0; i < 8; i++) {
        console.log(Math.floor((inc * ctx.sampleRate) / analyser.fftSize));

        if (i % 2 == 1) {
          inc += 10;
        } else {
          inc += 50;
        }
      }

      analyser.threshold = 128;
      // analyser.maxDecibels = -10;
      // analyser.minDecibels = -50;
      analyser.fftSize = 2048;
      let dtmfFreqs = [
        [689, 775, 861, 947],
        [1205, 1291, 1464, 1636],
      ];
      let dtmfValues = [
        ['1', '2', '3', 'A'],
        ['4', '5', '6', 'B'],
        ['7', '8', '9', 'C'],
        ['*', '0', '#', 'D'],
      ];

      mic.connect(analyser);

      var data = new Uint8Array(analyser.frequencyBinCount);

      function play() {
        analyser.getByteFrequencyData(data);

        // get fullest bin
        var idx = 0;
        var idx2 = 0;
        var idx3 = 0;
        var idx4 = 0;
        for (var j = 1; j < 50; j++) {
          if (data[j] > data[idx]) {
            idx = j;
          }
        }
        for (var j = 61; j < 110; j++) {
          if (idx !== j && data[j] > data[idx2]) {
            idx2 = j;
          }
        }
        for (var j = 121; j < 170; j++) {
          if (idx !== j && data[j] > data[idx3]) {
            idx3 = j;
          }
        }
        for (var j = 181; j < 230; j++) {
          if (idx !== j && data[j] > data[idx3]) {
            idx4 = j;
          }
        }
        var f1 = Math.floor((idx * ctx.sampleRate) / analyser.fftSize);
        var f2 = Math.floor((idx2 * ctx.sampleRate) / analyser.fftSize);
        var f3 = Math.floor((idx3 * ctx.sampleRate) / analyser.fftSize);
        var f4 = Math.floor((idx4 * ctx.sampleRate) / analyser.fftSize);
        if (f1 !== 0) {
          document.getElementById('slider1').value = idx;
        }
        if (f2 !== 0) {
          document.getElementById('slider2').value = idx2 - 60;
        }
        if (f3 !== 0) {
          document.getElementById('slider3').value = idx3 - 120;
        }
        if (f4 !== 0) {
          document.getElementById('slider4').value = idx4 - 180;
        }
        console.log(f1, f2, f3, f4);
        // console.log(dtmfFreqs[0].indexOf(f1));
        // console.log(dtmfFreqs[1].indexOf(f2));
        value = '';
        if (dtmfFreqs[0].includes(f1) && dtmfFreqs[1].includes(f2)) {
          value =
            dtmfValues[dtmfFreqs[0].indexOf(f1)][[dtmfFreqs[1].indexOf(f2)]];
        }

        document.getElementById('dtmf').innerText = value;

        requestAnimationFrame(play);
      }
      play();
    })
    .catch(err => {
      console.log('u got an error:' + err);
    });
}

let deviceOptions;
function handleDeviceList(list) {
  deviceOptions = list;
  for (let i = 0; i < list.length; i++) {
    let listItem = document.createElement('button');
    listItem.addEventListener('click', () => {
      startAudio(list[i].deviceId);
      document.getElementById(
        'device-confirmation'
      ).innerText = `Starting Audio device: ${list[i].label}`;
      document.getElementById('device-list').hidden = true;
    });
    let text = document.createTextNode(list[i].label);
    listItem.appendChild(text);
    document.getElementById('device-list').appendChild(listItem);
  }
}

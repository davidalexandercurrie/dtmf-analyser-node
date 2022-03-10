navigator.mediaDevices.enumerateDevices().then(val => printDeviceList(val));

function startAudio() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then(stream => {
      var ctx = new AudioContext();
      var mic = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
      analyser.threshold = 128;
      analyser.fftSize = 512;
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

function printDeviceList(list) {
  for (let i = 0; i < list.length; i++) {
    console.log(list[i].label);
    let listItem = document.createElement('p');
    let text = document.createTextNode(list[i].label);
    listItem.appendChild(text);
    document.getElementById('device-list').appendChild(listItem);
  }
}

(function() {
  'use strict';
  var AudioContext = window.AudioContext || window.webkitAudioContext || false;

  var BPM = 120;
  var TICKS = 16;
  var soundPrefix = 'https://blog.omgmog.net/beatmaker/sounds/';
  var sounds = [
    'bass_drum.wav',
    'snare_drum.wav',
    'low_tom.wav',
    'mid_tom.wav',
    'hi_tom.wav',
    'rim_shot.wav',
    'hand_clap.wav',
    'cowbell.wav',
    'cymbal.wav',
    'o_hi_hat.wav',
    'cl_hi_hat.wav',
    'low_conga.wav',
    'mid_conga.wav',
    'hi_conga.wav',
    'claves.wav',
    'maracas.wav'
  ];
  var buffers = {};
  if (AudioContext) {
    var context = new AudioContext();
  }

  var playSound = function (index) {
    var url = soundPrefix + sounds[index];

    if (!AudioContext) {
      new Audio(url).play();
      return;
    }
    if (typeof(buffers[url]) == 'undefined') {
      buffers[url] = null;
      var req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';

      req.onload = function () {
        context.decodeAudioData(req.response,
          function (buffer) {
            buffers[url] = buffer;
            playBuffer(buffer);
          },
          function (err) {
            console.log(err);
          }
        );
      };
      req.send();
    }
    function playBuffer(buffer) {
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();
    };
    if (buffers[url]) {
      playBuffer(buffers[url]);
    }
  };
  var slength = sounds.length;
  var $grid = document.querySelectorAll('.grid')[0];
  var $button = document.createElement('button');
  $button.classList.add('beat');

  for (var r = 0; r < slength; r++) {
    for (var c = 0; c < TICKS; c++) {
      var _$button = $button.cloneNode(true);
      if (c === 0) {
        _$button.classList.add('first');
      }
      // add a class based on the instrument
      var soundname = sounds[r].split('.')[0];
      _$button.classList.add(soundname);
      _$button.dataset.instrument = soundname;

      _$button.addEventListener('click', function() {
        this.classList.toggle('on');
      }, false);
      $grid.appendChild(_$button);
    }
  }

  var $beats = document.querySelectorAll('.beat');

  var clearBeat = function() {
    var $onbeats = document.querySelectorAll('.beat.on');
    if (!$onbeats.length) return;
    for (var r = 0; r < slength; r++) {
      for (var c = 0; c < TICKS; c++) {
        var cell = $onbeats[c + (r * TICKS)];
        if (cell) {
          cell.classList.remove('on');
        }
      }
    }
  };
  document.querySelector('#clear').addEventListener('click', clearBeat);

  var setRandomBeat = function() {
    clearBeat();

    for (var r = 0; r < slength; r++) {
      for (var c = 0; c < TICKS; c++) {
        var num = Math.ceil(Math.random() * 100) % 3;
        if (num === 0) {
          $beats[c + (r * TICKS)].classList.toggle('on');
        }
      }
    }
  };
  document.querySelector('#random').addEventListener('click', setRandomBeat);

  var exportBeat = function () {
    // create an object so we can jsonify it later
    var exportData = {}
    // for each row (sound)
    sounds.forEach(function (sound) {
      // get the soundname, without .wav
      var soundname = sound.split('.')[0];

      // create arrays
      var cellsgrouped = [];

      // this will give us [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      var cellsbuffer = Array.apply(null, Array(TICKS)).map(Number.prototype.valueOf,0);

      // set the size of a group
      var groupsize = 4;

      // select all of the cells in the beat maker by the current soundname
      var cells = document.querySelectorAll(`.beat.${soundname}`);

      // loop over the cells
      for (var i=0; i<cells.length;i++) {
        // if it's on, the value is 1
        if (cells[i].classList.contains('on')) {
          cellsbuffer[i] = 1;
        }
      }
      // group the cells in to sets
      // this will give us [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
      while (cellsbuffer.length > 0) {
        cellsgrouped.push(cellsbuffer.splice(0, groupsize));
      }
      // update the object
      exportData[soundname] = cellsgrouped;

    });

    // create json that can be downloaded
    var data_string = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    var download_link = document.getElementById('download_link');
    download_link.setAttribute("href", data_string);
    download_link.setAttribute("download", "tracks.json");

    // trigger download
    download_link.click();
  };
  document.querySelector('#export').addEventListener('click', exportBeat);

  var currentTick = 0;
  var lastTick = TICKS - 1;
  var tickTime = 1 / (4 * BPM / (60 * 1000));

  var requestInterval = function(fn, delay) {
    var start = new Date().getTime();
    var handle = {};

    function loop() {
      var current = new Date().getTime();
      var delta = current - start;
      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }
      handle.value = requestAnimationFrame(loop);
    }
    handle.value = requestAnimationFrame(loop);
    return handle;
  };

  requestInterval(function() {
    for (var i = 0; i < slength; i++) {
      var lastBeat = $beats[i * TICKS + lastTick];
      var currentBeat = $beats[i * TICKS + currentTick];
      lastBeat.classList.remove('ticked');
      currentBeat.classList.add('ticked');
      if (currentBeat.classList.contains('on')) {
        // new Audio(soundPrefix + sounds[i]).play();

        playSound(i);
      }
    }
    lastTick = currentTick;
    currentTick = (currentTick + 1) % TICKS;
  }, 1 / (4 * BPM / (60 * 1000)));
}());

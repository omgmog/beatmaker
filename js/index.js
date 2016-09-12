(function() {
  'use strict';

  var BPM = 120;
  var TICKS = 16;
  var soundPrefix = 'https://blog.omgmog.net/beatmaker/';
  var sounds = [
    'sounds/bass_drum.wav',
    'sounds/snare_drum.wav',
    'sounds/low_tom.wav',
    'sounds/mid_tom.wav',
    'sounds/hi_tom.wav',
    'sounds/rim_shot.wav',
    'sounds/hand_clap.wav',
    'sounds/cowbell.wav',
    'sounds/cymbal.wav',
    'sounds/o_hi_hat.wav',
    'sounds/cl_hi_hat.wav',
    'sounds/low_conga.wav',
    'sounds/mid_conga.wav',
    'sounds/hi_conga.wav',
    'sounds/claves.wav',
    'sounds/maracas.wav'
  ];
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
        $onbeats[c + (r * TICKS)].classList.remove('on');
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
        new Audio(soundPrefix + sounds[i]).play();
      }
    }
    lastTick = currentTick;
    currentTick = (currentTick + 1) % TICKS;
  }, 1 / (4 * BPM / (60 * 1000)));
}());
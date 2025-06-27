// timer.js
// Timer de leitura, cronômetro, contagem regressiva e notificações

var_objTimer = {
  modo: 'leitura',
  tempoTotal: 0,
  tempoRestante: 0,
  intervalo: null,
};

function _func_InicializarTimer() {
  var btnLeitura = document.getElementById('btn_timer_leitura');
  var btnCronometro = document.getElementById('btn_timer_cronometro');
  var btnRegressiva = document.getElementById('btn_timer_regressiva');
  var btnPausar = document.getElementById('btn_timer_pausar');
  var btnRetornar = document.getElementById('btn_timer_retornar');
  var btnResetar = document.getElementById('btn_timer_resetar');
  if (btnLeitura) btnLeitura.addEventListener('click', function() { _func_IniciarTimerLeitura(); });
  if (btnCronometro) btnCronometro.addEventListener('click', function() { _func_IniciarCronometro(); });
  if (btnRegressiva) btnRegressiva.addEventListener('click', function() { var minutos = prompt('Quantos minutos?'); var min = parseInt(minutos); if (!isNaN(min) && min > 0) _func_IniciarContagemRegressiva(min * 60); });
  if (btnPausar) btnPausar.addEventListener('click', _func_PausarTimer);
  if (btnRetornar) btnRetornar.addEventListener('click', _func_RetomarTimer);
  if (btnResetar) btnResetar.addEventListener('click', _func_ResetarTimer);
  _func_AtualizarDisplayTimer(0);
}

function _func_IniciarTimerLeitura() {
  _func_ResetarTimer();
  var_objTimer.modo = 'leitura';
  var_objTimer.tempoTotal = 0;
  var_objTimer.intervalo = setInterval(function() {
    var_objTimer.tempoTotal++;
    _func_AtualizarDisplayTimer(var_objTimer.tempoTotal);
  }, 1000);
}

function _func_IniciarCronometro() {
  _func_ResetarTimer();
  var_objTimer.modo = 'cronometro';
  var_objTimer.tempoTotal = 0;
  var_objTimer.intervalo = setInterval(function() {
    var_objTimer.tempoTotal++;
    _func_AtualizarDisplayTimer(var_objTimer.tempoTotal);
  }, 1000);
}

function _func_IniciarContagemRegressiva(var_tempo) {
  _func_ResetarTimer();
  var_objTimer.modo = 'regressiva';
  var_objTimer.tempoRestante = var_tempo;
  _func_AtualizarDisplayTimer(var_objTimer.tempoRestante);
  var_objTimer.intervalo = setInterval(function() {
    var_objTimer.tempoRestante--;
    _func_AtualizarDisplayTimer(var_objTimer.tempoRestante);
    if (var_objTimer.tempoRestante <= 0) {
      _func_ResetarTimer();
      _func_NotificarTimer();
    }
  }, 1000);
}

function _func_PausarTimer() {
  if (var_objTimer.intervalo) {
    clearInterval(var_objTimer.intervalo);
    var_objTimer.intervalo = null;
  }
}

function _func_RetomarTimer() {
  if (!var_objTimer.intervalo) {
    if (var_objTimer.modo === 'leitura' || var_objTimer.modo === 'cronometro') {
      var_objTimer.intervalo = setInterval(function() {
        var_objTimer.tempoTotal++;
        _func_AtualizarDisplayTimer(var_objTimer.tempoTotal);
      }, 1000);
    } else if (var_objTimer.modo === 'regressiva') {
      var_objTimer.intervalo = setInterval(function() {
        var_objTimer.tempoRestante--;
        _func_AtualizarDisplayTimer(var_objTimer.tempoRestante);
        if (var_objTimer.tempoRestante <= 0) {
          _func_ResetarTimer();
          _func_NotificarTimer();
        }
      }, 1000);
    }
  }
}

function _func_ResetarTimer() {
  if (var_objTimer.intervalo) {
    clearInterval(var_objTimer.intervalo);
    var_objTimer.intervalo = null;
  }
  var_objTimer.tempoTotal = 0;
  var_objTimer.tempoRestante = 0;
  _func_AtualizarDisplayTimer(0);
}

function _func_AtualizarDisplayTimer(segundos) {
  var h = Math.floor(segundos / 3600);
  var m = Math.floor((segundos % 3600) / 60);
  var s = segundos % 60;
  document.getElementById('timer_display').textContent =
    (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function _func_NotificarTimer() {
  alert('Tempo esgotado!');
  if (typeof _func_PararLeituraTTS === 'function') _func_PararLeituraTTS();
  // Som opcional
  try {
    var audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c3e.mp3');
    audio.play();
  } catch (e) {}
} 
// tts.js
// Controle do TTS usando Web Speech API

var_objTTS = {
  synth: window.speechSynthesis,
  vozes: [],
  vozAtual: null,
  velocidade: 1,
  tom: 1,
  volume: 1,
};

function _func_InicializarTTS() {
  _func_CarregarVozesTTS();
  document.getElementById('select_voz').addEventListener('change', _func_SelecionarVozTTS);
  document.getElementById('btn_teste_voz').addEventListener('click', _func_TestarVozTTS);
  document.getElementById('range_velocidade').addEventListener('input', _func_AjustarVelocidadeTTS);
  document.getElementById('range_tom').addEventListener('input', _func_AjustarTomTTS);
  document.getElementById('range_volume').addEventListener('input', _func_AjustarVolumeTTS);
  document.getElementById('btn_iniciar_leitura').addEventListener('click', _func_IniciarLeituraTTS);
  document.getElementById('btn_pausar_leitura').addEventListener('click', _func_PausarLeituraTTS);
  document.getElementById('btn_parar_leitura').addEventListener('click', _func_PararLeituraTTS);
}

function _func_CarregarVozesTTS() {
  var_objTTS.vozes = var_objTTS.synth.getVoices();
  var select = document.getElementById('select_voz');
  select.innerHTML = '';
  var_objTTS.vozes.forEach(function(voz, idx) {
    var opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = voz.name + (voz.lang ? ' (' + voz.lang + ')' : '');
    select.appendChild(opt);
  });
  // Selecionar a primeira voz por padrão
  if (var_objTTS.vozes.length > 0) {
    select.selectedIndex = 0;
    var_objTTS.vozAtual = var_objTTS.vozes[0];
  }
}

// Atualizar lista de vozes quando disponível (alguns browsers carregam async)
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = _func_CarregarVozesTTS;
}

function _func_SelecionarVozTTS() {
  var select = document.getElementById('select_voz');
  var idx = select.value;
  var_objTTS.vozAtual = var_objTTS.vozes[idx];
}

function _func_TestarVozTTS() {
  var utter = new SpeechSynthesisUtterance('Esta é uma amostra da voz selecionada.');
  utter.voice = var_objTTS.vozAtual;
  utter.rate = var_objTTS.velocidade;
  utter.pitch = var_objTTS.tom;
  utter.volume = var_objTTS.volume;
  var_objTTS.synth.cancel();
  var_objTTS.synth.speak(utter);
}

function _func_AjustarVelocidadeTTS() {
  var val = parseFloat(document.getElementById('range_velocidade').value);
  var_objTTS.velocidade = val;
  document.getElementById('velocidade_valor').textContent = val.toFixed(1);
}

function _func_AjustarTomTTS() {
  var val = parseFloat(document.getElementById('range_tom').value);
  var_objTTS.tom = val;
  document.getElementById('tom_valor').textContent = val.toFixed(1);
}

function _func_AjustarVolumeTTS() {
  var val = parseFloat(document.getElementById('range_volume').value);
  var_objTTS.volume = val;
  document.getElementById('volume_valor').textContent = val.toFixed(1);
}

// Ao inicializar, garantir que os sliders reflitam o valor salvo
function _func_SincronizarSlidersTTS() {
  document.getElementById('range_velocidade').value = var_objTTS.velocidade;
  document.getElementById('velocidade_valor').textContent = var_objTTS.velocidade.toFixed(1);
  document.getElementById('range_tom').value = var_objTTS.tom;
  document.getElementById('tom_valor').textContent = var_objTTS.tom.toFixed(1);
  document.getElementById('range_volume').value = var_objTTS.volume;
  document.getElementById('volume_valor').textContent = var_objTTS.volume.toFixed(1);
}

// Chamar ao inicializar TTS
var _old_InicializarTTS = _func_InicializarTTS;
_func_InicializarTTS = function() {
  _old_InicializarTTS();
  _func_SincronizarSlidersTTS();
};

function _func_IniciarLeituraTTS() {
  if (!var_objNavegacao.sentencas || var_objNavegacao.sentencas.length === 0) return;
  var_objTTS.synth.cancel();
  _func_LerSentencaTTS(var_objNavegacao.sentencaAtual);
}

function _func_LerSentencaTTS(idx) {
  if (idx >= var_objNavegacao.sentencas.length) return;
  var sent = var_objNavegacao.sentencas[idx];
  var utter = new SpeechSynthesisUtterance(sent);
  utter.voice = var_objTTS.vozAtual;
  utter.rate = var_objTTS.velocidade;
  utter.pitch = var_objTTS.tom;
  utter.volume = var_objTTS.volume;
  utter.onend = function() {
    // Avançar para próxima sentença automaticamente
    if (!var_objTTS.synth.paused && !var_objTTS.synth.speaking) {
      if (var_objNavegacao.sentencaAtual < var_objNavegacao.sentencas.length - 1) {
        _func_IrParaSentenca(var_objNavegacao.sentencaAtual + 1);
        _func_LerSentencaTTS(var_objNavegacao.sentencaAtual);
      } else if (var_objNavegacao.capituloAtual < var_objEPUB.capitulos.length - 1) {
        // Se chegou ao fim do capítulo, vá para o próximo e inicie a leitura
        _func_IrParaCapitulo(var_objNavegacao.capituloAtual + 1);
        _func_IniciarLeituraTTS();
      }
    }
  };
  var_objTTS.synth.speak(utter);
}

function _func_PausarLeituraTTS() {
  if (var_objTTS.synth.speaking && !var_objTTS.synth.paused) {
    var_objTTS.synth.pause();
  }
}

function _func_RetomarLeituraTTS() {
  if (var_objTTS.synth.paused) {
    var_objTTS.synth.resume();
  }
}

function _func_PararLeituraTTS() {
  var_objTTS.synth.cancel();
} 
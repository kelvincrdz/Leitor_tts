// settings.js
// Configurações e personalização

var_objSettings = {
  velocidade: 1,
  tom: 1,
  volume: 1,
  pausaPontuacao: true,
  substituicoes: {},
  tema: 'claro',
};

function _func_InicializarSettings() {
  document.getElementById('btn_abrir_config').addEventListener('click', _func_ExibirConfig);
  document.getElementById('btn_fechar_config').addEventListener('click', function() {
    document.getElementById('modal_config').classList.add('hidden');
  });
  _func_CarregarSettings();
}

function _func_ExibirConfig() {
  var el = document.getElementById('config_conteudo');
  el.innerHTML = `
    <div class='mb-2'>
      <label>Velocidade: <input id='config_velocidade' type='number' min='0.5' max='2' step='0.1' value='${var_objSettings.velocidade}' class='border p-1 w-16'></label>
    </div>
    <div class='mb-2'>
      <label>Tom: <input id='config_tom' type='number' min='0.5' max='2' step='0.1' value='${var_objSettings.tom}' class='border p-1 w-16'></label>
    </div>
    <div class='mb-2'>
      <label>Volume: <input id='config_volume' type='number' min='0' max='1' step='0.1' value='${var_objSettings.volume}' class='border p-1 w-16'></label>
    </div>
    <div class='mb-2'>
      <label><input id='config_pausa_pontuacao' type='checkbox' ${var_objSettings.pausaPontuacao ? 'checked' : ''}> Pausar após pontuação</label>
    </div>
    <div class='mb-2'>
      <label>Tema: <select id='config_tema' class='border p-1'>
        <option value='claro' ${var_objSettings.tema === 'claro' ? 'selected' : ''}>Claro</option>
        <option value='escuro' ${var_objSettings.tema === 'escuro' ? 'selected' : ''}>Escuro</option>
      </select></label>
    </div>
    <div class='mb-2'>
      <label>Substituições de palavras:</label>
      <div id='config_substituicoes_lista'></div>
      <input id='config_nova_palavra' type='text' placeholder='Palavra' class='border p-1 w-24'>
      <input id='config_nova_pronuncia' type='text' placeholder='Pronúncia' class='border p-1 w-24'>
      <button id='btn_add_substituicao' class='btn'>Adicionar</button>
    </div>
  `;
  _func_ExibirSubstituicoes();
  document.getElementById('config_velocidade').addEventListener('change', function(e) {
    _func_AjustarConfiguracao('velocidade', parseFloat(e.target.value));
  });
  document.getElementById('config_tom').addEventListener('change', function(e) {
    _func_AjustarConfiguracao('tom', parseFloat(e.target.value));
  });
  document.getElementById('config_volume').addEventListener('change', function(e) {
    _func_AjustarConfiguracao('volume', parseFloat(e.target.value));
  });
  document.getElementById('config_pausa_pontuacao').addEventListener('change', function(e) {
    _func_AjustarConfiguracao('pausaPontuacao', e.target.checked);
  });
  document.getElementById('config_tema').addEventListener('change', function(e) {
    _func_TrocarTema(e.target.value);
  });
  document.getElementById('btn_add_substituicao').addEventListener('click', function() {
    var palavra = document.getElementById('config_nova_palavra').value.trim();
    var pronuncia = document.getElementById('config_nova_pronuncia').value.trim();
    if (palavra && pronuncia) {
      _func_AdicionarSubstituicao(palavra, pronuncia);
      document.getElementById('config_nova_palavra').value = '';
      document.getElementById('config_nova_pronuncia').value = '';
      _func_ExibirSubstituicoes();
    }
  });
}

function _func_ExibirSubstituicoes() {
  var el = document.getElementById('config_substituicoes_lista');
  el.innerHTML = '';
  Object.entries(var_objSettings.substituicoes).forEach(function([palavra, pronuncia]) {
    var div = document.createElement('div');
    div.className = 'flex gap-2 items-center';
    div.innerHTML = `<span>${palavra} → ${pronuncia}</span> <button class='btn' data-palavra='${palavra}'>Remover</button>`;
    div.querySelector('button').onclick = function() {
      _func_RemoverSubstituicao(palavra);
      _func_ExibirSubstituicoes();
    };
    el.appendChild(div);
  });
}

function _func_AjustarConfiguracao(var_nome, var_valor) {
  var_objSettings[var_nome] = var_valor;
  _func_SalvarSettings();
  // Atualizar TTS se necessário
  if (var_nome === 'velocidade' && typeof _func_AjustarVelocidadeTTS === 'function') _func_AjustarVelocidadeTTS();
  if (var_nome === 'tom' && typeof _func_AjustarTomTTS === 'function') _func_AjustarTomTTS();
  if (var_nome === 'volume' && typeof _func_AjustarVolumeTTS === 'function') _func_AjustarVolumeTTS();
}

function _func_TrocarTema(var_tema) {
  var_objSettings.tema = var_tema;
  document.body.classList.toggle('bg-gray-900', var_tema === 'escuro');
  document.body.classList.toggle('text-white', var_tema === 'escuro');
  _func_SalvarSettings();
}

function _func_AdicionarSubstituicao(var_termo, var_pronuncia) {
  var_objSettings.substituicoes[var_termo] = var_pronuncia;
  _func_SalvarSettings();
}

function _func_RemoverSubstituicao(var_termo) {
  delete var_objSettings.substituicoes[var_termo];
  _func_SalvarSettings();
}

function _func_SalvarSettings() {
  if (typeof _func_SalvarEstado === 'function') _func_SalvarEstado('settings', var_objSettings);
}

function _func_CarregarSettings() {
  if (typeof _func_CarregarEstado === 'function') {
    var s = _func_CarregarEstado('settings');
    if (s && typeof s === 'object') Object.assign(var_objSettings, s);
  }
  // Aplicar tema ao carregar
  _func_TrocarTema(var_objSettings.tema);
  // Aplicar configurações de TTS ao carregar
  if (typeof var_objTTS !== 'undefined') {
    var_objTTS.velocidade = var_objSettings.velocidade;
    var_objTTS.tom = var_objSettings.tom;
    var_objTTS.volume = var_objSettings.volume;
    if (typeof _func_SincronizarSlidersTTS === 'function') _func_SincronizarSlidersTTS();
  }
}

// Salvar configurações ao mudar sliders de TTS
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    var v = document.getElementById('range_velocidade');
    var t = document.getElementById('range_tom');
    var vol = document.getElementById('range_volume');
    if (v) v.addEventListener('input', function() {
      var_objSettings.velocidade = parseFloat(v.value);
      _func_SalvarSettings();
    });
    if (t) t.addEventListener('input', function() {
      var_objSettings.tom = parseFloat(t.value);
      _func_SalvarSettings();
    });
    if (vol) vol.addEventListener('input', function() {
      var_objSettings.volume = parseFloat(vol.value);
      _func_SalvarSettings();
    });
  });
} 
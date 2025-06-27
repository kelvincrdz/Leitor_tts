// stats.js
// Estatísticas de leitura

var_objStats = {
  totalCapitulos: 0,
  totalPalavras: 0,
  totalCaracteres: 0,
  progresso: 0,
  tempoLeitura: 0,
  qtdMarcadores: 0,
};

function _func_InicializarStats() {
  document.getElementById('btn_stats').addEventListener('click', _func_ExibirStats);
  document.getElementById('btn_fechar_stats').addEventListener('click', function() {
    document.getElementById('modal_stats').classList.add('hidden');
  });
}

function _func_AtualizarStats() {
  var_objStats.totalCapitulos = var_objEPUB.capitulos.length;
  var_objStats.totalPalavras = 0;
  var_objStats.totalCaracteres = 0;
  (var_objEPUB.capitulos || []).forEach(function(cap) {
    var texto = document.createElement('div');
    texto.innerHTML = cap.conteudo;
    var plain = texto.textContent || texto.innerText || '';
    var_objStats.totalPalavras += plain.split(/\s+/).filter(Boolean).length;
    var_objStats.totalCaracteres += plain.length;
  });
  var_objStats.qtdMarcadores = Array.isArray(var_arrMarcadores) ? var_arrMarcadores.length : 0;
  var_objStats.progresso = (var_objNavegacao.capituloAtual + 1) + ' / ' + var_objStats.totalCapitulos;
  var_objStats.tempoLeitura = (typeof var_objTimer !== 'undefined') ? var_objTimer.tempoTotal : 0;
}

function _func_ExibirStats() {
  _func_AtualizarStats();
  var stats = var_objStats;
  var el = document.getElementById('stats_conteudo');
  el.innerHTML = `
    <div><b>Capítulos:</b> ${stats.totalCapitulos}</div>
    <div><b>Palavras:</b> ${stats.totalPalavras}</div>
    <div><b>Caracteres:</b> ${stats.totalCaracteres}</div>
    <div><b>Progresso:</b> ${stats.progresso}</div>
    <div><b>Tempo de leitura:</b> ${_func_FormatarTempo(stats.tempoLeitura)}</div>
    <div><b>Marcadores:</b> ${stats.qtdMarcadores}</div>
  `;
  document.getElementById('modal_stats').classList.remove('hidden');
}

function _func_FormatarTempo(segundos) {
  var h = Math.floor(segundos / 3600);
  var m = Math.floor((segundos % 3600) / 60);
  var s = segundos % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
} 
// navigation.js
// Navegação por capítulos, sentenças e atalhos

var_objNavegacao = {
  capituloAtual: 0,
  sentencaAtual: 0,
};

function _func_InicializarNavegacao() {
  // Inicializar listeners de navegação
}

function _func_IrParaCapitulo(var_numCapitulo) {
  var_objNavegacao.capituloAtual = var_numCapitulo;
  var_objNavegacao.sentencaAtual = 0;
  var cap = var_objEPUB.capitulos[var_numCapitulo];
  var container = document.getElementById('container_leitura');
  if (!cap) { container.innerHTML = ''; return; }
  // Dividir o conteúdo em sentenças
  var sentencas = _func_ExtrairSentencas(cap.conteudo);
  var_objNavegacao.sentencas = sentencas;
  container.innerHTML = '';
  // Novo: Agrupar sentenças em parágrafos de tamanho razoável
  var paragrafo = null;
  sentencas.forEach(function(sent, idx) {
    if (idx % 4 === 0) { // Novo parágrafo a cada 4 sentenças
      paragrafo = document.createElement('p');
      paragrafo.className = 'paragrafo-leitura mb-4 text-justify';
      container.appendChild(paragrafo);
    }
    var span = document.createElement('span');
    span.textContent = sent + ' ';
    span.className = 'sentenca cursor-pointer px-1 rounded hover:bg-blue-100';
    span.onclick = function() { _func_IrParaSentenca(idx); };
    paragrafo.appendChild(span);
  });
  _func_DestacarSentencaAtual();
}

function _func_ExtrairSentencas(html) {
  // Remove tags e divide por pontuação final (., !, ?)
  var temp = document.createElement('div');
  temp.innerHTML = html;
  var texto = temp.textContent || temp.innerText || '';
  // Regex para sentenças (simples)
  var arr = texto.match(/[^.!?\r\n]+[.!?…]+|[^.!?\r\n]+$/g) || [];
  return arr.map(s => s.trim()).filter(Boolean);
}

function _func_IrParaSentenca(var_numSentenca) {
  var_objNavegacao.sentencaAtual = var_numSentenca;
  _func_DestacarSentencaAtual();
  if (typeof _func_LerSentencaTTS === 'function' && var_objTTS && var_objTTS.synth && var_objTTS.synth.speaking) {
    var_objTTS.synth.cancel();
    _func_LerSentencaTTS(var_numSentenca);
  }
}

function _func_DestacarSentencaAtual() {
  var container = document.getElementById('container_leitura');
  var spans = container.querySelectorAll('.sentenca');
  spans.forEach(function(span, idx) {
    if (idx === var_objNavegacao.sentencaAtual) {
      span.classList.add('bg-yellow-200');
      span.scrollIntoView({behavior: 'smooth', block: 'center'});
    } else {
      span.classList.remove('bg-yellow-200');
    }
  });
}

function _func_IrParaSentencaAnteriorLeitura() {
  if (var_objNavegacao.sentencaAtual > 0) {
    _func_IrParaSentenca(var_objNavegacao.sentencaAtual - 1);
    if (typeof _func_LerSentencaTTS === 'function') _func_LerSentencaTTS(var_objNavegacao.sentencaAtual);
  }
}

function _func_IrParaProximaSentencaLeitura() {
  if (var_objNavegacao.sentencaAtual < (var_objNavegacao.sentencas.length - 1)) {
    _func_IrParaSentenca(var_objNavegacao.sentencaAtual + 1);
    if (typeof _func_LerSentencaTTS === 'function') _func_LerSentencaTTS(var_objNavegacao.sentencaAtual);
  }
} 
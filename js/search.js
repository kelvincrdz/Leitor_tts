// search.js
// Busca local e global, destaque e navegação entre resultados

var_objBusca = {
  resultados: [],
  indiceAtual: 0,
};

function _func_InicializarBusca() {
  document.getElementById('btn_busca_local').addEventListener('click', function() {
    var termo = document.getElementById('input_busca').value.trim();
    _func_BuscarLocal(termo);
  });
  document.getElementById('btn_busca_global').addEventListener('click', function() {
    var termo = document.getElementById('input_busca').value.trim();
    _func_BuscarGlobal(termo);
  });
  // Listeners para navegação de resultados
  document.getElementById('btn_resultado_anterior').addEventListener('click', function() {
    _func_NavegarResultado(-1);
    _func_AtualizarInfoResultado();
  });
  document.getElementById('btn_resultado_proximo').addEventListener('click', function() {
    _func_NavegarResultado(1);
    _func_AtualizarInfoResultado();
  });
}

function _func_BuscarLocal(var_termo) {
  var_objBusca.resultados = [];
  var_objBusca.indiceAtual = 0;
  if (!var_termo) return;
  var sentencas = var_objNavegacao.sentencas || [];
  sentencas.forEach(function(sent, idx) {
    if (sent.toLowerCase().includes(var_termo.toLowerCase())) {
      var_objBusca.resultados.push({capitulo: var_objNavegacao.capituloAtual, sentenca: idx});
    }
  });
  _func_DestacarResultados(var_termo);
}

function _func_BuscarGlobal(var_termo) {
  var_objBusca.resultados = [];
  var_objBusca.indiceAtual = 0;
  if (!var_termo) return;
  (var_objEPUB.capitulos || []).forEach(function(cap, cidx) {
    var sentencas = _func_ExtrairSentencas(cap.conteudo);
    sentencas.forEach(function(sent, sidx) {
      if (sent.toLowerCase().includes(var_termo.toLowerCase())) {
        var_objBusca.resultados.push({capitulo: cidx, sentenca: sidx});
      }
    });
  });
  _func_DestacarResultados(var_termo);
}

function _func_DestacarResultados(var_termo) {
  var container = document.getElementById('resultados_busca');
  var list = document.getElementById('searchResultsList');
  list.innerHTML = '';
  if (var_objBusca.resultados.length === 0) {
    container.classList.remove('hidden');
    list.textContent = 'Nenhum resultado.';
    document.getElementById('busca_resultado_info').textContent = '';
    return;
  }
  container.classList.remove('hidden');
  // Exibir todos os resultados como botões
  var_objBusca.resultados.forEach(function(res, idx) {
    var btn = document.createElement('button');
    btn.textContent = 'Capítulo ' + (res.capitulo+1) + ', sentença ' + (res.sentenca+1);
    btn.className = 'text-blue-700 underline mr-2';
    btn.onclick = function() {
      _func_NavegarResultado(idx);
      _func_AtualizarInfoResultado();
    };
    list.appendChild(btn);
  });
  // Navegar para o primeiro resultado
  if (var_objBusca.resultados.length > 0) {
    _func_NavegarResultado(0);
    _func_AtualizarInfoResultado();
  }
}

// Atualiza o texto de info e destaca o trecho encontrado
function _func_AtualizarInfoResultado() {
  var info = document.getElementById('busca_resultado_info');
  if (var_objBusca.resultados.length === 0) {
    info.textContent = '';
    return;
  }
  info.textContent = (var_objBusca.indiceAtual+1) + ' / ' + var_objBusca.resultados.length;
  // Destacar o trecho encontrado no container_leitura
  var res = var_objBusca.resultados[var_objBusca.indiceAtual];
  _func_IrParaCapitulo(res.capitulo);
  setTimeout(function() {
    _func_IrParaSentenca(res.sentenca);
    // Destacar visualmente a sentença
    var container = document.getElementById('container_leitura');
    var spans = container.querySelectorAll('.sentenca');
    spans.forEach(function(span, idx) {
      if (idx === res.sentenca) {
        span.classList.add('search-highlight');
      } else {
        span.classList.remove('search-highlight');
      }
    });
  }, 100);
}

function _func_NavegarResultado(var_direcao) {
  if (var_objBusca.resultados.length === 0) return;
  if (typeof var_direcao === 'number') {
    if (var_direcao >= 0 && var_direcao < var_objBusca.resultados.length) {
      var_objBusca.indiceAtual = var_direcao;
    } else if (var_direcao === -1) {
      var_objBusca.indiceAtual = Math.max(0, var_objBusca.indiceAtual - 1);
    } else if (var_direcao === 1) {
      var_objBusca.indiceAtual = Math.min(var_objBusca.resultados.length - 1, var_objBusca.indiceAtual + 1);
    }
  } else {
    var_objBusca.indiceAtual += var_direcao;
    if (var_objBusca.indiceAtual < 0) var_objBusca.indiceAtual = 0;
    if (var_objBusca.indiceAtual >= var_objBusca.resultados.length) var_objBusca.indiceAtual = var_objBusca.resultados.length - 1;
  }
  var res = var_objBusca.resultados[var_objBusca.indiceAtual];
  _func_IrParaCapitulo(res.capitulo);
  setTimeout(function() { _func_IrParaSentenca(res.sentenca); }, 100);
} 
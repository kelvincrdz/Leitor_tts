// storage.js
// Persistência de dados no localStorage

function _func_InicializarStorage() {
  // Restaurar progresso
  var progresso = _func_CarregarEstado('progresso');
  if (progresso && typeof progresso === 'object') {
    if (typeof _func_IrParaCapitulo === 'function') _func_IrParaCapitulo(progresso.capitulo || 0);
    setTimeout(function() {
      if (typeof _func_IrParaSentenca === 'function') _func_IrParaSentenca(progresso.sentenca || 0);
    }, 200);
  }
  // Botão para limpar estado
  if (!document.getElementById('btn_limpar_estado')) {
    var btn = document.createElement('button');
    btn.id = 'btn_limpar_estado';
    btn.textContent = 'Limpar Estado';
    btn.className = 'btn mt-2';
    btn.onclick = _func_LimparEstado;
    document.body.appendChild(btn);
  }
}

function _func_SalvarEstado(var_chave, var_valor) {
  localStorage.setItem('leitor_' + var_chave, JSON.stringify(var_valor));
}

function _func_CarregarEstado(var_chave) {
  var val = localStorage.getItem('leitor_' + var_chave);
  try {
    return val ? JSON.parse(val) : null;
  } catch (e) { return null; }
}

function _func_LimparEstado() {
  if (confirm('Deseja realmente limpar todo o progresso, marcadores e configurações?')) {
    ['progresso', 'marcadores', 'settings'].forEach(function(chave) {
      localStorage.removeItem('leitor_' + chave);
    });
    location.reload();
  }
}

// Salvar progresso ao mudar capítulo/sentença
if (typeof _func_IrParaCapitulo === 'function') {
  var _old_IrParaCapitulo = _func_IrParaCapitulo;
  _func_IrParaCapitulo = function(idx) {
    _old_IrParaCapitulo(idx);
    if (typeof _func_GerarChaveProgressoEPUB === 'function' && typeof var_nomeArquivoEPUB !== 'undefined' && typeof var_objEPUB !== 'undefined') {
      var chave = _func_GerarChaveProgressoEPUB(var_nomeArquivoEPUB, var_objEPUB.metadados);
      _func_SalvarEstado(chave, {
        capitulo: idx,
        sentenca: 0
      });
    }
  };
}
if (typeof _func_IrParaSentenca === 'function') {
  var _old_IrParaSentenca = _func_IrParaSentenca;
  _func_IrParaSentenca = function(idx) {
    _old_IrParaSentenca(idx);
    if (typeof _func_GerarChaveProgressoEPUB === 'function' && typeof var_nomeArquivoEPUB !== 'undefined' && typeof var_objEPUB !== 'undefined') {
      var chave = _func_GerarChaveProgressoEPUB(var_nomeArquivoEPUB, var_objEPUB.metadados);
      _func_SalvarEstado(chave, {
        capitulo: var_objNavegacao.capituloAtual,
        sentenca: idx
      });
    }
  };
}

function _func_GerarChaveProgressoEPUB(nomeArquivo, metadados) {
  // Usa nome + título + autor para gerar uma chave única
  var chave = nomeArquivo || '';
  if (metadados && (metadados.titulo || metadados.autor)) {
    chave += '_' + (metadados.titulo || '') + '_' + (metadados.autor || '');
  }
  return 'leitor_progresso_' + btoa(unescape(encodeURIComponent(chave)));
} 
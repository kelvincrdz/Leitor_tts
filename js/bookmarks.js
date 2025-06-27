// bookmarks.js
// Gerenciamento de marcadores

var_arrMarcadores = [];

function _func_InicializarBookmarks() {
  _func_CarregarMarcadores();
  document.getElementById('btn_exportar_marcadores').addEventListener('click', _func_ExportarMarcadores);
  document.getElementById('btn_importar_marcadores').addEventListener('click', function() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          var json = JSON.parse(ev.target.result);
          _func_ImportarMarcadores(json);
        } catch (err) { alert('Erro ao importar marcadores: ' + err.message); }
      };
      reader.readAsText(file);
    };
    input.click();
  });
  _func_ExibirMarcadores();
}

function _func_AdicionarMarcador(var_objMarcador) {
  var marcador = {
    id: Date.now(),
    capitulo: var_objMarcador.capitulo,
    sentenca: var_objMarcador.sentenca,
    titulo: var_objEPUB.capitulos[var_objMarcador.capitulo]?.titulo || '',
    trecho: var_objNavegacao.sentencas?.[var_objMarcador.sentenca] || ''
  };
  var_arrMarcadores.push(marcador);
  _func_SalvarMarcadores();
  _func_ExibirMarcadores();
}

function _func_RemoverMarcador(var_idMarcador) {
  var_arrMarcadores = var_arrMarcadores.filter(m => m.id !== var_idMarcador);
  _func_SalvarMarcadores();
  _func_ExibirMarcadores();
}

function _func_ExibirMarcadores() {
  var lista = document.getElementById('lista_marcadores');
  lista.innerHTML = '';
  var_arrMarcadores.forEach(function(m) {
    var li = document.createElement('li');
    li.className = 'flex items-center gap-2';
    var btn = document.createElement('button');
    btn.textContent = (m.titulo ? m.titulo + ': ' : '') + '"' + m.trecho.slice(0, 30) + '..."';
    btn.className = 'text-blue-700 underline text-left flex-1';
    btn.onclick = function() { _func_NavegarParaMarcador(m.id); };
    var del = document.createElement('button');
    del.textContent = '🗑';
    del.className = 'text-red-500';
    del.onclick = function() { _func_RemoverMarcador(m.id); };
    li.appendChild(btn);
    li.appendChild(del);
    lista.appendChild(li);
  });
}

function _func_NavegarParaMarcador(var_idMarcador) {
  var m = var_arrMarcadores.find(m => m.id === var_idMarcador);
  if (m) {
    _func_IrParaCapitulo(m.capitulo);
    setTimeout(function() { _func_IrParaSentenca(m.sentenca); }, 100);
  }
}

function _func_ExportarMarcadores() {
  var data = JSON.stringify(var_arrMarcadores, null, 2);
  var blob = new Blob([data], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'marcadores.json';
  a.click();
  URL.revokeObjectURL(url);
}

function _func_ImportarMarcadores(var_json) {
  if (Array.isArray(var_json)) {
    var_arrMarcadores = var_json;
    _func_SalvarMarcadores();
    _func_ExibirMarcadores();
  }
}

function _func_SalvarMarcadores() {
  if (typeof _func_SalvarEstado === 'function') _func_SalvarEstado('marcadores', var_arrMarcadores);
}

function _func_CarregarMarcadores() {
  if (typeof _func_CarregarEstado === 'function') {
    var arr = _func_CarregarEstado('marcadores');
    if (Array.isArray(arr)) var_arrMarcadores = arr;
  }
} 
// main.js
// Inicialização do leitor EPUB com TTS

// Variáveis globais principais
var_objLeitor = {};

// Função de inicialização
function _func_InicializarLeitor() {
  // Inicializar módulos
  if (typeof _func_InicializarEPUB === 'function') _func_InicializarEPUB();
  if (typeof _func_InicializarTTS === 'function') _func_InicializarTTS();
  if (typeof _func_InicializarNavegacao === 'function') _func_InicializarNavegacao();
  if (typeof _func_InicializarBookmarks === 'function') _func_InicializarBookmarks();
  if (typeof _func_InicializarBusca === 'function') _func_InicializarBusca();
  if (typeof _func_InicializarTimer === 'function') _func_InicializarTimer();
  if (typeof _func_InicializarStats === 'function') _func_InicializarStats();
  if (typeof _func_InicializarSettings === 'function') _func_InicializarSettings();
  if (typeof _func_InicializarStorage === 'function') _func_InicializarStorage();

  // Listeners globais
  document.addEventListener('keydown', _func_AtalhosTeclado);
  document.getElementById('btn_stats').addEventListener('click', _func_AbrirStats);
  document.getElementById('btn_abrir_config').addEventListener('click', _func_AbrirConfig);

  // Listeners de navegação
  _func_InicializarListenersNavegacao();
}

function _func_InicializarListenersNavegacao() {
  var btns = [
    'btn_capitulo_anterior',
    'btn_capitulo_proximo',
    'btn_sentenca_anterior',
    'btn_sentenca_proxima',
    'btn_capitulo_anterior2',
    'btn_capitulo_proximo2'
  ];
  btns.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.replaceWith(el.cloneNode(true)); // Remove listeners antigos
  });
  document.getElementById('btn_capitulo_anterior')?.addEventListener('click', function() {
    if (var_objNavegacao.capituloAtual > 0) _func_IrParaCapitulo(var_objNavegacao.capituloAtual - 1);
  });
  document.getElementById('btn_capitulo_proximo')?.addEventListener('click', function() {
    if (var_objNavegacao.capituloAtual < var_objEPUB.capitulos.length - 1) _func_IrParaCapitulo(var_objNavegacao.capituloAtual + 1);
  });
  document.getElementById('btn_sentenca_anterior')?.addEventListener('click', function() {
    if (typeof _func_IrParaSentencaAnteriorLeitura === 'function') _func_IrParaSentencaAnteriorLeitura();
  });
  document.getElementById('btn_sentenca_proxima')?.addEventListener('click', function() {
    if (typeof _func_IrParaProximaSentencaLeitura === 'function') _func_IrParaProximaSentencaLeitura();
  });
  document.getElementById('btn_capitulo_anterior2')?.addEventListener('click', function() {
    if (var_objNavegacao.capituloAtual > 0) _func_IrParaCapitulo(var_objNavegacao.capituloAtual - 1);
  });
  document.getElementById('btn_capitulo_proximo2')?.addEventListener('click', function() {
    if (var_objNavegacao.capituloAtual < var_objEPUB.capitulos.length - 1) _func_IrParaCapitulo(var_objNavegacao.capituloAtual + 1);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(_func_InicializarLeitor, 0);

  // Lógica para o botão 'Retomar Leitura Anterior' (com cache)
  var btnResume = document.getElementById('btnResumeEpub');
  if (btnResume) {
    btnResume.addEventListener('click', function() {
      var ultimo = localStorage.getItem('leitor_ultimo_epub_nome');
      if (!ultimo) {
        alert('Nenhum EPUB anterior encontrado. Carregue um novo arquivo.');
        return;
      }
      if (typeof _recuperarEpubDoCache === 'function') {
        _recuperarEpubDoCache(ultimo).then(function(data) {
          if (!data) {
            alert('Arquivo EPUB não encontrado no cache. Carregue novamente.');
            return;
          }
          // Cria um File a partir do ArrayBuffer
          var file = new File([data], ultimo, { type: 'application/epub+zip' });
          var dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          var fileInput = document.getElementById('fileInput');
          fileInput.files = dataTransfer.files;
          var event = new Event('change');
          fileInput.dispatchEvent(event);
        });
      }
    });
  }

  // Ao carregar um novo EPUB, salvar o nome como último aberto e cachear o arquivo
  var fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (file) {
        localStorage.setItem('leitor_ultimo_epub_nome', file.name);
        if (typeof _salvarEpubNoCache === 'function') {
          _salvarEpubNoCache(file);
        }
      }
    });
  }
});

// Atalhos de teclado
function _func_AtalhosTeclado(event) {
  // Espaço: Play/Pause
  if (event.code === 'Space') {
    event.preventDefault();
    if (var_objTTS.synth.speaking && !var_objTTS.synth.paused) {
      _func_PausarLeituraTTS();
    } else if (var_objTTS.synth.paused) {
      _func_RetomarLeituraTTS();
    } else {
      _func_IniciarLeituraTTS();
    }
  }
  // →: Próximo capítulo
  else if (event.key === 'ArrowRight') {
    if (var_objNavegacao.capituloAtual < var_objEPUB.capitulos.length - 1) _func_IrParaCapitulo(var_objNavegacao.capituloAtual + 1);
  }
  // ←: Capítulo anterior
  else if (event.key === 'ArrowLeft') {
    if (var_objNavegacao.capituloAtual > 0) _func_IrParaCapitulo(var_objNavegacao.capituloAtual - 1);
  }
  // Ctrl+F: Buscar
  else if (event.ctrlKey && event.key.toLowerCase() === 'f') {
    event.preventDefault();
    document.getElementById('input_busca').focus();
  }
  // Ctrl+B: Adicionar marcador
  else if (event.ctrlKey && event.key.toLowerCase() === 'b') {
    event.preventDefault();
    if (typeof _func_AdicionarMarcador === 'function') _func_AdicionarMarcador({
      capitulo: var_objNavegacao.capituloAtual,
      sentenca: var_objNavegacao.sentencaAtual
    });
  }
  // Esc: Parar leitura
  else if (event.key === 'Escape') {
    _func_PararLeituraTTS();
  }
  // Home: Primeira sentença
  else if (event.key === 'Home') {
    _func_IrParaSentenca(0);
  }
  // End: Última sentença
  else if (event.key === 'End') {
    _func_IrParaSentenca(var_objNavegacao.sentencas.length - 1);
  }
  // PageUp: Sentença anterior
  else if (event.key === 'PageUp') {
    if (typeof _func_IrParaSentencaAnteriorLeitura === 'function') _func_IrParaSentencaAnteriorLeitura();
  }
  // PageDown: Sentença próxima
  else if (event.key === 'PageDown') {
    if (typeof _func_IrParaProximaSentencaLeitura === 'function') _func_IrParaProximaSentencaLeitura();
  }
  // ↑: Sentença anterior
  else if (event.key === 'ArrowUp') {
    if (typeof _func_IrParaSentencaAnteriorLeitura === 'function') _func_IrParaSentencaAnteriorLeitura();
  }
  // ↓: Sentença próxima
  else if (event.key === 'ArrowDown') {
    if (typeof _func_IrParaProximaSentencaLeitura === 'function') _func_IrParaProximaSentencaLeitura();
  }
  // Shift + Roda do Mouse: Rolagem suave (implementação depende do frontend)
}

// Abrir estatísticas
function _func_AbrirStats() {
  document.getElementById('modal_stats').classList.remove('hidden');
}

// Abrir configurações
function _func_AbrirConfig() {
  document.getElementById('modal_config').classList.remove('hidden');
} 
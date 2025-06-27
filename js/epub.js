// epub.js
// Manipulação de arquivos EPUB usando JSZip

var_objEPUB = {
  zip: null,
  manifest: null,
  spine: [],
  capitulos: [],
  metadados: {},
};

var var_nomeArquivoEPUB = '';

function _func_InicializarEPUB() {
  var_inputEpub = document.getElementById('fileInput');
  var_inputEpub.addEventListener('change', _func_CarregarEPUB);
}

function _func_CarregarEPUB(event) {
  var_arquivo = event.target.files[0];
  if (!var_arquivo) return;

  var_nomeArquivoEPUB = var_arquivo.name;

  var leitor = new FileReader();
  leitor.onload = async function(e) {
    try {
      var_objEPUB.zip = await JSZip.loadAsync(e.target.result);
      // Encontrar o arquivo container.xml
      var containerXml = await var_objEPUB.zip.file('META-INF/container.xml').async('string');
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(containerXml, 'application/xml');
      var opfPath = xmlDoc.getElementsByTagName('rootfile')[0].getAttribute('full-path');
      // Ler o arquivo OPF
      var opfXml = await var_objEPUB.zip.file(opfPath).async('string');
      var opfDoc = parser.parseFromString(opfXml, 'application/xml');
      // Metadados
      var_objEPUB.metadados = {
        titulo: opfDoc.getElementsByTagName('dc:title')[0]?.textContent || '',
        autor: opfDoc.getElementsByTagName('dc:creator')[0]?.textContent || '',
      };
      // Manifest
      var manifest = {};
      var manifestNodes = opfDoc.getElementsByTagName('manifest')[0].getElementsByTagName('item');
      for (var i = 0; i < manifestNodes.length; i++) {
        var item = manifestNodes[i];
        manifest[item.getAttribute('id')] = {
          href: item.getAttribute('href'),
          mediaType: item.getAttribute('media-type')
        };
      }
      var_objEPUB.manifest = manifest;
      // Spine (ordem de leitura)
      var spineNodes = opfDoc.getElementsByTagName('spine')[0].getElementsByTagName('itemref');
      var spine = [];
      for (var i = 0; i < spineNodes.length; i++) {
        var idref = spineNodes[i].getAttribute('idref');
        spine.push(manifest[idref].href);
      }
      var_objEPUB.spine = spine;
      // Carregar capítulos
      var_objEPUB.capitulos = [];
      var basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
      for (var i = 0; i < spine.length; i++) {
        var capPath = basePath + spine[i];
        var capContent = await var_objEPUB.zip.file(capPath).async('string');
        var capDoc = parser.parseFromString(capContent, 'text/html');
        // Título do capítulo melhorado
        var titulo = capDoc.querySelector('title')?.textContent;
        if (!titulo || titulo.trim() === '') {
          // Tenta pegar o primeiro h1, h2, h3 ou parágrafo significativo
          var h = capDoc.querySelector('h1, h2, h3');
          if (h && h.textContent.trim().length > 0) {
            titulo = h.textContent.trim();
          } else {
            var p = Array.from(capDoc.querySelectorAll('p')).find(p => p.textContent.trim().length > 15);
            if (p) {
              titulo = p.textContent.trim().slice(0, 40) + (p.textContent.trim().length > 40 ? '...' : '');
            } else {
              titulo = 'Capítulo ' + (i+1);
            }
          }
        }
        var_objEPUB.capitulos.push({
          titulo: titulo,
          conteudo: capDoc.body.innerHTML
        });
      }
      if (typeof _func_showScreen === 'function') _func_showScreen(true);
      if (typeof _func_InicializarListenersNavegacao === 'function') _func_InicializarListenersNavegacao();
      setTimeout(_func_ExibirCapitulos, 50);

      // Após carregar capítulos, restaurar progresso se existir
      if (typeof _func_GerarChaveProgressoEPUB === 'function' && typeof _func_CarregarEstado === 'function') {
        var chave = _func_GerarChaveProgressoEPUB(var_nomeArquivoEPUB, var_objEPUB.metadados);
        var progresso = _func_CarregarEstado(chave);
        if (progresso && typeof progresso === 'object') {
          if (typeof _func_IrParaCapitulo === 'function') _func_IrParaCapitulo(progresso.capitulo || 0);
          setTimeout(function() {
            if (typeof _func_IrParaSentenca === 'function') _func_IrParaSentenca(progresso.sentenca || 0);
          }, 200);
        }
      }
    } catch (err) {
      alert('Erro ao ler EPUB: ' + err.message);
    }
  };
  leitor.readAsArrayBuffer(var_arquivo);
}

function _func_ExibirCapitulos() {
  var lista = document.getElementById('lista_capitulos');
  lista.innerHTML = '';
  var_objEPUB.capitulos.forEach(function(cap, idx) {
    var li = document.createElement('li');
    li.textContent = cap.titulo;
    li.className = 'cursor-pointer hover:underline';
    li.onclick = function() { _func_IrParaCapitulo(idx); };
    lista.appendChild(li);
  });
  // Exibir o primeiro capítulo por padrão
  if (var_objEPUB.capitulos.length > 0) {
    _func_IrParaCapitulo(0);
  }
} 
# 📚 Leitor EPUB com TTS

Um leitor de livros EPUB com síntese de voz (TTS) integrada, suportando navegação, marcadores e timer de leitura.

## 🎤 Problema com Google TTS

O Google Translate TTS pode apresentar erros devido a restrições de CORS (Cross-Origin Resource Sharing). Este é um problema comum em navegadores modernos.

### 🔧 Soluções

#### 1. **TTS Nativo do Navegador (Recomendado)**
O leitor automaticamente usa o TTS nativo do navegador quando o Google TTS falha. Isso funciona na maioria dos navegadores modernos.

#### 2. **Extensão CORS**
Instale uma extensão para desabilitar CORS:
- **Chrome/Edge**: [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
- **Firefox**: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

#### 3. **Servidor Local**
Execute o leitor em um servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

#### 4. **Teste de Funcionamento**
Abra o arquivo `test-tts.html` para verificar se o TTS está funcionando no seu navegador.

## 🚀 Como Usar

1. **Carregar EPUB**: Clique em "Carregar Novo EPUB" e selecione um arquivo .epub
2. **Retomar Leitura**: Use "Retomar Leitura Anterior" para continuar de onde parou
3. **Controles de Voz**: Ajuste velocidade, tom, volume e selecione a voz
4. **Navegação**: Use os botões ou atalhos do teclado para navegar
5. **Marcadores**: Adicione marcadores para pontos importantes
6. **Timer**: Configure timer de leitura ou contagem regressiva

## ⌨️ Atalhos do Teclado

- **Espaço**: Play/Pause
- **→**: Próximo capítulo
- **←**: Capítulo anterior
- **Ctrl+F**: Buscar no livro
- **Ctrl+B**: Adicionar marcador
- **Esc**: Parar leitura
- **Home**: Ir para o topo do capítulo
- **End**: Ir para o final do capítulo
- **PageUp**: Rolar para cima
- **PageDown**: Rolar para baixo
- **↑/↓**: Rolar linha por linha (quando focado no texto)
- **Shift + Roda do Mouse**: Rolagem suave controlada

## 🎯 Funcionalidades

- ✅ **Síntese de Voz**: Google TTS + TTS nativo do navegador
- ✅ **Navegação**: Capítulos, páginas e sentenças
- ✅ **Marcadores**: Salvar pontos importantes
- ✅ **Busca Avançada**: Busca em todo o livro com resultados destacados
- ✅ **Timer**: Controle de tempo de leitura
- ✅ **Persistência**: Salvar progresso automaticamente
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Tema Escuro**: Interface moderna e confortável
- ✅ **Rolagem Personalizada**: Barra de rolagem estilizada e controles
- ✅ **Indicadores Visuais**: Posição de rolagem em tempo real
- ✅ **Rolagem Automática**: Acompanha a leitura automaticamente
- ✅ **Controles de Navegação**: Botões para topo, cima, baixo e final
- ✅ **Barra de Pesquisa Fixa**: Sempre acessível, independente do conteúdo

## 🔧 Configurações

### Voz
- **Velocidade**: 50-300% (mais lento para mais rápido)
- **Tom**: 50-200% (mais grave para mais agudo)
- **Volume**: 0-100%
- **Pausa**: 0-1000ms entre sentenças
- **Pausar após pontuação**: Pausa automática após pontuação

### Timer
- **Modo Leitura**: Conta tempo total de leitura
- **Contagem Regressiva**: Para após X minutos
- **Cronômetro**: Conta tempo decorrido

## 🐛 Solução de Problemas

### TTS não funciona
1. Verifique se o som está ligado
2. Teste com o botão "🎤 Testar Voz"
3. Tente uma voz diferente
4. Verifique permissões de áudio do navegador
5. Use o arquivo `test-tts.html` para diagnóstico

### EPUB não carrega
1. Verifique se o arquivo é válido (.epub)
2. Tente um arquivo EPUB diferente
3. Verifique se o arquivo não está corrompido

### Navegação lenta
1. Use navegação por capítulos em vez de páginas
2. Reduza o tamanho do arquivo EPUB
3. Feche outras abas do navegador

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ⚠️ Internet Explorer (não suportado)

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **TTS**: Google Translate TTS + Web Speech API
- **EPUB**: JSZip para extração
- **UI**: Tailwind CSS
- **Storage**: LocalStorage

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novas funcionalidades
- Melhorar a documentação

---

**Nota**: O Google TTS pode ter limitações devido a restrições de CORS. O leitor automaticamente usa o TTS nativo do navegador como fallback quando necessário. 
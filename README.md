# 📚 Leitor EPUB com TTS

Leitor de livros EPUB com síntese de voz (TTS), navegação avançada, marcadores, busca, estatísticas, timer e personalização. Ideal para leitura acessível, estudos e produtividade.

---

## 🚀 Funcionalidades Principais

### 1. **Leitura de EPUB com Voz (TTS)**
- **TTS Nativo**: Utiliza a Web Speech API do navegador para ler o texto em voz alta.
- **Configuração de Voz**: Escolha entre vozes disponíveis, ajuste velocidade, tom e volume.
- **Teste de Voz**: Ouça uma amostra antes de iniciar a leitura.

### 2. **Navegação Avançada**
- **Capítulos**: Lista e navegação por capítulos do EPUB.
- **Sentenças Clicáveis**: Cada sentença pode ser clicada para iniciar a leitura a partir daquele ponto.
- **Controles**: Botões para avançar/retroceder capítulo e sentença.

### 3. **Marcadores (Bookmarks)**
- **Adicionar/Remover**: Salve pontos importantes do livro.
- **Persistência**: Marcadores salvos no navegador (localStorage).
- **Exportar/Importar**: Backup e restauração dos marcadores em JSON.

### 4. **Busca Avançada**
- **Busca Local**: Pesquisa no capítulo atual.
- **Busca Global**: Pesquisa em todo o livro.
- **Destaque e Navegação**: Resultados destacados e navegação entre eles.

### 5. **Timer de Leitura**
- **Modos**: Leitura (tempo total), cronômetro e contagem regressiva.
- **Notificações**: Alerta visual e sonoro ao término do tempo.
- **Controles**: Pausar, retomar, resetar e alternar modos.

### 6. **Estatísticas de Leitura**
- **Resumo**: Total de capítulos, palavras, caracteres, progresso, tempo de leitura e marcadores.
- **Acesso Rápido**: Modal de estatísticas a qualquer momento.

### 7. **Configurações e Personalização**
- **Controles de Voz**: Velocidade, tom, volume, pausa após pontuação.
- **Substituições de Palavras**: Ajuste pronúncias para TTS.
- **Tema Claro/Escuro**: Interface personalizável.

### 8. **Persistência e Recuperação**
- **Salvamento Automático**: Progresso, configurações e marcadores salvos automaticamente.
- **Retomar Leitura**: Continue de onde parou.
- **Limpar Estado**: Opção para limpar progresso e começar do zero.

### 9. **Compatibilidade e Atalhos**
- **Desktop e Mobile**: Interface responsiva.
- **Atalhos de Teclado**: Navegação rápida (ver lista abaixo).

---

## ⌨️ Atalhos de Teclado

- **Espaço**: Play/Pause
- **→**: Próximo capítulo
- **←**: Capítulo anterior
- **Ctrl+F**: Buscar
- **Ctrl+B**: Adicionar marcador
- **Esc**: Parar leitura
- **Home/End/PageUp/PageDown/↑/↓**: Navegação no texto
- **Shift + Roda do Mouse**: Rolagem suave

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **TTS**: Web Speech API
- **EPUB**: JSZip para extração e leitura
- **UI**: CSS customizado
- **Armazenamento**: localStorage

---

## 📋 Detalhes das Funções (Arquivos JS)

- **tts.js**: Controle do TTS (inicialização, seleção de voz, ajustes, leitura, pausa, retomada, parada).
- **epub.js**: Carregamento e parsing do EPUB, extração de capítulos e metadados.
- **main.js**: Inicialização global, listeners, atalhos de teclado, integração dos módulos.
- **search.js**: Busca local/global, destaque de resultados, navegação entre ocorrências.
- **navigation.js**: Navegação por capítulos e sentenças, destaque da sentença atual.
- **timer.js**: Timer de leitura, cronômetro, contagem regressiva, notificações.
- **storage.js**: Persistência de progresso, marcadores e configurações no localStorage.
- **settings.js**: Configurações de voz, tema, substituições de palavras, personalização.
- **stats.js**: Estatísticas de leitura (capítulos, palavras, progresso, tempo, marcadores).
- **bookmarks.js**: Gerenciamento de marcadores (adicionar, remover, exportar, importar, navegar).

---

## 🐛 Solução de Problemas

- **TTS não funciona**: Verifique som, permissões, teste outra voz, use o arquivo de teste.
- **EPUB não carrega**: Confirme se o arquivo é válido e não corrompido.
- **Navegação lenta**: Prefira capítulos, reduza o tamanho do EPUB, feche outras abas.

---

## 📱 Compatibilidade

- Chrome/Edge (recomendado), Firefox, Safari, navegadores mobile.
- Internet Explorer não suportado.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para reportar bugs, sugerir melhorias, adicionar funcionalidades ou melhorar a documentação.

---

**Nota**: O leitor utiliza o TTS nativo do navegador. Caso haja problemas de CORS com TTS externo, utilize o modo nativo ou rode o projeto em um servidor local. 
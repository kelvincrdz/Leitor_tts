// Função para falar usando a voz nativa do navegador
function _func_say(var_str_text, var_obj_opts = {}, var_func_onend = null, var_func_onerror = null) {
    if (!('speechSynthesis' in window)) {
        alert('A síntese de voz nativa não é suportada neste navegador.');
        if (var_func_onerror) var_func_onerror();
        return;
    }
    window.speechSynthesis.cancel();
    var var_obj_msg = new SpeechSynthesisUtterance();
    var var_arr_voices = window.speechSynthesis.getVoices();
    // Seleciona a voz pelo idioma ou índice salvo
    if (var_obj_opts.voiceIndex != null && var_arr_voices[var_obj_opts.voiceIndex]) {
        var_obj_msg.voice = var_arr_voices[var_obj_opts.voiceIndex];
    } else {
        var_obj_msg.voice = var_arr_voices.find(v => v.lang === (var_obj_opts.lang || 'pt-BR')) || var_arr_voices[0];
    }
    var_obj_msg.volume = var_obj_opts.volume != null ? var_obj_opts.volume : 1;
    var_obj_msg.rate = var_obj_opts.rate != null ? var_obj_opts.rate : 1;
    var_obj_msg.pitch = var_obj_opts.pitch != null ? var_obj_opts.pitch : 1;
    var_obj_msg.text = var_str_text;
    var_obj_msg.lang = var_obj_opts.lang || (var_obj_msg.voice ? var_obj_msg.voice.lang : 'pt-BR');
    if (var_func_onend) var_obj_msg.onend = var_func_onend;
    if (var_func_onerror) var_obj_msg.onerror = var_func_onerror;
    window.speechSynthesis.speak(var_obj_msg);
}

// Classe para Google Translate TTS (gratuito)
class GoogleTTS {
    constructor() {
        this.isReady = false;
        this.currentAudio = null;
        this.voices = [
            { name: 'Google Português (pt-BR)', lang: 'pt-BR', code: 'pt-BR' },
            { name: 'Google Português (pt-PT)', lang: 'pt-PT', code: 'pt-PT' },
            { name: 'Google Inglês (en-US)', lang: 'en-US', code: 'en-US' },
            { name: 'Google Espanhol (es-ES)', lang: 'es-ES', code: 'es-ES' },
            { name: 'Google Francês (fr-FR)', lang: 'fr-FR', code: 'fr-FR' },
            { name: 'Google Alemão (de-DE)', lang: 'de-DE', code: 'de-DE' },
            { name: 'Google Italiano (it-IT)', lang: 'it-IT', code: 'it-IT' }
        ];
        this.selectedVoice = 0; // Português Brasil por padrão
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 0.8;
        this.isPlaying = false;
        this.isPaused = false;
        this.onEndCallback = null;
        this.onErrorCallback = null;
        
        console.log('🎤 Google TTS inicializado');
    }
    
    // Falar texto usando Google Translate TTS
    speak(var_str_text, var_obj_options = {}) {
        if (!var_str_text || var_str_text.trim() === '') {
            console.log('❌ Texto vazio para falar');
            return;
        }
        
        // Parar áudio anterior se estiver tocando
        this.stop();
        
        // Guardar texto para fallback
        this.lastText = var_str_text;
        
        const var_obj_voice = this.voices[this.selectedVoice];
        
        // Corrigir o cálculo da velocidade para o range do Google (0 a 1)
        let var_num_rate = var_obj_options.rate || this.rate;
        // Se o rate vier do slider (ex: 50-300), converter para 0-1
        if (var_num_rate > 1) {
            // Mapear slider (50-300) para Google TTS (0.25-1.0)
            // 50 = 0.25 (lento), 300 = 1.0 (rápido)
            var_num_rate = 0.25 + ((var_num_rate - 50) / (300 - 50)) * 0.75;
        }
        
        const var_num_pitch = var_obj_options.pitch || this.pitch;
        const var_num_volume = var_obj_options.volume || this.volume;
        
        // Construir URL do Google Translate TTS com parâmetros corretos
        const var_str_encodedText = encodeURIComponent(var_str_text);
        
        // Tentar diferentes formatos de URL do Google TTS
        const var_arr_ttsUrls = [
            // Formato mais recente
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${var_str_encodedText}&tl=${var_obj_voice.code}&client=tw-ob`,
            // Formato alternativo
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${var_str_encodedText}&tl=${var_obj_voice.code}&client=tw-ob&ttsspeed=${var_num_rate}`,
            // Formato mais simples
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${var_str_encodedText}&tl=${var_obj_voice.code}&client=tw-ob&total=1&idx=0&textlen=${var_str_text.length}`,
            // Fallback para API mais antiga
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${var_str_encodedText}&tl=${var_obj_voice.code}&client=tw-ob&prev=input`,
            // Proxy alternativo (se disponível)
            `https://cors-anywhere.herokuapp.com/https://translate.google.com/translate_tts?ie=UTF-8&q=${var_str_encodedText}&tl=${var_obj_voice.code}&client=tw-ob`
        ];
        
        console.log(`🎤 Google TTS: "${var_str_text.substring(0, 50)}..." (${var_obj_voice.name}) [velocidade: ${var_num_rate}]`);
        
        this.tryGoogleTTS(var_arr_ttsUrls, var_num_volume, 0);
    }
    
    // Tentar diferentes URLs do Google TTS
    tryGoogleTTS(var_arr_urls, var_num_volume, var_num_index) {
        if (var_num_index >= var_arr_urls.length) {
            console.error('❌ Todas as tentativas do Google TTS falharam');
            this.fallbackToNativeTTS();
            return;
        }
        
        const var_str_ttsUrl = var_arr_urls[var_num_index];
        console.log(`🔄 Tentativa ${var_num_index + 1}/${var_arr_urls.length}: ${var_str_ttsUrl.substring(0, 80)}...`);
        
        // Criar elemento de áudio
        this.currentAudio = new Audio(var_str_ttsUrl);
        this.currentAudio.volume = var_num_volume;
        
        // Configurar eventos
        this.currentAudio.onloadstart = () => {
            console.log('▶️ Google TTS iniciando...');
            this.isPlaying = true;
            this.isPaused = false;
        };
        
        this.currentAudio.oncanplay = () => {
            console.log('✅ Google TTS pronto para tocar');
        };
        
        this.currentAudio.onplay = () => {
            console.log('🎵 Google TTS tocando');
        };
        
        this.currentAudio.onended = () => {
            console.log('✅ Google TTS finalizado');
            this.isPlaying = false;
            this.isPaused = false;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };
        
        this.currentAudio.onerror = (var_obj_error) => {
            console.error(`❌ Erro no Google TTS (tentativa ${var_num_index + 1}):`, var_obj_error);
            this.isPlaying = false;
            this.isPaused = false;
            
            // Tentar próxima URL
            setTimeout(() => {
                this.tryGoogleTTS(var_arr_urls, var_num_volume, var_num_index + 1);
            }, 100);
        };
        
        // Iniciar reprodução
        this.currentAudio.play().catch(var_obj_error => {
            console.error(`❌ Erro ao iniciar Google TTS (tentativa ${var_num_index + 1}):`, var_obj_error);
            this.isPlaying = false;
            
            // Tentar próxima URL
            setTimeout(() => {
                this.tryGoogleTTS(var_arr_urls, var_num_volume, var_num_index + 1);
            }, 100);
        });
    }
    
    // Fallback para TTS nativo do navegador
    fallbackToNativeTTS() {
        console.log('🔄 Usando fallback para TTS nativo do navegador');
        if ('speechSynthesis' in window) {
            const var_obj_utterance = new SpeechSynthesisUtterance();
            var_obj_utterance.text = this.lastText || "Erro no Google TTS. Usando voz nativa do navegador.";
            var_obj_utterance.lang = this.voices[this.selectedVoice].code;
            var_obj_utterance.rate = this.rate;
            var_obj_utterance.pitch = this.pitch;
            var_obj_utterance.volume = this.volume;
            var_obj_utterance.onstart = () => {
                console.log('🎵 TTS nativo iniciado');
                this.isPlaying = true;
                this.isPaused = false;
            };
            var_obj_utterance.onend = () => {
                console.log('✅ TTS nativo finalizado');
                this.isPlaying = false;
                this.isPaused = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            };
            var_obj_utterance.onerror = (var_obj_error) => {
                console.error('❌ Erro no TTS nativo:', var_obj_error);
                this.isPlaying = false;
                this.isPaused = false;
                // Mostrar mensagem mais informativa
                const var_str_errorMessage = this.getErrorMessage(var_obj_error);
                console.error('💡 Solução:', var_str_errorMessage);
                
                if (this.onErrorCallback) {
                    this.onErrorCallback(var_obj_error);
                }
            };
            
            window.speechSynthesis.speak(var_obj_utterance);
        } else {
            console.error('❌ Nenhum sistema de síntese de voz disponível');
            const var_str_errorMessage = 'Nenhum sistema de síntese de voz disponível. O Google TTS pode estar bloqueado por CORS ou o navegador não suporta síntese de voz.';
            console.error('💡 Solução:', var_str_errorMessage);
            
            if (this.onErrorCallback) {
                this.onErrorCallback(new Error(var_str_errorMessage));
            }
        }
    }
    
    // Obter mensagem de erro mais informativa
    getErrorMessage(var_obj_error) {
        if (var_obj_error.name === 'NotAllowedError') {
            return 'Permissão negada. Verifique se o site tem permissão para reproduzir áudio.';
        } else if (var_obj_error.name === 'NetworkError') {
            return 'Erro de rede. Verifique sua conexão com a internet.';
        } else if (var_obj_error.name === 'NotSupportedError') {
            return 'Formato de áudio não suportado. Tentando fallback...';
        } else {
            return `Erro desconhecido: ${var_obj_error.message}`;
        }
    }
    
    // Pausar reprodução
    pause() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.isPaused = true;
            console.log('⏸️ Google TTS pausado');
        }
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.pause();
        }
    }
    
    // Retomar reprodução
    resume() {
        if (this.currentAudio && this.isPaused) {
            this.currentAudio.play();
            this.isPaused = false;
            console.log('▶️ Google TTS retomado');
        }
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
        }
    }
    
    // Parar reprodução
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            this.isPlaying = false;
            this.isPaused = false;
            console.log('⏹️ Google TTS parado');
        }
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
    
    // Definir voz
    setVoice(var_num_voiceIndex) {
        if (var_num_voiceIndex >= 0 && var_num_voiceIndex < this.voices.length) {
            this.selectedVoice = var_num_voiceIndex;
            console.log(`🎤 Voz alterada para: ${this.voices[var_num_voiceIndex].name}`);
        }
    }
    
    // Definir velocidade
    setRate(var_num_rate) {
        this.rate = var_num_rate;
    }
    
    // Definir tom
    setPitch(var_num_pitch) {
        this.pitch = var_num_pitch;
    }
    
    // Definir volume
    setVolume(var_num_volume) {
        this.volume = var_num_volume;
    }
    
    // Obter lista de vozes
    getVoices() {
        return this.voices;
    }
    
    // Testar voz atual
    testVoice() {
        const var_str_testText = "Olá! Esta é uma voz de teste do leitor EPUB. Se você consegue ouvir esta mensagem, a síntese de voz está funcionando corretamente.";
        this.speak(var_str_testText);
    }
}

// JS extraído do HTML original

class EPUBReaderTTS {
    constructor() {
        console.log('🚀 Inicializando EPUBReaderTTS...');
        this.epubContent = '';
        this.currentChapter = 0;
        this.chapters = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.currentPosition = 0;
        this.startPosition = 0;
        this.bookmarks = [];
        this.timer = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.autoStopTimer = null;
        this.currentSentenceIndex = 0;
        this.sentences = [];
        this.selectedVoice = null;
        this.globalFragments = [];
        this.fragmentToChapter = [];
        
        // Inicializar Google TTS
        this.googleTTS = new GoogleTTS();
        this.useGoogleTTS = true; // Usar Google TTS por padrão
        
        console.log('✅ Construtor EPUBReaderTTS concluído');
        this.init();
        this.setupAdvancedTimer(); // Inicializar timer avançado
        this.voiceMode = 'google'; // 'google' ou 'native'
    }
    init() {
        console.log('🔧 Iniciando configuração dos componentes...');
        this.detectAndroidAndOptimize();
        this.setupEventListeners();
        console.log('✅ Event listeners configurados');
        this.setupSpeechSynthesis();
        console.log('✅ Speech synthesis configurado');
        this.loadSettings();
        console.log('✅ Configurações carregadas');
        this.startTimer();
        console.log('✅ Timer iniciado');
        this.populateVoices();
        console.log('✅ Vozes populadas');
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.onvoiceschanged = () => this.populateVoices();
        }
        console.log('🎉 Inicialização concluída com sucesso!');
        
        // Inicializar labels dos botões de timer
        setTimeout(() => {
            this.updateTimerButtonLabels();
        }, 100);
    }
    populateVoices(var_num_retries = 10) {
        const var_el_voiceSelect = document.getElementById('voiceSelect');
        if (!var_el_voiceSelect) return;
        // Obter vozes Google TTS
        const var_arr_googleVoices = this.googleTTS.getVoices();
        // Obter vozes nativas do navegador
        let var_arr_nativeVoices = [];
        if ('speechSynthesis' in window) {
            var_arr_nativeVoices = window.speechSynthesis.getVoices();
        }
        var_el_voiceSelect.innerHTML = '';
        // Adicionar grupo Google TTS
        if (var_arr_googleVoices.length) {
            const var_el_optgroupGoogle = document.createElement('optgroup');
            var_el_optgroupGoogle.label = '🌐 Google TTS';
            var_arr_googleVoices.forEach((var_obj_voice, var_num_idx) => {
                const var_el_option = document.createElement('option');
                var_el_option.value = 'g_' + var_num_idx;
                var_el_option.textContent = `🌐 ${var_obj_voice.name} (${var_obj_voice.lang})`;
                var_el_optgroupGoogle.appendChild(var_el_option);
            });
            var_el_voiceSelect.appendChild(var_el_optgroupGoogle);
        }
        // Adicionar grupo Vozes Nativas
        if (var_arr_nativeVoices.length) {
            const var_el_optgroupNative = document.createElement('optgroup');
            var_el_optgroupNative.label = '🖥️ Vozes do Dispositivo';
            var_arr_nativeVoices.forEach((var_obj_voice, var_num_idx) => {
                const var_el_option = document.createElement('option');
                var_el_option.value = 'n_' + var_num_idx;
                var_el_option.textContent = `🖥️ ${var_obj_voice.name} (${var_obj_voice.lang})`;
                var_el_optgroupNative.appendChild(var_el_option);
            });
            var_el_voiceSelect.appendChild(var_el_optgroupNative);
        }
        // Selecionar a voz salva ou padrão
        let var_str_selectedValue = this.selectedVoice;
        if (!var_str_selectedValue) {
            var_str_selectedValue = 'g_0'; // Google TTS por padrão
        }
        var_el_voiceSelect.value = var_str_selectedValue;
        
        // Configurar evento de mudança de voz
        var_el_voiceSelect.onchange = (var_obj_e) => {
            const var_str_value = var_obj_e.target.value;
            this.selectedVoice = var_str_value;
            
            if (var_str_value.startsWith('g_')) {
                // Voz Google TTS
                const var_num_voiceIndex = parseInt(var_str_value.substring(2));
                this.googleTTS.setVoice(var_num_voiceIndex);
                this.voiceMode = 'google';
                console.log(`🎤 Voz Google TTS selecionada: ${var_num_voiceIndex}`);
            } else if (var_str_value.startsWith('n_')) {
                // Voz nativa
                const var_num_voiceIndex = parseInt(var_str_value.substring(2));
                this.voiceMode = 'native';
                console.log(`🎤 Voz nativa selecionada: ${var_num_voiceIndex}`);
            }
            
            this.saveSettings();
        };
    }
    
    setupEventListeners() {
        const var_func_get = (var_str_id) => {
            const var_el_el = document.getElementById(var_str_id);
            if (!var_el_el) {
                console.warn(`⚠️ Elemento não encontrado: ${var_str_id}`);
            }
            return var_el_el;
        };

        // Configurar input de arquivo
        const var_el_fileInput = var_func_get('fileInput');
        const var_el_fileInputArea = document.querySelector('.file-input-area');
        
        if (var_el_fileInput) {
            var_el_fileInput.addEventListener('change', (var_obj_e) => {
                if (var_obj_e.target.files[0]) {
                    this.loadEPUB(var_obj_e.target.files[0]);
                }
            });
        }

        // Configurar controles de voz
        const var_el_speedSlider = var_func_get('speedSlider');
        const var_el_speedValue = var_func_get('speedValue');
        if (var_el_speedSlider && var_el_speedValue) {
            var_el_speedSlider.addEventListener('input', (var_obj_e) => {
                const var_num_rate = var_obj_e.target.value / 100;
                var_el_speedValue.textContent = var_obj_e.target.value;
                this.googleTTS.setRate(var_num_rate);
            this.saveSettings();
        });
        }

        const var_el_pitchSlider = var_func_get('pitchSlider');
        const var_el_pitchValue = var_func_get('pitchValue');
        if (var_el_pitchSlider && var_el_pitchValue) {
            var_el_pitchSlider.addEventListener('input', (var_obj_e) => {
                const var_num_pitch = var_obj_e.target.value / 100;
                var_el_pitchValue.textContent = var_obj_e.target.value;
                this.googleTTS.setPitch(var_num_pitch);
            this.saveSettings();
        });
        }

        const var_el_volumeSlider = var_func_get('volumeSlider');
        const var_el_volumeValue = var_func_get('volumeValue');
        if (var_el_volumeSlider && var_el_volumeValue) {
            var_el_volumeSlider.addEventListener('input', (var_obj_e) => {
                const var_num_volume = var_obj_e.target.value / 100;
                var_el_volumeValue.textContent = var_obj_e.target.value;
                this.googleTTS.setVolume(var_num_volume);
            this.saveSettings();
        });
        }

        // Configurar botões de controle
        const var_el_startFromHereBtn = var_func_get('startFromHereBtn');
        const var_func_updateStartBtnState = () => {
            if (var_el_startFromHereBtn) {
                if (this.isPlaying && !this.isPaused) {
                    var_el_startFromHereBtn.textContent = '📍 Parar e começar daqui';
                    var_el_startFromHereBtn.className = 'btn btn-danger w-full text-xs py-1';
            } else {
                    var_el_startFromHereBtn.textContent = '📍 Começar a ler daqui';
                    var_el_startFromHereBtn.className = 'btn btn-primary w-full text-xs py-1';
                }
            }
        };

        if (var_el_startFromHereBtn) {
            var_el_startFromHereBtn.addEventListener('click', () => {
                if (this.isPlaying && !this.isPaused) {
                    this.stopReading();
                }
                this.speakText();
            });
        }

        const var_el_playBtn = var_func_get('playBtn');
        if (var_el_playBtn) {
            var_el_playBtn.addEventListener('click', () => {
                if (this.isPlaying && this.isPaused) {
                this.resumeReading();
                } else if (!this.isPlaying) {
                    this.speakText();
                }
            });
        }

        const var_el_pauseBtn = var_func_get('pauseBtn');
        if (var_el_pauseBtn) {
            var_el_pauseBtn.addEventListener('click', () => {
                if (this.isPlaying && !this.isPaused) {
            this.pauseReading();
                }
            });
        }

        const var_el_prevFragmentBtn = var_func_get('prevFragmentBtn');
        if (var_el_prevFragmentBtn) {
            var_el_prevFragmentBtn.addEventListener('click', () => {
            if (this.currentSentenceIndex > 0) {
                this.currentSentenceIndex--;
                this.highlightCurrentSentence();
                }
            });
        }

        const var_el_nextFragmentBtn = var_func_get('nextFragmentBtn');
        if (var_el_nextFragmentBtn) {
            var_el_nextFragmentBtn.addEventListener('click', () => {
            if (this.currentSentenceIndex < this.sentences.length - 1) {
                this.currentSentenceIndex++;
                this.highlightCurrentSentence();
                }
            });
        }

        const var_el_markStartBtn = var_func_get('markStartBtn');
        if (var_el_markStartBtn) {
            var_el_markStartBtn.addEventListener('click', () => {
                this.markStart();
            });
        }

        const var_el_addBookmarkBtn = var_func_get('addBookmarkBtn');
        if (var_el_addBookmarkBtn) {
            var_el_addBookmarkBtn.addEventListener('click', () => {
                this.addBookmark();
            });
        }

        const var_el_resetDefaults = var_func_get('resetDefaults');
        if (var_el_resetDefaults) {
            var_el_resetDefaults.addEventListener('click', () => {
                this.resetDefaults();
            });
        }

        // Configurar navegação de capítulos
        const var_el_prevPage = var_func_get('prevPage');
        if (var_el_prevPage) {
            var_el_prevPage.addEventListener('click', () => {
                this.previousChapter();
            });
        }

        const var_el_nextPage = var_func_get('nextPage');
        if (var_el_nextPage) {
            var_el_nextPage.addEventListener('click', () => {
                this.nextChapter();
            });
        }

        // Configurar slider de capítulos
        const var_el_chapterSlider = document.getElementById('chapterSlider');
        const var_el_sliderPageLabel = document.getElementById('sliderPageLabel');
        
        if (var_el_chapterSlider && var_el_sliderPageLabel) {
            var_el_chapterSlider.addEventListener('input', (var_obj_e) => {
                const var_num_val = parseInt(var_obj_e.target.value, 10) - 1;
                if (var_num_val >= 0 && var_num_val < this.chapters.length) {
                    this.goToChapter(var_num_val);
                }
            });
        }

        const var_func_updateSlider = () => {
            if (var_el_chapterSlider && var_el_sliderPageLabel) {
                var_el_chapterSlider.max = this.chapters.length;
                var_el_chapterSlider.value = this.currentChapter + 1;
                var_el_sliderPageLabel.textContent = `Página ${this.currentChapter + 1} de ${this.chapters.length}`;
            }
        };

        // Configurar atalhos de teclado
        document.addEventListener('keydown', (var_obj_e) => {
            // Só aplicar se não estiver em um campo de input
            if (var_obj_e.target.tagName === 'INPUT' || var_obj_e.target.tagName === 'TEXTAREA') {
                    return;
                }
            
            switch(var_obj_e.key) {
                case ' ':
                    var_obj_e.preventDefault();
                    if (this.isPlaying && this.isPaused) {
                        this.resumeReading();
                    } else if (this.isPlaying && !this.isPaused) {
                        this.pauseReading();
                    } else {
                        this.speakText();
                    }
                    break;
                case 'ArrowRight':
                    var_obj_e.preventDefault();
                    this.nextChapter();
                    break;
                case 'ArrowLeft':
                    var_obj_e.preventDefault();
                    this.previousChapter();
                    break;
                case 'Escape':
                    var_obj_e.preventDefault();
                    this.stopReading();
                    break;
            }
        });

        // Configurar busca
        const var_el_searchInput = document.getElementById('searchInput');
        // Remover busca automática ao digitar
        // Adicionar busca ao pressionar Enter
        if (var_el_searchInput) {
            var_el_searchInput.addEventListener('keydown', (var_obj_e) => {
                if (var_obj_e.key === 'Enter') {
                    const var_str_query = var_el_searchInput.value.trim();
                    if (var_str_query.length > 2) {
                        this.search(var_str_query);
                    }
                }
            });
        }
        // Adicionar botão de busca, se não existir
        let var_el_searchBtn = document.getElementById('searchBtn');
        if (!var_el_searchBtn && var_el_searchInput) {
            var_el_searchBtn = document.createElement('button');
            var_el_searchBtn.id = 'searchBtn';
            var_el_searchBtn.textContent = 'Buscar';
            var_el_searchBtn.className = 'btn btn-primary ml-2';
            var_el_searchInput.parentNode.insertBefore(var_el_searchBtn, var_el_searchInput.nextSibling);
        }
        if (var_el_searchBtn) {
            var_el_searchBtn.addEventListener('click', () => {
                const var_str_query = var_el_searchInput.value.trim();
                if (var_str_query.length > 2) {
                    this.search(var_str_query);
                }
            });
        }

        let var_arr_searchResults = [];
        let var_num_currentResultIdx = 0;
        
        const var_func_updateSearchNav = () => {
            // Implementação da navegação de busca
        };
        
        const var_func_highlightSearchInBook = (var_str_query, var_num_globalIdx) => {
            const var_obj_frag = window.app.globalFragments[var_num_globalIdx];
            if (!var_obj_frag) return;
            
            const var_el_viewer = document.getElementById('epubViewer');
            const var_el_content = var_el_viewer.querySelector('.chapter-content');
            if (!var_el_content) return;
            
            // Limpar highlights anteriores
            const var_arr_highlights = var_el_content.querySelectorAll('.search-highlight');
            var_arr_highlights.forEach(var_el_highlight => {
                var_el_highlight.classList.remove('search-highlight');
            });
            
            const var_obj_regex = new RegExp(var_str_query, 'gi');
            const var_str_text = var_el_content.textContent;
            let var_obj_match;
            
            while ((var_obj_match = var_obj_regex.exec(var_str_text)) !== null) {
                // Implementar highlight
            }
        };

        // Configurar controles de timer
        const var_el_pauseDurationSlider = var_func_get('pauseDurationSlider');
        const var_el_pauseDurationValue = var_func_get('pauseDurationValue');
        if (var_el_pauseDurationSlider && var_el_pauseDurationValue) {
            var_el_pauseDurationSlider.addEventListener('input', (var_obj_e) => {
                var_el_pauseDurationValue.textContent = var_obj_e.target.value + 'ms';
                this.pauseDuration = parseInt(var_obj_e.target.value);
            this.saveSettings();
            });
        }

        const var_el_timerSlider = var_func_get('timerSlider');
        const var_el_timerValue = var_func_get('timerValue');
        if (var_el_timerSlider && var_el_timerValue) {
            var_el_timerSlider.addEventListener('input', (var_obj_e) => {
                var_el_timerValue.textContent = var_obj_e.target.value + 'min';
                this.autoStopMinutes = parseInt(var_obj_e.target.value);
                this.saveSettings();
            });
        }

        const var_el_pauseAfterPunctuation = var_func_get('pauseAfterPunctuation');
        if (var_el_pauseAfterPunctuation) {
            var_el_pauseAfterPunctuation.addEventListener('change', (var_obj_e) => {
                this.pauseAfterPunctuation = var_obj_e.target.checked;
            this.saveSettings();
        });
        }

        // Expor funções para uso global
        this._updateSlider = var_func_updateSlider;
        this._updateStartBtnState = var_func_updateStartBtnState;
    }
    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            console.log('Speech Synthesis API disponível');
        } else {
            alert('Síntese de voz não suportada neste navegador');
        }
    }
    
    extractTextFromHTML(var_str_html) {
        const var_obj_parser = new DOMParser();
        const var_obj_doc = var_obj_parser.parseFromString(var_str_html, 'text/html');
        
        // Remover scripts e estilos
        const var_arr_scripts = var_obj_doc.querySelectorAll('script, style');
        var_arr_scripts.forEach(var_el_el => var_el_el.remove());
        
        // Função para processar elementos e preservar HTML
        function _func_processElement(var_el_element) {
            let var_str_result = '';
            
            for (let var_obj_node of var_el_element.childNodes) {
                if (var_obj_node.nodeType === Node.TEXT_NODE) {
                    // Texto simples
                    var_str_result += var_obj_node.textContent;
                } else if (var_obj_node.nodeType === Node.ELEMENT_NODE) {
                    const var_str_tagName = var_obj_node.tagName.toLowerCase();
                    
                    switch (var_str_tagName) {
                        case 'p':
                        case 'div':
                        case 'section':
                        case 'article':
                            var_str_result += `<p class="mb-4 leading-relaxed">${_func_processElement(var_obj_node)}</p>`;
                            break;
                        case 'br':
                            var_str_result += '<br>';
                            break;
                        case 'h1':
                        case 'h2':
                        case 'h3':
                        case 'h4':
                        case 'h5':
                        case 'h6':
                            const var_str_sizeClass = var_str_tagName === 'h1' ? 'text-3xl' : 
                                             var_str_tagName === 'h2' ? 'text-2xl' : 
                                             var_str_tagName === 'h3' ? 'text-xl' : 
                                             var_str_tagName === 'h4' ? 'text-lg' : 'text-base';
                            var_str_result += `<${var_str_tagName} class="${var_str_sizeClass} font-bold text-indigo-300 mb-4 mt-6">${_func_processElement(var_obj_node)}</${var_str_tagName}>`;
                            break;
                        case 'li':
                            var_str_result += `<li class="mb-2 ml-4">${_func_processElement(var_obj_node)}</li>`;
                            break;
                        case 'ul':
                            var_str_result += `<ul class="list-disc list-inside space-y-2 mb-4 ml-4">${_func_processElement(var_obj_node)}</ul>`;
                            break;
                        case 'ol':
                            var_str_result += `<ol class="list-decimal list-inside space-y-2 mb-4 ml-4">${_func_processElement(var_obj_node)}</ol>`;
                            break;
                        case 'blockquote':
                            var_str_result += `<blockquote class="border-l-4 border-indigo-400 pl-4 italic bg-gray-800/50 py-2 mb-4">${_func_processElement(var_obj_node)}</blockquote>`;
                            break;
                        case 'em':
                        case 'i':
                            var_str_result += `<em class="text-indigo-200">${_func_processElement(var_obj_node)}</em>`;
                            break;
                        case 'strong':
                        case 'b':
                            var_str_result += `<strong class="font-bold text-indigo-100">${_func_processElement(var_obj_node)}</strong>`;
                            break;
                        case 'img':
                            const var_str_src = var_obj_node.getAttribute('src') || '';
                            const var_str_alt = var_obj_node.getAttribute('alt') || '';
                            var_str_result += `<img src="${var_str_src}" alt="${var_str_alt}" class="max-w-full h-auto mx-auto my-4 rounded-lg shadow-lg" />`;
                            break;
                        case 'a':
                            const var_str_href = var_obj_node.getAttribute('href') || '#';
                            var_str_result += `<a href="${var_str_href}" class="text-indigo-400 hover:text-indigo-300 underline">${_func_processElement(var_obj_node)}</a>`;
                            break;
                        case 'code':
                            var_str_result += `<code class="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-green-300">${_func_processElement(var_obj_node)}</code>`;
                            break;
                        case 'pre':
                            var_str_result += `<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-green-300 mb-4">${_func_processElement(var_obj_node)}</pre>`;
                            break;
                        case 'table':
                            var_str_result += `<div class="overflow-x-auto mb-4"><table class="min-w-full border border-gray-600">${_func_processElement(var_obj_node)}</table></div>`;
                            break;
                        case 'tr':
                            var_str_result += `<tr class="border-b border-gray-600">${_func_processElement(var_obj_node)}</tr>`;
                            break;
                        case 'th':
                            var_str_result += `<th class="border border-gray-600 px-4 py-2 bg-gray-700 text-left font-bold">${_func_processElement(var_obj_node)}</th>`;
                            break;
                        case 'td':
                            var_str_result += `<td class="border border-gray-600 px-4 py-2">${_func_processElement(var_obj_node)}</td>`;
                            break;
                        default:
                            var_str_result += _func_processElement(var_obj_node);
                    }
                }
            }
            
            return var_str_result;
        }
        
        const var_str_processedHTML = _func_processElement(var_obj_doc.body || var_obj_doc);
        
        // Limpar HTML e normalizar
        return var_str_processedHTML
            .replace(/\s+/g, ' ') // Normalizar espaços
            .replace(/>\s+</g, '><') // Remover espaços entre tags
            .trim();
    }
    
    displayCurrentChapter() {
        if (this.chapters.length === 0) return;
        const var_el_viewer = document.getElementById('epubViewer');
        const var_obj_chapter = this.chapters[this.currentChapter];
        
        let var_str_html = `<h2 class="chapter-title mb-6 text-3xl font-bold text-indigo-300 border-b-2 border-indigo-400 pb-2">${var_obj_chapter.title}</h2>`;
        var_str_html += '<div class="chapter-content space-y-6 text-gray-100 leading-relaxed">';
        
        if (var_obj_chapter.content.includes('<')) {
            // Gerar HTML e array de sentenças sincronizados
            const var_obj_result = this.addClickableSentencesToHTML(var_obj_chapter.content);
            var_str_html += var_obj_result.html;
            this.sentences = var_obj_result.sentences;
        } else {
            // Fallback para texto simples
            const var_arr_paragraphs = var_obj_chapter.content.split(/\n\s*\n/).filter(p => p.trim());
            let var_arr_allSentences = [];
            var_arr_paragraphs.forEach((var_str_paragraph, var_num_pIdx) => {
                let var_str_processedParagraph = var_str_paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-100">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-indigo-200">$1</em>')
                    .replace(/^•\s*(.*)/gm, '<li>$1</li>')
                    .replace(/^"(.*)"$/gm, '<blockquote class="border-l-4 border-indigo-400 pl-4 italic bg-gray-800/50 py-2">$1</blockquote>');
                if (var_str_processedParagraph.includes('<li>')) {
                    var_str_html += `<ul class="list-disc list-inside space-y-2 ml-4">${var_str_processedParagraph}</ul>`;
                } else if (var_str_processedParagraph.includes('<blockquote')) {
                    var_str_html += var_str_processedParagraph;
                } else {
                    var_str_html += `<p class="mb-4 leading-relaxed">${var_str_processedParagraph}</p>`;
                }
                
                const var_arr_sentences = this.splitIntoSentences(var_str_processedParagraph);
                var_arr_sentences.forEach((var_str_sentence, var_num_idx) => {
                    const var_num_globalIdx = var_arr_allSentences.length - var_arr_sentences.length + var_num_idx;
                    var_arr_allSentences.push({
                        text: var_str_sentence,
                        chapter: this.currentChapter,
                        paragraph: var_num_pIdx,
                        sentence: var_num_idx,
                        globalIndex: var_num_globalIdx
                    });
                });
            });
            this.sentences = var_arr_allSentences;
        }
        
        var_str_html += '</div>';
        var_el_viewer.innerHTML = var_str_html;
        
        // Adicionar eventos de clique nas sentenças
        const var_arr_sentenceSpans = var_el_viewer.querySelectorAll('.sentence');
        var_arr_sentenceSpans.forEach(var_el_span => {
            var_el_span.addEventListener('click', (var_obj_e) => {
                const var_num_clickedIndex = parseInt(var_el_span.getAttribute('data-idx'));
                this.currentSentenceIndex = var_num_clickedIndex;
                
                const var_bool_estavaLendo = this.isPlaying && !this.isPaused;
                const var_bool_estavaPausado = this.isPlaying && this.isPaused;
                
                this.stopReading();
                
                if (var_bool_estavaLendo || var_bool_estavaPausado) {
                    setTimeout(() => {
                        this.speakText();
                    }, 100);
                }
            });
        });
        
        this.updatePageInfo();
        this.updateProgress();
        
        const var_el_startFromHereBtn = document.getElementById('startFromHereBtn');
        if (var_el_startFromHereBtn) {
            if (this.isPlaying && !this.isPaused) {
                var_el_startFromHereBtn.textContent = '📍 Parar e começar daqui';
                var_el_startFromHereBtn.className = 'btn btn-danger w-full text-xs py-1';
        } else {
                var_el_startFromHereBtn.textContent = '📍 Começar a ler daqui';
                var_el_startFromHereBtn.className = 'btn btn-primary w-full text-xs py-1';
            }
        }
    }
    
    // Nova função para adicionar sentenças clicáveis ao HTML preservado
    addClickableSentencesToHTML(htmlContent) {
        // Cria um container temporário
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        let allSentences = [];
        let idx = 0;

        // Processa cada parágrafo separadamente
        tempDiv.querySelectorAll('p').forEach(paragraph => {
            const text = paragraph.textContent || "";
            const sents = this.splitIntoSentences(text);
            let newHTML = "";
            sents.forEach(sentence => {
                newHTML += `<span class="sentence" data-idx="${idx}">${sentence}</span> `;
                allSentences.push(sentence);
                idx++;
            });
            paragraph.innerHTML = newHTML.trim();
        });

        return {
            html: tempDiv.innerHTML,
            sentences: allSentences
        };
    }
    resumeReading() {
        console.log('🔄 Tentando resumir leitura...', { isPaused: this.isPaused, isPlaying: this.isPlaying });
        
        if (this.isPaused && this.isPlaying) {
            this.isPaused = false;
            this.googleTTS.resume();
            this.updateStatus('Lendo', 'playing');
            console.log('✅ Leitura resumida com sucesso');
        } else if (this.isPaused && !this.isPlaying) {
            // Se está pausado mas não está playing, reiniciar
            this.isPlaying = true;
            this.isPaused = false;
            this.speakText();
            console.log('🔄 Reiniciando leitura pausada');
        } else {
            console.log('⚠️ Estado inválido para resumir:', { isPaused: this.isPaused, isPlaying: this.isPlaying });
        }
    }
    stopReading() {
        this.isPlaying = false;
        this.isPaused = false;
        this.googleTTS.stop();
        this.updateStatus('Parado', 'ready');
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
            this.autoStopTimer = null;
        }
        const viewer = document.getElementById('epubViewer');
        const content = viewer.querySelector('.chapter-content');
        if (content) {
            content.innerHTML = content.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
        }
    }
    markStart() {
        this.startPosition = this.currentSentenceIndex;
        alert(`Início marcado na sentença ${this.startPosition + 1}`);
    }
    nextChapter(autoContinue = false) {
        if (this.currentChapter < this.chapters.length - 1) {
            this.stopReading();
            this.currentChapter++;
            this.currentSentenceIndex = 0;
            this.displayCurrentChapter();
            if (typeof this._updateStartBtnState === 'function') this._updateStartBtnState();
            if (autoContinue && this.isPlaying) {
                this.isPaused = false;
                this.speakText();
            }
            // Salvar estado após mudança de capítulo
            this.saveReadingState();
        }
    }
    previousChapter() {
        if (this.currentChapter > 0) {
            this.stopReading();
            this.currentChapter--;
            this.currentSentenceIndex = 0;
            this.displayCurrentChapter();
            if (typeof this._updateStartBtnState === 'function') this._updateStartBtnState();
            if (this.isPlaying) {
                this.isPaused = false;
                this.speakText();
            }
            // Salvar estado após mudança de capítulo
            this.saveReadingState();
        }
    }
    search(query) {
        if (!query.trim() || this.chapters.length === 0) return;
        const viewer = document.getElementById('epubViewer');
        const content = viewer.querySelector('.chapter-content');
        if (!content) return;
        content.innerHTML = content.innerHTML.replace(/<mark class="search-highlight">(.*?)<\/mark>/g, '$1');
        if (query.length > 2) {
            const regex = new RegExp(query, 'gi');
            content.innerHTML = content.innerHTML.replace(regex, '<mark class="search-highlight">$&</mark>');
        }
    }
    addBookmark() {
        const bookmark = {
            id: Date.now(),
            chapter: this.currentChapter,
            sentence: this.currentSentenceIndex,
            title: `${this.chapters[this.currentChapter].title} - Sentença ${this.currentSentenceIndex + 1}`,
            timestamp: new Date().toLocaleString()
        };
        this.bookmarks.push(bookmark);
        this.updateBookmarksList();
        this.saveSettings();
        // Salvar estado após adicionar marcador
        this.saveReadingState();
    }
    updateBookmarksList() {
        const container = document.getElementById('bookmarksList');
        container.innerHTML = this.bookmarks.map(bookmark => `
            <div class="bookmark-item" onclick="app.goToBookmark(${bookmark.id})">
                <strong>${bookmark.title}</strong><br>
                <small>${bookmark.timestamp}</small>
                <button onclick="app.removeBookmark(${bookmark.id}); event.stopPropagation();" style="float: right; background: #dc3545; color: white; border: none; border-radius: 3px; padding: 2px 6px;">×</button>
            </div>
        `).join('');
    }
    goToBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (bookmark) {
            this.stopReading();
            this.currentChapter = bookmark.chapter;
            this.currentSentenceIndex = bookmark.sentence;
            this.displayCurrentChapter();
        }
    }
    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.updateBookmarksList();
        this.saveSettings();
    }
    setupAutoStop() {
        const timerMinutes = parseInt(document.getElementById('timerSlider').value);
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
        }
        this.autoStopTimer = setTimeout(() => {
            this.stopReading();
            alert('Timer de parada atingido');
        }, timerMinutes * 60 * 1000);
    }
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime++;
            this.updateTimerDisplay();
        }, 1000);
    }
    updateTimerDisplay() {
        const hours = Math.floor(this.elapsedTime / 3600);
        const minutes = Math.floor((this.elapsedTime % 3600) / 60);
        const seconds = this.elapsedTime % 60;
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }
    updateStatus(text, type) {
        document.getElementById('statusText').textContent = text;
        const indicator = document.getElementById('statusIndicator');
        indicator.className = `status-indicator status-${type}`;
    }
    updatePageInfo() {
        document.getElementById('pageInfo').textContent = 
            `Capítulo ${this.currentChapter + 1} de ${this.chapters.length}`;
    }
    updateProgress() {
        if (this.sentences.length === 0) return;
        const chapterProgress = (this.currentSentenceIndex / this.sentences.length) * 100;
        const totalProgress = ((this.currentChapter + (this.currentSentenceIndex / this.sentences.length)) / this.chapters.length) * 100;
        document.getElementById('progressFill').style.width = totalProgress + '%';
    }
    resetDefaults() {
        document.getElementById('speedSlider').value = 220;
        document.getElementById('speedValue').textContent = '220';
        document.getElementById('pitchSlider').value = 109;
        document.getElementById('pitchValue').textContent = '109';
        document.getElementById('volumeSlider').value = 80;
        document.getElementById('volumeValue').textContent = '80';
        document.getElementById('pauseDurationSlider').value = 30;
        document.getElementById('pauseDurationValue').textContent = '30ms';
        document.getElementById('timerSlider').value = 120;
        document.getElementById('timerValue').textContent = '120min';
        
        // Aplicar configurações ao Google TTS
        if (this.googleTTS) {
            this.googleTTS.setRate(2.2); // 220 / 100
            this.googleTTS.setPitch(1.09); // 109 / 100
            this.googleTTS.setVolume(0.8); // 80 / 100
            
            console.log('🎤 Configurações padrão aplicadas ao Google TTS');
        }
        
        this.saveSettings();
    }
    saveSettings() {
        const settings = {
            speed: document.getElementById('speedSlider').value,
            pitch: document.getElementById('pitchSlider').value,
            volume: document.getElementById('volumeSlider').value,
            pauseDuration: document.getElementById('pauseDurationSlider').value,
            timer: document.getElementById('timerSlider').value,
            pauseAfterPunctuation: document.getElementById('pauseAfterPunctuation') ? document.getElementById('pauseAfterPunctuation').checked : false,
            enableSubstitutions: document.getElementById('enableSubstitutions') ? document.getElementById('enableSubstitutions').checked : false,
            enableVisualization: document.getElementById('enableVisualization') ? document.getElementById('enableVisualization').checked : false,
            allowSimultaneousPlayback: document.getElementById('allowSimultaneousPlayback') ? document.getElementById('allowSimultaneousPlayback').checked : false,
            bookmarks: this.bookmarks,
            selectedVoice: this.selectedVoice,
            // Estado da leitura atual
            currentChapter: this.currentChapter,
            currentSentenceIndex: this.currentSentenceIndex,
            elapsedTime: this.elapsedTime,
            startPosition: this.startPosition,
            voiceMode: this.voiceMode,
        };
        this.savedSettings = settings;
        // Salvar no localStorage
        try {
            localStorage.setItem('epubReaderSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Erro ao salvar configurações:', error);
        }
    }
    
    saveReadingState() {
        if (this.chapters.length === 0) return;
        
        const readingState = {
            chapters: this.chapters,
            currentChapter: this.currentChapter,
            currentSentenceIndex: this.currentSentenceIndex,
            elapsedTime: this.elapsedTime,
            startPosition: this.startPosition,
            bookmarks: this.bookmarks,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('epubReaderLastState', JSON.stringify(readingState));
            localStorage.setItem('epubReaderLastEpub', 'true');
        } catch (error) {
            console.warn('Erro ao salvar estado da leitura:', error);
        }
    }
    
    loadReadingState() {
        try {
            const savedState = localStorage.getItem('epubReaderLastState');
            if (!savedState) return false;
            
            const state = JSON.parse(savedState);
            if (!state || !state.chapters || state.chapters.length === 0) return false;
            
            // Restaurar estado
            this.chapters = state.chapters;
            this.currentChapter = state.currentChapter || 0;
            this.currentSentenceIndex = state.currentSentenceIndex || 0;
            this.elapsedTime = state.elapsedTime || 0;
            this.startPosition = state.startPosition || 0;
            this.bookmarks = state.bookmarks || [];
            
            // Atualizar interface
            this.displayCurrentChapter();
            this.updateGlobalFragments();
            this.updateBookmarksList();
            this.updateStatus('Pronto', 'ready');
            if (typeof this._updateSlider === 'function') this._updateSlider();
            
            return true;
        } catch (error) {
            console.warn('Erro ao carregar estado da leitura:', error);
            return false;
        }
    }
    
    hasSavedReadingState() {
        try {
            const savedState = localStorage.getItem('epubReaderLastState');
            if (!savedState) return false;
            
            const state = JSON.parse(savedState);
            return state && state.chapters && state.chapters.length > 0;
        } catch (error) {
            return false;
        }
    }
    
    clearReadingState() {
        try {
            localStorage.removeItem('epubReaderLastState');
            localStorage.removeItem('epubReaderLastEpub');
        } catch (error) {
            console.warn('Erro ao limpar estado da leitura:', error);
        }
    }
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('epubReaderSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.savedSettings = settings;
                
                // Aplicar configurações aos controles
                if (document.getElementById('speedSlider')) {
                    document.getElementById('speedSlider').value = settings.speed || 220;
                    document.getElementById('speedValue').textContent = settings.speed || '220';
                }
                if (document.getElementById('pitchSlider')) {
                    document.getElementById('pitchSlider').value = settings.pitch || 109;
                    document.getElementById('pitchValue').textContent = settings.pitch || '109';
                }
                if (document.getElementById('volumeSlider')) {
                    document.getElementById('volumeSlider').value = settings.volume || 80;
                    document.getElementById('volumeValue').textContent = settings.volume || '80';
                }
                if (document.getElementById('pauseDurationSlider')) {
                    document.getElementById('pauseDurationSlider').value = settings.pauseDuration || 30;
                    document.getElementById('pauseDurationValue').textContent = (settings.pauseDuration || 30) + 'ms';
                }
                if (document.getElementById('timerSlider')) {
                    document.getElementById('timerSlider').value = settings.timer || 120;
                    document.getElementById('timerValue').textContent = (settings.timer || 120) + 'min';
                }
                if (document.getElementById('pauseAfterPunctuation')) {
                    document.getElementById('pauseAfterPunctuation').checked = settings.pauseAfterPunctuation !== false;
                }
                if (document.getElementById('enableSubstitutions')) {
                    document.getElementById('enableSubstitutions').checked = settings.enableSubstitutions || false;
                }
                if (document.getElementById('enableVisualization')) {
                    document.getElementById('enableVisualization').checked = settings.enableVisualization !== false;
                }
                if (document.getElementById('allowSimultaneousPlayback')) {
                    document.getElementById('allowSimultaneousPlayback').checked = settings.allowSimultaneousPlayback !== false;
                }
                
                // Aplicar configurações ao Google TTS
                if (this.googleTTS) {
                    const rate = (settings.speed || 220) / 100;
                    const pitch = (settings.pitch || 109) / 100;
                    const volume = (settings.volume || 80) / 100;
                    
                    this.googleTTS.setRate(rate);
                    this.googleTTS.setPitch(pitch);
                    this.googleTTS.setVolume(volume);
                    
                    console.log('🎤 Configurações aplicadas ao Google TTS:', { rate, pitch, volume });
                }
                
                this.bookmarks = settings.bookmarks || [];
                this.selectedVoice = settings.selectedVoice || 'g_0';
                this.updateBookmarksList();
                this.voiceMode = settings.voiceMode || 'google';
                if (document.getElementById('voiceModeSelect')) {
                    document.getElementById('voiceModeSelect').value = this.voiceMode;
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações:', error);
        }
    }
    applySubstitutions(text) {
        if (!document.getElementById('enableSubstitutions').checked) {
            return text;
        }
        const substitutions = {
            'Dr.': 'Doutor',
            'Sr.': 'Senhor',
            'Sra.': 'Senhora',
            'etc.': 'etcétera',
            'vs.': 'versus',
            'p.ex.': 'por exemplo',
            'i.e.': 'isto é',
            'e.g.': 'por exemplo',
            'R : ': 'reais',
            '%': 'por cento',
            '@': 'arroba',
            '&': 'e',
            'CEO': 'ceio',
            'PDF': 'pédeéfe',
            'HTML': 'agáteemêle',
            'CSS': 'céssésse',
            'JavaScript': 'java script',
            'API': 'apí',
            'URL': 'úerrêle',
            'HTTP': 'agátêtêpê',
            'HTTPS': 'agátêtêpê ésse'
        };
        let result = text;
        for (const [original, replacement] of Object.entries(substitutions)) {
            const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            result = result.replace(regex, replacement);
        }
        return result;
    }
    handleSimultaneousPlayback() {
        if (!document.getElementById('allowSimultaneousPlayback').checked) {
            const audioElements = document.querySelectorAll('audio, video');
            audioElements.forEach(element => {
                if (!element.paused) {
                    element.pause();
                }
            });
        }
    }
    goToChapter(chapterIndex) {
        if (chapterIndex >= 0 && chapterIndex < this.chapters.length) {
            this.currentChapter = chapterIndex;
            this.currentSentenceIndex = 0;
            this.displayCurrentChapter();
        }
    }
    advancedSearch(query, options = {}) {
        const results = [];
        for (let i = 0; i < this.chapters.length; i++) {
            const chapter = this.chapters[i];
            const regex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
            let match;
            while ((match = regex.exec(chapter.content)) !== null) {
                results.push({
                    chapter: i,
                    position: match.index,
                    context: this.getContext(chapter.content, match.index, 50),
                    match: match[0]
                });
            }
        }
        return results;
    }
    getContext(text, position, contextLength) {
        const start = Math.max(0, position - contextLength);
        const end = Math.min(text.length, position + contextLength);
        return text.substring(start, end);
    }
    exportBookmarks() {
        const data = JSON.stringify(this.bookmarks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookmarks.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    importBookmarks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedBookmarks = JSON.parse(e.target.result);
                this.bookmarks = [...this.bookmarks, ...importedBookmarks];
                this.updateBookmarksList();
                this.saveSettings();
                alert('Marcadores importados com sucesso!');
            } catch (error) {
                alert('Erro ao importar marcadores. Verifique o formato do arquivo.');
            }
        };
        reader.readAsText(file);
    }
    getReadingStats() {
        if (this.chapters.length === 0) return null;
        const totalWords = this.chapters.reduce((sum, chapter) => {
            return sum + chapter.content.split(/\s+/).length;
        }, 0);
        const totalCharacters = this.chapters.reduce((sum, chapter) => {
            return sum + chapter.content.length;
        }, 0);
        const currentProgress = ((this.currentChapter + (this.currentSentenceIndex / this.sentences.length)) / this.chapters.length) * 100;
        return {
            totalChapters: this.chapters.length,
            totalWords: totalWords,
            totalCharacters: totalCharacters,
            currentChapter: this.currentChapter + 1,
            progress: Math.round(currentProgress),
            readingTime: this.elapsedTime,
            bookmarksCount: this.bookmarks.length
        };
    }
    showStats() {
        const stats = this.getReadingStats();
        if (!stats) {
            alert('Carregue um arquivo EPUB primeiro');
            return;
        }
        const message = `
            📊 ESTATÍSTICAS DE LEITURA
            
            📚 Total de capítulos: ${stats.totalChapters}
            📝 Total de palavras: ${stats.totalWords.toLocaleString()}
            🔤 Total de caracteres: ${stats.totalCharacters.toLocaleString()}
            📖 Capítulo atual: ${stats.currentChapter}
            📈 Progresso: ${stats.progress}%
            ⏱️ Tempo de leitura: ${Math.floor(stats.readingTime / 60)} min ${stats.readingTime % 60} seg
            🔖 Marcadores: ${stats.bookmarksCount}
        `;
        alert(message);
    }
    detectAndroidAndOptimize() {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
        
        console.log(`📱 Dispositivo detectado: ${isAndroid ? 'Android' : isMobile ? 'Mobile' : 'Desktop'}`);
        
        if (isAndroid) {
            console.log('🤖 Otimizações Android aplicadas');
            // Ajustar configurações para Android
            this.androidOptimizations = true;
            
            // Configurações recomendadas para Android TTS
            const defaultSettings = {
                speed: 150, // Velocidade um pouco mais lenta para Android
                pitch: 100, // Tom neutro
                volume: 90, // Volume alto
                pauseDuration: 50 // Pausa um pouco maior
            };
            
            // Aplicar configurações se não houver configurações salvas
            if (!localStorage.getItem('epubReaderSettings')) {
                this.applyAndroidDefaults(defaultSettings);
            }
        }
    }
    
    applyAndroidDefaults(settings) {
        console.log('⚙️ Aplicando configurações padrão para Android');
        
        // Aplicar aos sliders
        const speedSlider = document.getElementById('speedSlider');
        const pitchSlider = document.getElementById('pitchSlider');
        const volumeSlider = document.getElementById('volumeSlider');
        const pauseSlider = document.getElementById('pauseDurationSlider');
        
        if (speedSlider) {
            speedSlider.value = settings.speed;
            document.getElementById('speedValue').textContent = settings.speed;
        }
        if (pitchSlider) {
            pitchSlider.value = settings.pitch;
            document.getElementById('pitchValue').textContent = settings.pitch;
        }
        if (volumeSlider) {
            volumeSlider.value = settings.volume;
            document.getElementById('volumeValue').textContent = settings.volume;
        }
        if (pauseSlider) {
            pauseSlider.value = settings.pauseDuration;
            document.getElementById('pauseDurationValue').textContent = settings.pauseDuration + 'ms';
        }
        
        // Aplicar configurações ao Google TTS
        if (this.googleTTS) {
            const rate = settings.speed / 100;
            const pitch = settings.pitch / 100;
            const volume = settings.volume / 100;
            
            this.googleTTS.setRate(rate);
            this.googleTTS.setPitch(pitch);
            this.googleTTS.setVolume(volume);
            
            console.log('🎤 Configurações Android aplicadas ao Google TTS:', { rate, pitch, volume });
        }
        
        // Salvar configurações
        this.saveSettings();
    }
    
    testCurrentVoice() {
        console.log('🎤 Testando voz Google TTS...');
        
        // Configurar Google TTS com as configurações atuais
        const rate = document.getElementById('speedSlider').value / 100;
        const pitch = document.getElementById('pitchSlider').value / 100;
        const volume = document.getElementById('volumeSlider').value / 100;
        
        this.googleTTS.setRate(rate);
        this.googleTTS.setPitch(pitch);
        this.googleTTS.setVolume(volume);
        
        // Configurar voz selecionada
        if (this.selectedVoice != null) {
            this.googleTTS.setVoice(this.selectedVoice);
            const voices = this.googleTTS.getVoices();
            if (voices[this.selectedVoice]) {
                console.log(`🎤 Testando voz: ${voices[this.selectedVoice].name} (${voices[this.selectedVoice].lang})`);
            }
        }
        
        // Testar a voz
        this.googleTTS.testVoice();
    }
    // Sistema de Timer Avançado
    setupAdvancedTimer() {
        // Propriedades do timer
        this.timerMode = 'reading'; // 'reading', 'countdown', 'stopwatch'
        this.timerDuration = 0; // Duração em segundos
        this.timerStartTime = 0; // Timestamp de início
        this.timerEndTime = 0; // Timestamp de fim
        this.advancedTimerInterval = null;
        this.timerDisplay = null;
        this.timerCallback = null;
        
        console.log('⏱️ Sistema de timer avançado inicializado');
    }
    
    // Iniciar timer de leitura (conta tempo total)
    startReadingTimer() {
        if (this.advancedTimerInterval) {
            clearInterval(this.advancedTimerInterval);
        }
        
        this.timerMode = 'reading';
        this.timerStartTime = Date.now();
        
        this.advancedTimerInterval = setInterval(() => {
            this.elapsedTime++;
            this.updateTimerDisplay();
        }, 1000);
        
        console.log('📖 Timer de leitura iniciado');
    }
    
    // Iniciar timer de contagem regressiva (para parar após X tempo)
    startCountdownTimer(minutes = 30) {
        if (this.advancedTimerInterval) {
            clearInterval(this.advancedTimerInterval);
        }
        
        this.timerMode = 'countdown';
        this.timerDuration = minutes * 60; // Converter para segundos
        this.timerStartTime = Date.now();
        this.timerEndTime = this.timerStartTime + (this.timerDuration * 1000);
        
        this.advancedTimerInterval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, this.timerEndTime - now);
            
            if (remaining <= 0) {
                this.stopCountdownTimer();
                this.onTimerComplete();
            } else {
                this.updateCountdownDisplay(remaining);
            }
        }, 1000);
        
        console.log(`⏰ Timer de contagem regressiva iniciado: ${minutes} minutos`);
    }
    
    // Iniciar cronômetro (contagem progressiva)
    startStopwatch() {
        if (this.advancedTimerInterval) {
            clearInterval(this.advancedTimerInterval);
        }
        
        this.timerMode = 'stopwatch';
        this.timerStartTime = Date.now();
        
        this.advancedTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.timerStartTime) / 1000);
            this.updateStopwatchDisplay(elapsed);
        }, 1000);
        
        console.log('⏱️ Cronômetro iniciado');
    }
    
    // Parar timer atual
    stopAdvancedTimer() {
        if (this.advancedTimerInterval) {
            clearInterval(this.advancedTimerInterval);
            this.advancedTimerInterval = null;
        }
        
        console.log(`⏹️ Timer ${this.timerMode} parado`);
    }
    
    // Parar timer de contagem regressiva
    stopCountdownTimer() {
        this.stopAdvancedTimer();
        this.timerMode = 'reading';
        this.updateTimerDisplay(); // Voltar para display de leitura
    }
    
    // Callback quando timer de contagem regressiva termina
    onTimerComplete() {
        console.log('⏰ Timer de contagem regressiva concluído');
        
        // Parar a leitura
        this.stopReading();
        
        // Mostrar notificação
        this.showTimerNotification();
        
        // Voltar para timer de leitura
        this.startReadingTimer();
    }
    
    // Mostrar notificação do timer
    showTimerNotification() {
        // Criar notificação visual
        const notification = document.createElement('div');
        notification.className = 'timer-notification';
        notification.innerHTML = `
            <div class="timer-notification-content">
                <h3>⏰ Timer Concluído!</h3>
                <p>Tempo de leitura definido foi atingido.</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Notificação sonora (se suportado)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer de Leitura', {
                body: 'Tempo de leitura definido foi atingido!',
                icon: '📚'
            });
        }
    }
    
    // Atualizar display da contagem regressiva
    updateCountdownDisplay(remainingSeconds) {
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
            timerDisplay.className = 'timer-display countdown-timer';
            
            // Mudar cor quando estiver acabando (últimos 5 minutos)
            if (remainingSeconds <= 300) {
                timerDisplay.style.color = '#ff6b6b';
                timerDisplay.style.animation = 'pulse 1s infinite';
            }
        }
    }
    
    // Atualizar display do cronômetro
    updateStopwatchDisplay(elapsedSeconds) {
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
            timerDisplay.className = 'timer-display stopwatch-timer';
        }
    }
    
    // Função para alternar entre modos de timer
    toggleTimerMode() {
        const timerSlider = document.getElementById('timerSlider');
        const timerValue = document.getElementById('timerValue');
        
        if (!timerSlider || !timerValue) return;
        
        const currentMode = this.timerMode;
        const minutes = parseInt(timerSlider.value);
        
        switch (currentMode) {
            case 'reading':
                // Mudar para contagem regressiva
                this.startCountdownTimer(minutes);
                timerValue.textContent = `${minutes}min ⏰`;
                break;
            case 'countdown':
                // Voltar para timer de leitura
                this.stopCountdownTimer();
                this.startReadingTimer();
                timerValue.textContent = `${minutes}min 📖`;
                break;
            case 'stopwatch':
                // Voltar para timer de leitura
                this.stopAdvancedTimer();
                this.startReadingTimer();
                timerValue.textContent = `${minutes}min 📖`;
                break;
        }
        
        console.log(`🔄 Timer alternado para modo: ${this.timerMode}`);
        this.updateTimerButtonLabels();
    }
    
    // Função para definir tempo de contagem regressiva
    setCountdownTime(minutes) {
        if (this.timerMode === 'countdown') {
            this.stopCountdownTimer();
            this.startCountdownTimer(minutes);
        }
        
        const timerValue = document.getElementById('timerValue');
        if (timerValue) {
            timerValue.textContent = `${minutes}min ⏰`;
        }
    }
    
    // Função para pausar/resumir timer
    pauseResumeTimer() {
        if (this.advancedTimerInterval) {
            // Pausar
            this.stopAdvancedTimer();
            console.log('⏸️ Timer pausado');
        } else {
            // Resumir
            if (this.timerMode === 'countdown') {
                const remaining = Math.max(0, this.timerEndTime - Date.now());
                if (remaining > 0) {
                    this.startCountdownTimer(Math.ceil(remaining / 60));
                }
            } else {
                this.startReadingTimer();
            }
            console.log('▶️ Timer resumido');
        }
        this.updateTimerButtonLabels();
    }
    
    // Função para resetar timer
    resetTimer() {
        this.stopAdvancedTimer();
        this.elapsedTime = 0;
        this.timerStartTime = 0;
        this.timerEndTime = 0;
        this.updateTimerDisplay();
        console.log('🔄 Timer resetado');
    }
    
    // Função para obter estatísticas do timer
    getTimerStats() {
        return {
            mode: this.timerMode,
            elapsedTime: this.elapsedTime,
            totalReadingTime: this.elapsedTime,
            currentSession: this.timerStartTime ? Date.now() - this.timerStartTime : 0,
            isRunning: !!this.advancedTimerInterval
        };
    }
    
    // Função para atualizar labels dos botões de timer
    updateTimerButtonLabels() {
        const timerModeBtn = document.getElementById('timerModeBtn');
        const timerPauseBtn = document.getElementById('timerPauseBtn');
        
        if (timerModeBtn) {
            switch (this.timerMode) {
                case 'reading':
                    timerModeBtn.textContent = '📖 Modo Leitura';
                    timerModeBtn.className = 'btn btn-secondary text-xs py-1';
                    break;
                case 'countdown':
                    timerModeBtn.textContent = '⏰ Modo Contagem';
                    timerModeBtn.className = 'btn btn-warning text-xs py-1';
                    break;
                case 'stopwatch':
                    timerModeBtn.textContent = '⏱️ Modo Cronômetro';
                    timerModeBtn.className = 'btn btn-success text-xs py-1';
                    break;
            }
        }
        
        if (timerPauseBtn) {
            if (this.advancedTimerInterval) {
                timerPauseBtn.textContent = '⏸️ Pausar';
                timerPauseBtn.className = 'btn btn-secondary text-xs py-1';
            } else {
                timerPauseBtn.textContent = '▶️ Resumir';
                timerPauseBtn.className = 'btn btn-success text-xs py-1';
            }
        }
    }

    async loadEPUB(var_obj_file) {
        try {
            const var_obj_zip = new JSZip();
            const var_obj_zipData = await var_obj_zip.loadAsync(var_obj_file);
            // Encontrar o arquivo de conteúdo (container.xml)
            const var_obj_container = await var_obj_zipData.file('META-INF/container.xml').async('text');
            const var_obj_parser = new DOMParser();
            const var_obj_xml = var_obj_parser.parseFromString(var_obj_container, 'application/xml');
            const var_str_rootfile = var_obj_xml.querySelector('rootfile').getAttribute('full-path');
            // Carregar o arquivo OPF
            const var_obj_opf = await var_obj_zipData.file(var_str_rootfile).async('text');
            const var_obj_opfXml = var_obj_parser.parseFromString(var_obj_opf, 'application/xml');
            // Encontrar os itens do manifest
            const var_arr_items = Array.from(var_obj_opfXml.querySelectorAll('manifest > item'));
            const var_arr_spine = Array.from(var_obj_opfXml.querySelectorAll('spine > itemref'));
            // Mapear id -> href
            const var_obj_idToHref = {};
            var_arr_items.forEach(item => {
                var_obj_idToHref[item.getAttribute('id')] = item.getAttribute('href');
            });
            // Carregar capítulos
            const var_arr_chapters = [];
            for (const itemref of var_arr_spine) {
                const var_str_id = itemref.getAttribute('idref');
                const var_str_href = var_obj_idToHref[var_str_id];
                if (!var_str_href) continue;
                // Caminho relativo ao OPF
                const var_str_basePath = var_str_rootfile.substring(0, var_str_rootfile.lastIndexOf('/') + 1);
                const var_str_fullPath = var_str_basePath + var_str_href;
                const var_obj_fileEntry = var_obj_zipData.file(var_str_fullPath);
                if (!var_obj_fileEntry) continue;
                const var_str_content = await var_obj_fileEntry.async('text');
                // Extrair texto do HTML
                const var_str_text = this.extractTextFromHTML(var_str_content);
                // Título do capítulo
                let var_str_title = var_str_href;
                try {
                    const var_obj_html = var_obj_parser.parseFromString(var_str_content, 'text/html');
                    const var_el_title = var_obj_html.querySelector('title, h1, h2, h3');
                    if (var_el_title) var_str_title = var_el_title.textContent.trim();
                } catch {}
                var_arr_chapters.push({
                    title: var_str_title,
                    content: var_str_text
                });
            }
            this.chapters = var_arr_chapters;
            this.currentChapter = 0;
            this.displayCurrentChapter();
            this.updateStatus('EPUB carregado!', 'ready');
            this.saveReadingState();
        } catch (error) {
            alert('Erro ao carregar EPUB: ' + error.message);
            console.error(error);
        }
    }

    // Busca global em todos os capítulos
    searchGlobal(var_str_query) {
        if (!var_str_query.trim() || this.chapters.length === 0) return [];
        const var_arr_results = [];
        const var_str_queryLower = var_str_query.toLowerCase();
        const self = this;
        this.chapters.forEach(function(chapter, chapterIdx) {
            // Procurar todas as ocorrências no texto do capítulo
            const var_arr_sentences = self.splitIntoSentences(chapter.content);
            var_arr_sentences.forEach(function(sentence, sentenceIdx) {
                if (sentence.toLowerCase().includes(var_str_queryLower)) {
                    // Contexto: pegar até 20 caracteres antes e depois
                    const var_num_pos = sentence.toLowerCase().indexOf(var_str_queryLower);
                    const var_str_context = sentence.substring(Math.max(0, var_num_pos - 20), var_num_pos + var_str_query.length + 20);
                    var_arr_results.push({
                        chapter: chapterIdx,
                        sentence: sentenceIdx,
                        context: var_str_context,
                        full: sentence
                    });
                }
            });
        });
        return var_arr_results;
    }

    // Navegar para resultado da busca global e destacar o termo
    goToSearchResult(var_num_chapter, var_num_sentence) {
        this.currentChapter = var_num_chapter;
        this.currentSentenceIndex = var_num_sentence;
        this.displayCurrentChapter();
        this.highlightCurrentSentence();
        if (typeof this._updateSlider === 'function') this._updateSlider();
        // Destacar o termo buscado na sentença
        const var_el_viewer = document.getElementById('epubViewer');
        const var_el_content = var_el_viewer.querySelector('.chapter-content');
        if (var_el_content) {
            // Remover highlights antigos
            var_el_content.innerHTML = var_el_content.innerHTML.replace(/<mark class="search-highlight">(.*?)<\/mark>/g, '$1');
            // Destacar o termo buscado na sentença atual
            const var_str_query = document.getElementById('searchInput').value.trim();
            if (var_str_query) {
                const regex = new RegExp(var_str_query, 'gi');
                // Encontrar a sentença atual
                const spans = var_el_content.querySelectorAll('.sentence');
                if (spans && spans[this.currentSentenceIndex]) {
                    spans[this.currentSentenceIndex].innerHTML = spans[this.currentSentenceIndex].textContent.replace(regex, '<mark class="search-highlight">$&</mark>');
                }
            }
        }
    }

    // Adicione dentro da classe EPUBReaderTTS:
    splitIntoSentences(text) {
        if (!text) return [];
        // Divide por pontuação comum de final de frase, mantendo a pontuação
        return text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g) || [];
    }

    highlightCurrentSentence() {
        const var_el_viewer = document.getElementById('epubViewer');
        if (!var_el_viewer) return;
        const var_el_content = var_el_viewer.querySelector('.chapter-content');
        if (!var_el_content) return;

        // Remove highlights antigos
        var_el_content.querySelectorAll('.sentence').forEach(span => {
            span.classList.remove('highlight');
        });

        // Adiciona highlight na sentença atual
        const spans = var_el_content.querySelectorAll('.sentence');
        if (spans && spans[this.currentSentenceIndex]) {
            spans[this.currentSentenceIndex].classList.add('highlight');
            // Scroll até a sentença destacada
            spans[this.currentSentenceIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new EPUBReaderTTS();
});

// Botões flutuantes e atalhos de teclado
function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
}
function showKeyboardShortcuts() {
    const shortcuts = document.getElementById('keyboardShortcuts');
    shortcuts.style.display = shortcuts.style.display === 'block' ? 'none' : 'block';
    setTimeout(() => {
        shortcuts.style.display = 'none';
    }, 5000);
}
document.body.insertAdjacentHTML('beforeend', `
    <div class="floating-controls">
        <button class="floating-btn" onclick="app.showStats()" title="Estatísticas">📊</button>
        <button class="floating-btn" onclick="toggleReadingMode()" title="Modo Leitura">🌙</button>
        <button class="floating-btn" onclick="showKeyboardShortcuts()" title="Atalhos">⌨️</button>
    </div>
    <div class="keyboard-shortcuts" id="keyboardShortcuts">
        <strong>Atalhos do Teclado:</strong><br>
        Espaço - Play/Pause<br>
        → - Próximo capítulo<br>
        ← - Capítulo anterior<br>
        Ctrl+F - Buscar<br>
        Ctrl+B - Adicionar marcador<br>
        Esc - Parar leitura
    </div>
`);
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (app.isPlaying && !app.isPaused) {
                app.pauseReading();
            } else if (app.isPaused) {
                app.resumeReading();
            } else {
                app.speakText();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            app.nextChapter();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            app.previousChapter();
            break;
        case 'Escape':
            e.preventDefault();
            app.stopReading();
            break;
        case 'KeyF':
            if (e.ctrlKey) {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            break;
        case 'KeyB':
            if (e.ctrlKey) {
                e.preventDefault();
                app.addBookmark();
            }
            break;
    }
});
console.log('- Leitor EPUB com TTS carregado com sucesso!');
console.log('- Funcionalidades disponíveis:');
console.log('- Carregamento de arquivos EPUB');
console.log('- Síntese de voz com controles avançados');
console.log('- Sistema de marcadores');
console.log('- Busca no texto');
console.log('- Estatísticas de leitura');
console.log('- Atalhos de teclado');
console.log('- Modo de leitura noturno'); 
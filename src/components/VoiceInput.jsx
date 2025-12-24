import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function VoiceInput({
  value = '',
  onChange,
  placeholder = 'Ketik atau gunakan voice input...',
  language = 'id-ID',
  className = '',
  disabled = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        // Accumulate final transcripts
        setAccumulatedTranscript(prev => prev + final);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'not-allowed') {
        alert('Izin mikrofon ditolak. Aktifkan di pengaturan browser.');
      } else if (event.error === 'no-speech') {
        // Silently restart if no speech detected
        if (isListening) {
          recognition.start();
        }
      } else if (event.error === 'network') {
        alert('Koneksi internet diperlukan untuk voice input.');
      }
    };

    recognition.onend = () => {
      // Auto-restart if still listening
      if (isListening && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isListening, value, onChange]);

  const toggleListening = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Save accumulated transcript to value
      if (accumulatedTranscript) {
        onChange(value + accumulatedTranscript);
      }

      setIsListening(false);
      setInterimTranscript('');
      setAccumulatedTranscript('');
    } else {
      // Start listening
      if (recognitionRef.current) {
        try {
          setAccumulatedTranscript(''); // Reset accumulator
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error('Failed to start recognition:', e);
        }
      }
    }
  };

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className={`${className} ${isListening ? 'ring-2 ring-red-400 border-red-400 pb-8' : ''
          } resize-none transition-all`}
      />

      {/* Interim Transcript Overlay */}
      {interimTranscript && (
        <div className="absolute bottom-8 left-3 right-12 text-sm text-gray-400 italic pointer-events-none">
          {interimTranscript}
        </div>
      )}

      {/* Voice Input Button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={!isSupported || disabled}
        className={`absolute bottom-3 right-2 p-2 rounded-lg transition-all ${isListening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
          : isSupported && !disabled
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        title={
          !isSupported
            ? 'Browser tidak mendukung voice input'
            : isListening
              ? 'Tap untuk stop recording'
              : 'Tap untuk mulai voice input'
        }
      >
        {isListening ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Recording Indicator - Inside textarea */}
      {isListening && (
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-red-500 pointer-events-none">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Recording...</span>
        </div>
      )}

      {/* Browser Not Supported Warning */}
      {!isSupported && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">
          ⚠️ Browser Anda tidak mendukung voice input. Silakan ketik manual.
        </div>
      )}
    </div>
  );
}

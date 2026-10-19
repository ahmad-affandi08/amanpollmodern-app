import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from './Alert/useToast';

const getSpeechRecognition = () =>
  typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition;

const MIC_DENIED_MESSAGE =
  'Izin mikrofon ditolak. Aktifkan lewat ikon gembok di address bar → Permissions → Microphone → Allow, lalu muat ulang halaman.';

export default function VoiceInput({
  value = '',
  onChange,
  placeholder = 'Ketik atau gunakan voice input...',
  language = 'id-ID',
  className = '',
  disabled = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const { showToast } = useToast();
  const [isSupported] = useState(() => !!getSpeechRecognition() && window.isSecureContext);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const shouldListenRef = useRef(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);


  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);


  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!isSupported || !SpeechRecognition) {
      return undefined;
    }


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

        const newValue = valueRef.current + final;
        onChangeRef.current(newValue);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      console.error('❌ Error details:', event);
      setIsListening(false);
      shouldListenRef.current = false;

      // 'no-speech' dan 'aborted' adalah kejadian normal, bukan kesalahan untuk pengguna.
      if (event.error === 'not-allowed') {
        showToast(MIC_DENIED_MESSAGE, 'error');
      } else if (event.error === 'network') {
        showToast('Koneksi internet diperlukan untuk input suara.', 'error');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        showToast(`Input suara gagal: ${event.error}`, 'error');
      }
    };

    recognition.onend = () => {

      if (shouldListenRef.current && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setIsListening(false);
          shouldListenRef.current = false;
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      // Hentikan sepenuhnya: tanpa ini onend akan menyalakan mikrofon lagi setelah unmount.
      shouldListenRef.current = false;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch (e) {
        console.error('Gagal menghentikan input suara:', e);
      }
      recognitionRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isSupported]);

  const toggleListening = () => {
    if (!isSupported || disabled) {
      return;
    }

    if (isListening) {

      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimTranscript('');
    } else {

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {

            stream.getTracks().forEach(track => track.stop());


            if (recognitionRef.current) {
              try {
                shouldListenRef.current = true;
                recognitionRef.current.start();
                setIsListening(true);
              } catch (e) {
                console.error('Failed to start recognition:', e);
                shouldListenRef.current = false;
                showToast(`Gagal memulai input suara: ${e.message}`, 'error');
              }
            }
          })
          .catch((err) => {
            console.error('Microphone permission denied:', err);
            showToast(MIC_DENIED_MESSAGE, 'error');
          });
      } else {

        if (recognitionRef.current) {
          try {
            shouldListenRef.current = true;
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.error('Failed to start recognition:', e);
            shouldListenRef.current = false;
            showToast(`Gagal memulai input suara: ${e.message}`, 'error');
          }
        } else {
          console.error('Recognition ref is null');
        }
      }
    }
  };

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  if (!isSupported) {
    return (
      <div className="relative">
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className={`${className} resize-none`}
        />
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">
          ⚠️ Browser Anda tidak mendukung voice input. Silakan ketik manual.
        </div>
      </div>
    );
  }

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

      {/* Recording Indicator - Inside textarea */}
      {isListening && (
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-red-500 pointer-events-none">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Recording...</span>
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
    </div>
  );
}

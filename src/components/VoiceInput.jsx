import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

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
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const shouldListenRef = useRef(false); // Track intended listening state
  const valueRef = useRef(value); // Track latest value
  const onChangeRef = useRef(onChange); // Track latest onChange

  // Update refs when props change
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log('🎤 VoiceInput: Checking browser support...');
    console.log('🎤 SpeechRecognition available:', !!SpeechRecognition);
    console.log('🎤 Secure context (HTTPS):', window.isSecureContext);

    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition not supported in this browser');
      setIsSupported(false);
      return;
    }

    if (!window.isSecureContext) {
      console.error('❌ Not a secure context (HTTPS required)');
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
      console.log('🎤 onresult triggered, results:', event.results.length);
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`🎤 Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        console.log('✅ Final transcript:', final);
        // Immediately update value for real-time response using refs
        const newValue = valueRef.current + final;
        onChangeRef.current(newValue);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      console.error('❌ Error details:', event);
      setIsListening(false);
      shouldListenRef.current = false; // Always set to false on error

      if (event.error === 'not-allowed') {
        alert('❌ Izin mikrofon ditolak!\n\nCara mengaktifkan:\n1. Tap icon gembok di address bar\n2. Permissions → Microphone\n3. Set ke "Allow"');
      } else if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected');
        // Don't auto-restart, let user manually restart if needed
      } else if (event.error === 'network') {
        alert('❌ Koneksi internet diperlukan untuk voice input.');
      } else if (event.error === 'aborted') {
        console.log('⚠️ Recognition aborted');
      } else {
        alert(`❌ Speech recognition error: ${event.error}`);
      }
    };

    recognition.onstart = () => {
      console.log('✅ Recognition onstart event fired');
      console.log('🎤 Language:', recognition.lang);
      console.log('🎤 Continuous:', recognition.continuous);
      console.log('🎤 InterimResults:', recognition.interimResults);
    };

    recognition.onend = () => {
      console.log('⚠️ Recognition ended');
      // Auto-restart if still listening (check ref, not state)
      if (shouldListenRef.current && recognitionRef.current) {
        try {
          console.log('🔄 Auto-restarting recognition...');
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); // Only re-initialize when language changes

  const toggleListening = () => {
    if (!isSupported || disabled) {
      console.log('❌ Cannot toggle: supported=', isSupported, 'disabled=', disabled);
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping recognition...');
      // Stop listening
      shouldListenRef.current = false; // Set ref first to prevent auto-restart
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimTranscript('');
    } else {
      console.log('▶️ Starting recognition...');

      // Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('📱 Requesting microphone permission...');
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            console.log('✅ Microphone permission granted');
            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop());

            // Now start recognition
            if (recognitionRef.current) {
              try {
                shouldListenRef.current = true; // Set ref before starting
                recognitionRef.current.start();
                setIsListening(true);
                console.log('✅ Recognition started successfully');
              } catch (e) {
                console.error('❌ Failed to start recognition:', e);
                shouldListenRef.current = false;
                alert(`Failed to start voice input: ${e.message}`);
              }
            }
          })
          .catch((err) => {
            console.error('❌ Microphone permission denied:', err);
            alert('❌ Izin mikrofon ditolak!\n\nCara mengaktifkan:\n1. Tap icon gembok di address bar\n2. Permissions → Microphone\n3. Set ke "Allow"\n4. Refresh halaman');
          });
      } else {
        // Fallback: start without explicit permission request
        console.log('⚠️ getUserMedia not available, starting directly...');
        if (recognitionRef.current) {
          try {
            shouldListenRef.current = true; // Set ref before starting
            recognitionRef.current.start();
            setIsListening(true);
            console.log('✅ Recognition started successfully');
          } catch (e) {
            console.error('❌ Failed to start recognition:', e);
            shouldListenRef.current = false;
            alert(`Failed to start voice input: ${e.message}`);
          }
        } else {
          console.error('❌ Recognition ref is null');
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

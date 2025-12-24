import React, { useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({
  value = '',
  onChange,
  placeholder = 'Ketik atau gunakan voice input...',
  language = 'id-ID',
  className = '',
  disabled = false,
}) {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const savedValueRef = useRef('');

  // Save final transcript when it changes
  useEffect(() => {
    if (finalTranscript && listening) {
      console.log('✅ Final transcript:', finalTranscript);
      // Append final transcript to the value that existed when we started listening
      const newValue = savedValueRef.current + finalTranscript;
      onChange(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscript, listening]);

  // Check browser support
  useEffect(() => {
    console.log('🎤 Browser supports speech recognition:', browserSupportsSpeechRecognition);
    console.log('🎤 Microphone available:', isMicrophoneAvailable);
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  // Debug: Log listening state changes
  useEffect(() => {
    console.log('🎤 Listening state changed:', listening);
  }, [listening]);

  const handleStartListening = () => {
    console.log('▶️ Starting listening...');
    savedValueRef.current = value; // Save current value
    resetTranscript(); // Clear previous transcript
    SpeechRecognition.startListening({
      continuous: true,
      language: language,
    });
  };

  const handleStopListening = () => {
    console.log('� Stopping listening...');
    SpeechRecognition.stopListening();
    resetTranscript(); // Clear transcript after saving
  };

  const toggleListening = () => {
    if (listening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className={`${className} ${listening ? 'ring-2 ring-red-400 border-red-400 pb-8' : ''
          } resize-none transition-all`}
      />

      {/* Current Transcript Preview (while listening) */}
      {listening && interimTranscript && (
        <div className="absolute bottom-8 left-3 right-12 text-sm text-gray-400 italic pointer-events-none">
          {interimTranscript}
        </div>
      )}

      {/* Voice Input Button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !isMicrophoneAvailable}
        className={`absolute bottom-3 right-2 p-2 rounded-lg transition-all ${listening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
          : isMicrophoneAvailable && !disabled
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        title={
          !isMicrophoneAvailable
            ? 'Microphone tidak tersedia'
            : listening
              ? 'Tap untuk stop recording'
              : 'Tap untuk mulai voice input'
        }
      >
        {listening ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Recording Indicator - Inside textarea */}
      {listening && (
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-red-500 pointer-events-none">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Recording...</span>
        </div>
      )}

      {/* Microphone Not Available Warning */}
      {!isMicrophoneAvailable && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">
          ⚠️ Microphone tidak tersedia. Pastikan izin microphone sudah diberikan.
        </div>
      )}
    </div>
  );
}

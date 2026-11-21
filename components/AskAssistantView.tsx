'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { HouseholdProfile } from '@/lib/profile/types';
import { AQIData } from '@/lib/aqi/types';
import { ChatAnswer } from '@/lib/ai/gemini';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  PhoneCall,
  Loader2
} from 'lucide-react';

interface AskAssistantViewProps {
  profile: HouseholdProfile;
  aqiData: AQIData;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  queryText?: string;
  answer?: ChatAnswer;
  timestamp: string;
}

export const AskAssistantView: React.FC<AskAssistantViewProps> = ({
  profile,
  aqiData,
}) => {
  const { t, isHindi } = useI18n();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          answer: {
            shortAnswer: isHindi
              ? `नमस्ते! मैं क्लीनब्रीथ AI सहायक हूं। वर्तमान में ${profile.location.city} में AQI ${aqiData.aqi} (${aqiData.categoryLabel.hi}) है।`
              : `Hello! I am CleanBreath Assistant. Current outdoor air in ${profile.location.city} is AQI ${aqiData.aqi} (${aqiData.categoryLabel.en}).`,
            whatToDoNow: [
              isHindi ? 'नीचे दिए गए सुझावों में से चुनें या अपना प्रश्न टाइप करें।' : 'Tap any suggested question below or ask your own question.',
              isHindi ? 'बोलकर पूछने के लिए माइक बटन का उपयोग करें।' : 'Use the mic button for voice input if preferred.',
            ],
            why: isHindi
              ? 'सभी उत्तर वैज्ञानिक अध्ययनों और आपके परिवार की प्रोफ़ाइल पर आधारित हैं।'
              : 'Every answer is grounded in peer-reviewed IAQ science and calibrated to your family setup.',
            impactEstimate: isHindi ? 'सटीक व्यक्तिगत मार्गदर्शन।' : 'Quantified exposure reduction.',
            caveats: isHindi
              ? 'क्लीनब्रीथ चिकित्सीय सलाह नहीं देता है।'
              : 'CleanBreath provides environmental guidance and is not a medical device.',
          },
        },
      ]);
    }
  }, [isHindi]);

  // Handle Speech-to-Text (STT)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHindi ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।' : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputText(speechToText);
      handleSendMessage(speechToText);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Handle Text-to-Speech (TTS)
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isSubmitting) return;

    const userMsg: MessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      queryText: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          profile,
          language: isHindi ? 'hi' : 'en',
        }),
      });

      if (!res.ok) throw new Error('API failed');

      const answer: ChatAnswer = await res.json();
      const assistantMsg: MessageItem = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          answer: {
            shortAnswer: isHindi
              ? 'वर्तमान में नेटवर्क में व्यवधान है; कृपया खिड़कियां सील रखें और N95 मास्क पहनें।'
              : 'Network offline. Please keep windows sealed, avoid morning exertion, and wear a well-fitted N95.',
            whatToDoNow: [
              isHindi ? 'खिड़कियों पर गीला तौलिया लगाएं।' : 'Place damp towels along door drafts.',
              isHindi ? 'गीला पोछा लगाएं।' : 'Strictly wet mop floors.',
            ],
            why: isHindi ? 'सर्दियों का इनवर्जन प्रदूषण को रोक लेता है।' : 'Winter surface inversion traps particulate smog.',
            impactEstimate: isHindi ? '40% कम संपर्क।' : '40% inhalation reduction.',
            caveats: isHindi ? 'डॉक्टर से परामर्श लें।' : 'Seek medical advice for acute symptoms.',
          },
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPrompts = [
    t.chat.quick1,
    t.chat.quick2,
    t.chat.quick3,
    t.chat.quick4,
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t.chat.title}</h2>
            <p className="text-xs text-slate-500">{t.chat.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Preset One-Tap Questions Strip */}
      <div 
        role="region" 
        aria-label="Preset quick questions"
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'user' ? (
              <div className="bg-teal-700 text-white p-3 rounded-2xl rounded-tr-xs text-xs font-medium max-w-[85%] shadow-xs">
                {msg.queryText}
                <span className="block text-[10px] text-teal-200 text-right mt-1">
                  {msg.timestamp}
                </span>
              </div>
            ) : msg.answer ? (
              <article 
                className={`rounded-2xl border p-4 max-w-[95%] shadow-xs space-y-3 ${
                  msg.answer.isEmergency 
                    ? 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-400' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Emergency Banner if Acute Symptoms Detected */}
                {msg.answer.isEmergency && (
                  <div 
                    role="alert" 
                    className="bg-red-600 text-white p-3 rounded-xl flex items-start gap-2 shadow-sm font-bold text-xs"
                  >
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse mt-0.5" />
                    <div className="space-y-1">
                      <span className="block uppercase tracking-wider text-[11px]">
                        {isHindi ? 'आपातकालीन चिकित्सा चेतावनी' : 'Urgent Medical Escalation'}
                      </span>
                      <p className="text-red-50 font-medium leading-snug">
                        {msg.answer.emergencyNotice || t.safety.emergencyDesc}
                      </p>
                      <div className="pt-1">
                        <a
                          href="tel:112"
                          className="inline-flex items-center gap-1.5 bg-white text-red-700 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{t.safety.callAmbulance}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. Short Answer */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-snug text-slate-900">
                    {msg.answer.shortAnswer}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSpeak(`${msg.answer?.shortAnswer}. ${msg.answer?.whatToDoNow.join('. ')}`)}
                    className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 flex-shrink-0"
                    aria-label="Read answer aloud"
                    title={isSpeaking ? t.chat.stopSpeak : t.chat.speak}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-teal-600" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* 2. What To Do Now */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                    {isHindi ? 'तत्काल करने योग्य कदम:' : 'What to do right now:'}
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {msg.answer.whatToDoNow.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Why it Works */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    {isHindi ? 'वैज्ञानिक कारण:' : 'Scientific Mechanism:'}
                  </span>
                  <p className="leading-relaxed">{msg.answer.why}</p>
                </div>

                {/* 4. Estimated Impact */}
                <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-xs flex items-start gap-2 text-sky-950 font-medium">
                  <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px] text-sky-800">
                      {isHindi ? 'अनुमानित प्रभाव:' : 'Estimated Direct Impact:'}
                    </span>
                    <span>{msg.answer.impactEstimate}</span>
                  </div>
                </div>

                {/* 5. Caveats */}
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{msg.answer.caveats}</span>
                </div>
              </article>
            ) : null}
          </div>
        ))}

        {isSubmitting && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>{isHindi ? 'AI उत्तर तैयार कर रहा है...' : 'CleanBreath AI is formulating answer...'}</span>
          </div>
        )}
      </div>

      {/* Input Box with Voice Mic */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="sticky bottom-16 z-30 bg-white rounded-2xl border border-slate-300 shadow-md p-1.5 flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-xl transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'text-slate-500 hover:text-teal-700 hover:bg-slate-100'
          }`}
          aria-label={isListening ? t.chat.listening : 'Voice input microphone'}
          title={isListening ? t.chat.listening : 'Speak query'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.chat.placeholder}
          className="flex-1 text-xs bg-transparent border-none focus:outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-all shadow-xs"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

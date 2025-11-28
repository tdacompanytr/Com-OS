import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Bot, User } from 'lucide-react';
import { sendMessageToGemini } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ThemeConfig } from '../../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AssistantAppProps {
    theme?: ThemeConfig;
}

const AssistantApp: React.FC<AssistantAppProps> = ({ theme }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Merhaba! Ben Com Asistan. Bugün Com OS\'ta size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Add placeholder for model response
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const stream = sendMessageToGemini(userMsg);
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
           const newMsgs = [...prev];
           newMsgs[newMsgs.length - 1].text = fullText;
           return newMsgs;
        });
      }
    } catch (err) {
       setMessages(prev => {
           const newMsgs = [...prev];
           newMsgs[newMsgs.length - 1].text = "Üzgünüm, yapay zeka servisine bağlanırken bir hata oluştu.";
           return newMsgs;
        });
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = theme ? theme.primary : 'bg-blue-600';
  const hoverColor = theme ? theme.hover : 'hover:bg-blue-500';

  return (
    <div className="flex flex-col h-full bg-[#202020] text-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'model' ? 'bg-purple-600' : primaryColor}`}>
                {msg.role === 'model' ? <Bot size={18} /> : <User size={18} />}
             </div>
             <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'model' ? 'bg-[#333]' : primaryColor}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
             </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.text === '' && (
           <div className="flex gap-2 text-gray-400 text-xs ml-12 animate-pulse">
              Düşünüyor...
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#2d2d2d] border-t border-[#444]">
        <div className="flex gap-2">
           <input 
             type="text"
             className={`flex-1 bg-[#1a1a1a] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none focus:${theme ? theme.border : 'border-purple-500'}`}
             placeholder="Com Asistan'a bir şey sorun..."
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleSend()}
           />
           <button 
             onClick={handleSend}
             disabled={isLoading || !input.trim()}
             className={`p-2 ${primaryColor} ${hoverColor} rounded-md disabled:opacity-50 transition-colors`}
           >
             <Send size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantApp;
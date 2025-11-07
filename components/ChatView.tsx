import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSend, IconSparkles } from './common/Icons';

interface ChatViewProps {
    askThiago: (message: string) => Promise<string>;
}

interface Message {
    id: number;
    sender: 'user' | 'thiago';
    text: string;
}

const TypingIndicator: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
    >
        <motion.img 
            src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png" 
            alt="Avatar de Thiago" 
            className="w-8 h-8 rounded-full"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            }}
        />
        <div className="flex items-center gap-1.5 p-3 bg-gray-100 rounded-full mt-1">
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        </div>
    </motion.div>
);

export const ChatView: React.FC<ChatViewProps> = ({ askThiago }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            id: Date.now(),
            sender: 'thiago',
            text: '¡Hola! Soy Thiago, tu asesor energético. ¿En qué puedo ayudarte hoy?'
        }]);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: Message = { id: Date.now(), sender: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseText = await askThiago(trimmedInput);
            const thiagoMessage: Message = { id: Date.now() + 1, sender: 'thiago', text: responseText };
            setMessages(prev => [...prev, thiagoMessage]);
        } catch (error) {
            console.error("Error fetching Thiago's response:", error);
            const errorMessage: Message = { id: Date.now() + 1, sender: 'thiago', text: "Lo siento, estoy teniendo problemas para conectar. Por favor, inténtalo de nuevo más tarde." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F4F4F5] -m-4">
            <header className="flex items-center p-4 border-b border-gray-200/80 flex-shrink-0 bg-white/50 backdrop-blur-sm">
                <img
                    src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                    alt="Avatar de Thiago"
                    className="w-9 h-9 rounded-full mr-3"
                />
                <div className="flex-1">
                    <p className="font-bold text-sm text-gray-800">Thiago · <span className="font-medium">Asesor energético</span></p>
                    <p className="text-xs text-gray-500">MiMejorLuz</p>
                </div>
            </header>

            <main ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                        >
                            {msg.sender === 'thiago' && (
                                 <motion.img 
                                    src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png" 
                                    alt="Avatar de Thiago" 
                                    className="w-8 h-8 rounded-full"
                                    animate={{ scale: [1, 1.04, 1] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        repeatType: "mirror",
                                        ease: "easeInOut",
                                        delay: Math.random() * 2,
                                    }}
                                 />
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-[#1D1D1F] text-white rounded-br-lg'
                                : 'bg-white text-gray-800 rounded-bl-lg shadow-sm border border-black/5'
                                }`}>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && <TypingIndicator />}
            </main>
            
            <footer className="p-3 border-t border-gray-200/80 bg-white/50 backdrop-blur-sm flex-shrink-0">
                 <div style={{paddingBottom: `calc(env(safe-area-inset-bottom, 0px))`}}>
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            className="flex-1 w-full text-sm p-2.5 border-0 bg-gray-100 rounded-lg focus:ring-2 focus:ring-[#1D1D1F]"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="p-2.5 rounded-lg text-white bg-[#1D1D1F] hover:bg-black disabled:bg-gray-300 transition-colors"
                        >
                            <IconSend className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
};
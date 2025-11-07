import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askThiago } from '../services/thiagoService';
import { IconSend, IconX } from './common/Icons';

interface ThiagoChatProps {
    onClose: () => void;
    lastAnalysisSource?: 'invoices' | 'manual' | null;
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
        className="flex items-center gap-2 p-3"
    >
        <motion.img
            src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
            alt="Avatar de Thiago"
            className="w-8 h-8 rounded-full"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            }}
        />
        <div className="flex items-center gap-1.5 p-3 bg-gray-100 rounded-full">
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        </div>
    </motion.div>
);

const ThiagoChat: React.FC<ThiagoChatProps> = ({ onClose, lastAnalysisSource }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let initialMessage = 'Soy Thiago 👋. Puedo ayudarte con tarifas, horarios baratos, autoconsumo y batería virtual. ¿Qué quieres ver?';
        if (lastAnalysisSource === 'manual') {
            initialMessage = '¡Hola! Soy Thiago. Veo que has introducido tus datos a mano. ¡Genial, ya tenemos una primera estimación! 💡 Para un análisis más preciso, te recomiendo subir una factura real cuando puedas. Mientras tanto, ¿en qué te ayudo?';
        }
        setMessages([{
            id: Date.now(),
            sender: 'thiago',
            text: initialMessage
        }]);
    }, [lastAnalysisSource]);

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
            const context = lastAnalysisSource ? { source: lastAnalysisSource } : undefined;
            const responseText = await askThiago(trimmedInput, context);
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
        // FIX: The root element must be a `motion.div` to accept framer-motion props.
        <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <motion.div
                className="relative bg-white w-full max-w-md max-h-[85vh] rounded-t-2xl shadow-2xl flex flex-col"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
                {/* Header */}
                <header className="flex items-center p-4 border-b border-gray-100 flex-shrink-0">
                    <img
                        src="https://storage.googleapis.com/mejorluz-assets-public-2025/avatar-thiago.png"
                        alt="Avatar de Thiago"
                        className="w-9 h-9 rounded-full mr-3"
                    />
                    <div className="flex-1">
                        <p className="font-bold text-sm text-gray-800">Thiago · <span className="font-medium">Asesor energético</span></p>
                        <p className="text-xs text-gray-500">MiMejorLuz</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <IconX className="w-5 h-5" />
                    </button>
                </header>

                {/* Chat Body */}
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
                                    : 'bg-gray-100 text-gray-800 rounded-bl-lg'
                                    }`}>
                                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && <TypingIndicator />}
                </main>

                {/* Input Area */}
                <footer className="p-3 border-t bg-white flex-shrink-0">
                     <div style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px))` }}>
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Escribe tu consulta..."
                                className="flex-1 w-full text-sm p-2.5 border-0 bg-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="p-2.5 rounded-lg text-white bg-[var(--text-main)] disabled:bg-gray-300 transition-colors"
                            >
                                <IconSend className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default ThiagoChat;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatMessage } from '../types';
import Spinner from './Spinner';
import Icon from './Icon';

interface ChatInterfaceProps {
    documentName: string;
    history: ChatMessage[];
    isQueryLoading: boolean;
    onSendMessage: (message: string) => void;
    onNewChat: () => void;
    exampleQuestions: string[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentName, history, isQueryLoading, onSendMessage, onNewChat, exampleQuestions }) => {
    const [query, setQuery] = useState('');
    const [currentSuggestion, setCurrentSuggestion] = useState('');
    const [modalContent, setModalContent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (exampleQuestions.length === 0) {
            setCurrentSuggestion('');
            return;
        }

        setCurrentSuggestion(exampleQuestions[0]);
        let suggestionIndex = 0;
        const intervalId = setInterval(() => {
            suggestionIndex = (suggestionIndex + 1) % exampleQuestions.length;
            setCurrentSuggestion(exampleQuestions[suggestionIndex]);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [exampleQuestions]);

    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let paraBuffer = '';

        function flushPara() {
            if (paraBuffer) {
                html += `<p class="my-2 leading-relaxed">${paraBuffer}</p>`;
                paraBuffer = '';
            }
        }

        function flushList() {
            if (listType) {
                html += `</${listType}>`;
                listType = null;
            }
        }

        for (const rawLine of lines) {
            const line = rawLine
                .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>')
                .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-surface-soft px-1.5 py-0.5 rounded-md font-mono text-xs">$1</code>');

            const isOl = line.match(/^\s*\d+\.\s(.*)/);
            const isUl = line.match(/^\s*[\*\-]\s(.*)/);

            if (isOl) {
                flushPara();
                if (listType !== 'ol') {
                    flushList();
                    html += '<ol class="list-decimal list-inside my-2 pl-5 space-y-1">';
                    listType = 'ol';
                }
                html += `<li>${isOl[1]}</li>`;
            } else if (isUl) {
                flushPara();
                if (listType !== 'ul') {
                    flushList();
                    html += '<ul class="list-disc list-inside my-2 pl-5 space-y-1">';
                    listType = 'ul';
                }
                html += `<li>${isUl[1]}</li>`;
            } else {
                flushList();
                if (line.trim() === '') {
                    flushPara();
                } else {
                    paraBuffer += (paraBuffer ? '<br/>' : '') + line;
                }
            }
        }

        flushPara();
        flushList();

        return { __html: html };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSendMessage(query);
            setQuery('');
        }
    };

    const handleSourceClick = (text: string) => {
        setModalContent(text);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isQueryLoading]);

    return (
        <div className="relative flex h-full flex-col">
            <header className="sticky top-0 z-20 border-b border-outline/60 bg-surface/95 backdrop-blur">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft/60">Now chatting</p>
                        <h1 className="font-display text-xl text-ink" title={`Chat with ${documentName}`}>
                            {documentName || 'Your documents'}
                        </h1>
                    </div>
                    <motion.button
                        onClick={onNewChat}
                        className="inline-flex items-center gap-2 rounded-full border border-outline/80 bg-surface-soft px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-accent/40 hover:text-accent"
                        whileTap={{ scale: 0.96 }}
                        title="End current chat and start a new one"
                    >
                        <Icon name="refresh" size={18} className="text-inherit" />
                        New chat
                    </motion.button>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto px-4 py-10 sm:px-6">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    <AnimatePresence initial={false}>
                        {history.map((message, index) => (
                            <motion.div
                                key={`${message.role}-${index}-${message.parts[0].text}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xl rounded-3xl px-6 py-4 shadow-subtle ${
                                        message.role === 'user'
                                            ? 'bg-gradient-to-br from-ink via-ink to-ink-soft text-white'
                                            : 'bg-surface'
                                    }`}
                                >
                                    <div
                                        className={`text-[0.95rem] leading-relaxed ${message.role === 'user' ? 'text-white/85' : 'text-ink-soft'}`}
                                        dangerouslySetInnerHTML={renderMarkdown(message.parts[0].text)}
                                    />
                                    {message.role === 'model' && message.groundingChunks && message.groundingChunks.length > 0 && (
                                        <div className="mt-5 border-t border-outline/60 pt-4">
                                            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/60">Sources</h4>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {message.groundingChunks.map((chunk, chunkIndex) => (
                                                    chunk.retrievedContext?.text && (
                                                        <button
                                                            key={chunkIndex}
                                                            onClick={() => handleSourceClick(chunk.retrievedContext!.text!)}
                                                            className="inline-flex items-center gap-2 rounded-full border border-outline/70 bg-surface-soft px-3 py-1 text-xs font-semibold text-ink-soft transition hover:border-accent/40 hover:text-accent"
                                                            aria-label={`View source ${chunkIndex + 1}`}
                                                            title="View source document chunk"
                                                        >
                                                            <Icon name="loader" size={12} className="text-accent" />
                                                            Source {chunkIndex + 1}
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isQueryLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-3 rounded-3xl bg-surface px-5 py-3 shadow-subtle">
                                <Spinner />
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft/60">Thinking</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-outline/60 bg-surface/95 px-4 py-6 backdrop-blur sm:px-6">
                <div className="mx-auto w-full max-w-5xl space-y-4">
                    <div className="min-h-[2.5rem] text-center">
                        {!isQueryLoading && currentSuggestion && (
                            <motion.button
                                onClick={() => setQuery(currentSuggestion)}
                                className="inline-flex items-center gap-2 rounded-full border border-outline/60 bg-surface-soft px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-accent/50 hover:text-accent"
                                whileTap={{ scale: 0.97 }}
                                title="Use this suggestion as your prompt"
                            >
                                <Icon name="send" size={16} className="text-accent" />
                                Try: “{currentSuggestion}”
                            </motion.button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask anything about your manuals..."
                                className="w-full rounded-2xl border border-outline/70 bg-surface px-5 py-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                                disabled={isQueryLoading}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isQueryLoading || !query.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent via-accent-soft to-accent-emerald px-5 py-3 text-sm font-semibold text-white shadow-brand transition disabled:cursor-not-allowed disabled:opacity-60"
                            title="Send message"
                            whileTap={{ scale: isQueryLoading || !query.trim() ? 1 : 0.97 }}
                        >
                            <Icon name="send" size={18} className="text-white" />
                            Send
                        </motion.button>
                    </form>
                </div>
            </div>

            {modalContent !== null && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="source-modal-title"
                >
                    <motion.div
                        className="elevated-card w-full max-w-3xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <div className="flex items-center justify-between border-b border-outline/60 px-6 py-4">
                            <h3 id="source-modal-title" className="font-display text-lg text-ink">Source context</h3>
                            <button onClick={closeModal} className="rounded-full bg-surface-soft px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-accent" title="Close source view">
                                Close
                            </button>
                        </div>
                        <div
                            className="subtle-scrollbar max-h-[60vh] overflow-y-auto px-6 py-6 text-sm leading-relaxed text-ink-soft"
                            dangerouslySetInnerHTML={renderMarkdown(modalContent || '')}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;

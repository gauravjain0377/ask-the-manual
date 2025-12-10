/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from './Spinner';
import Icon from './Icon';

interface WelcomeScreenProps {
    onUpload: () => Promise<void>;
    apiKeyError: string | null;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    isApiKeySelected: boolean;
    onSelectKey: () => Promise<void>;
}

const sampleDocuments = [
    {
        name: 'Iphone 17 Pro Max Manual',
        details: '8 pages · PDF',
        url: 'https://cdsassets.apple.com/live/6GJYWVAV/information/locale/en-gb/iphone-17-pro-max-info.pdf',
        icon: <Icon name="washing" size={30} className="text-accent" />,
        fileName: 'apple-mobile-manual.pdf'
    },
    {
        name: 'LG Washer Manual',
        details: '36 pages · PDF',
        url: 'https://www.lg.com/us/support/products/documents/WM2077CW.pdf',
        icon: <Icon name="truck" size={30} className="text-accent" />,
        fileName: 'lg-washer-manual.pdf'
    }
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUpload, apiKeyError, files, setFiles, isApiKeySelected, onSelectKey }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [loadingSample, setLoadingSample] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };
  
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files) {
            setFiles(prev => [...prev, ...Array.from(event.dataTransfer.files)]);
        }
    }, [setFiles]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) setIsDragging(true);
    }, [isDragging]);
    
    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleSelectSample = async (name: string, url: string, fileName: string) => {
        if (loadingSample) return;
        setLoadingSample(name);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${name}: ${response.statusText}. This may be a CORS issue.`);
            }
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: blob.type });
            setFiles(prev => [...prev, file]);
        } catch (error) {
            console.error("Error fetching sample file:", error);
            if (error instanceof Error && error.message.includes('Failed to fetch')) {
                alert(`Could not fetch the sample document. Please try uploading a local file instead.`);
            }
        } finally {
            setLoadingSample(null);
        }
    };

    const handleConfirmUpload = async () => {
        try {
            await onUpload();
        } catch (error) {
            // Error is handled by the parent component, but we catch it here
            // to prevent an "uncaught promise rejection" warning in the console.
            console.error("Upload process failed:", error);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSelectKeyClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await onSelectKey();
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-14 sm:px-6 lg:px-10">
            <div className="absolute inset-0 -z-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.16),_transparent_50%)]" />
            </div>
            <div className="mx-auto w-full max-w-5xl">
                <motion.div
                    className="mb-10 flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                    <span className="inline-flex items-center rounded-full bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink-soft/60 shadow-subtle">
                        Document Intelligence
                    </span>
                    <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-ink sm:text-5xl">
                        Upload manuals, explore insights, and chat with clarity.
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-ink-soft/80">
                        AskTheManual turns dense handbooks into a conversational experience. Bring your own files or test a curated example to see retrieval-augmented generation in action.
                    </p>
                    <AnimatePresence>
                        {apiKeyError && (
                            <motion.div
                                key="apikey-error"
                                className="mt-6 w-full max-w-xl rounded-2xl border border-danger/30 bg-danger/5 px-5 py-3 text-sm text-danger"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                            >
                                {apiKeyError}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
                    <motion.div
                        className="elevated-card lg:min-h-[480px]"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.45, ease: 'easeOut' }}
                    >
                        <div className="flex flex-col gap-8 px-8 py-10">
                            <div
                                className={`group relative flex flex-col items-center justify-center rounded-3xl border border-dashed px-8 py-14 text-center transition ${
                                    isDragging ? 'border-accent bg-accent/5 shadow-brand' : 'border-outline/80 bg-surface-soft'
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                                        <Icon name="upload" size={36} />
                                    </span>
                                    <div className="space-y-3">
                                        <p className="text-xl font-semibold text-ink">Drop your manuals here</p>
                                        <p className="max-w-sm text-sm text-ink-soft/70">
                                            Supports PDF, TXT, and Markdown files. We process them securely and spin up a temporary knowledge store for your session.
                                        </p>
                                    </div>
                                    <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                                    <motion.label
                                        htmlFor="file-upload"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink text-surface px-6 py-3 text-sm font-semibold tracking-wide transition hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                                        tabIndex={0}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                (document.getElementById('file-upload') as HTMLInputElement)?.click();
                                            }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon name="upload" size={18} className="text-surface" />
                                        Browse from device
                                    </motion.label>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-soft/70">Queue</h4>
                                        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{files.length} file{files.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <ul className="subtle-scrollbar max-h-44 space-y-2 overflow-y-auto pr-1 text-sm">
                                        {files.map((file, index) => (
                                            <li
                                                key={`${file.name}-${index}`}
                                                className="flex items-center justify-between rounded-2xl border border-outline/70 bg-surface px-4 py-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-ink" title={file.name}>{file.name}</p>
                                                    <span className="text-xs text-ink-soft/70">{(file.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-soft text-ink-soft/70 transition hover:text-danger"
                                                    aria-label={`Remove ${file.name}`}
                                                    title="Remove this file"
                                                >
                                                    <Icon name="trash" size={18} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              

                                {files.length > 0 && (
                                    <motion.button
                                        onClick={handleConfirmUpload}
                                        disabled={!isApiKeySelected}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-subtle transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                                        title={!isApiKeySelected ? 'Please select an API key first' : 'Start chat session with the selected files'}
                                        whileTap={{ scale: 0.97 }}
                                        aria-disabled={!isApiKeySelected}
                                    >
                                        <Icon name="send" size={18} className="text-white" />
                                        Upload & Start chatting
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex flex-col gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
                    >
                        <div className="rounded-3xl border border-outline/80 bg-surface px-7 py-8 shadow-subtle">
                            <h3 className="font-display text-xl text-ink">Choose an example</h3>
                            <p className="mt-2 text-sm text-ink-soft/75">Dive in instantly with preloaded manuals curated to highlight question-driven exploration.</p>
                            <div className="mt-6 grid gap-3">
                                {sampleDocuments.map(doc => (
                                    <motion.button
                                        key={doc.name}
                                        onClick={() => handleSelectSample(doc.name, doc.url, doc.fileName)}
                                        className="flex items-center gap-4 rounded-2xl border border-outline/70 bg-surface-soft px-4 py-4 text-left transition hover:-translate-y-1 hover:border-accent/50 hover:bg-surface"
                                        disabled={!!loadingSample}
                                        title={`Chat with the ${doc.name}`}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                                            {loadingSample === doc.name ? <Spinner /> : doc.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-ink">{doc.name}</p>
                                            <p className="text-xs text-ink-soft/70">{doc.details}</p>
                                        </div>
                                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft/50">Preview</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-outline/40 bg-surface/80 px-7 py-6 backdrop-blur">
                            <h4 className="text-sm font-semibold text-ink">How it works</h4>
                            <ul className="mt-4 space-y-3 text-sm text-ink-soft/75">
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">01</span>
                                    Upload documents securely and define a private session.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">02</span>
                                    We generate embeddings, build a contextual index, and suggest starter prompts.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">03</span>
                                    Chat naturally. Each answer references the most relevant passages for transparency.
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;

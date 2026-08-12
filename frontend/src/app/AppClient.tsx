'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { NdaFormData, EMPTY_FORM } from '@/lib/types';

const FORM_KEYS = new Set(Object.keys(EMPTY_FORM) as (keyof NdaFormData)[]);
import { buildMarkdown } from '@/lib/buildMarkdown';
import { storage } from '@/lib/storage';

const INITIAL_MESSAGE = "Hi! I'll help you create a Mutual NDA. Let's start — what are the names and companies of both parties?";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AppClient() {
  const [form, setForm] = useState<NdaFormData>(EMPTY_FORM);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!storage.get('token')) router.push('/login');
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const markdown = useMemo(() => buildMarkdown(form), [form]);
  const previewHtml = useMemo(() => marked(markdown) as string, [markdown]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const token = storage.get('token');
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages, form }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.reply) {
          setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
        }
        if (data.fields && typeof data.fields === 'object') {
          const safe = Object.fromEntries(
            Object.entries(data.fields as Record<string, string>).filter(([k]) => FORM_KEYS.has(k as keyof NdaFormData))
          ) as Partial<NdaFormData>;
          setForm(f => ({ ...f, ...safe }));
        }
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let pos = 0;
      let remaining = imgH;
      while (remaining > 0) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -pos, imgW, imgH);
        remaining -= pageH;
        pos += pageH;
        if (remaining > 0) pdf.addPage();
      }
      pdf.save('mutual-nda.pdf');
    } finally {
      setExporting(false);
    }
  };

  const handleSignOut = () => {
    storage.remove('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <span className="font-semibold text-gray-900">prelegal</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={exporting}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting…' : 'Download PDF'}
          </button>
          <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 53px)' }}>
        {/* Chat panel */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mutual NDA</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-lg text-sm">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-200 p-3 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </aside>

        {/* Preview panel */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div
            ref={previewRef}
            className="max-w-3xl mx-auto px-10 py-10 prose prose-sm prose-gray"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </main>
      </div>
    </div>
  );
}

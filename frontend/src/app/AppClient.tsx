'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { FormData } from '@/lib/types';
import { buildDocument } from '@/lib/buildDocument';
import { storage } from '@/lib/storage';

const INITIAL_MESSAGE =
  "Hi! What kind of legal document do you need? I can generate a Mutual NDA, Cloud Service Agreement, or Professional Services Agreement. Tell me what you're trying to do and I'll guide you through it.";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AppClient() {
  const [form, setForm] = useState<FormData>({});
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [standardTerms, setStandardTerms] = useState('');
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

  useEffect(() => {
    if (!templateId) {
      setStandardTerms('');
      return;
    }
    const token = storage.get('token');
    fetch(`/api/templates/${encodeURIComponent(templateId)}/standard-terms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => (res.ok ? res.text() : ''))
      .then(setStandardTerms)
      .catch(() => setStandardTerms(''));
  }, [templateId]);

  const markdown = useMemo(
    () => buildDocument(templateId, form, standardTerms),
    [templateId, form, standardTerms]
  );
  const previewHtml = useMemo(() => (markdown ? (marked(markdown) as string) : ''), [markdown]);

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
        body: JSON.stringify({ messages: newMessages, templateId, form }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.reply) {
          setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
        }
        if (data.templateId && data.templateId !== templateId) {
          setTemplateId(data.templateId);
          setForm({});
        }
        if (data.fields && typeof data.fields === 'object') {
          setForm(f => ({ ...f, ...(data.fields as FormData) }));
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
    if (!previewRef.current || !markdown) return;
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
      pdf.save(`${templateId || 'document'}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const handleSignOut = () => {
    storage.remove('token');
    router.push('/login');
  };

  const headerLabel = templateId
    ? { 'mutual-nda': 'Mutual NDA', csa: 'Cloud Service Agreement', psa: 'Professional Services Agreement' }[templateId] ??
      templateId
    : 'Choose a template';

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <span className="font-semibold text-gray-900">prelegal</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={exporting || !markdown}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting…' : 'Download PDF'}
          </button>
          <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 min-h-0">
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{headerLabel}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-lg text-sm">Thinking…</div>
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

        <main className="flex-1 overflow-y-auto bg-white min-h-0">
          {previewHtml ? (
            <div
              ref={previewRef}
              className="max-w-3xl mx-auto px-10 py-10 prose prose-sm prose-gray"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Your document preview will appear here.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

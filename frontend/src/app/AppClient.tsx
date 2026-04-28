'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { NdaFormData, EMPTY_FORM } from '@/lib/types';
import { buildMarkdown } from '@/lib/buildMarkdown';
import { storage } from '@/lib/storage';

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT = 'w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500';

export default function AppClient() {
  const [form, setForm] = useState<NdaFormData>(EMPTY_FORM);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!storage.get('token')) router.push('/login');
  }, [router]);

  const set = (field: keyof NdaFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const markdown = useMemo(() => buildMarkdown(form), [form]);
  const previewHtml = useMemo(() => marked(markdown) as string, [markdown]);

  const handleGenerate = async () => {
    const token = storage.get('token');
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(f => ({
          ...f,
          purpose: data.purpose ?? f.purpose,
          effectiveDate: data.effectiveDate ?? f.effectiveDate,
          mndaTermYears: data.mndaTermYears ?? f.mndaTermYears,
          termOfConfidentialityYears: data.termOfConfidentialityYears ?? f.termOfConfidentialityYears,
          governingLaw: data.governingLaw ?? f.governingLaw,
          jurisdiction: data.jurisdiction ?? f.jurisdiction,
        }));
      }
    } catch { /* backend not ready */ } finally {
      setGenerating(false);
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
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
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
        {/* Form panel */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto shrink-0 p-5 space-y-5">
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Party 1</h3>
            <div className="space-y-2.5">
              <Field label="Name" id="p1name"><input id="p1name" className={INPUT} value={form.party1Name} onChange={set('party1Name')} placeholder="Jane Smith" /></Field>
              <Field label="Title" id="p1title"><input id="p1title" className={INPUT} value={form.party1Title} onChange={set('party1Title')} placeholder="CEO" /></Field>
              <Field label="Company" id="p1co"><input id="p1co" className={INPUT} value={form.party1Company} onChange={set('party1Company')} placeholder="Acme Corp" /></Field>
              <Field label="Email" id="p1email"><input id="p1email" type="email" className={INPUT} value={form.party1Email} onChange={set('party1Email')} placeholder="jane@acme.com" /></Field>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Party 2</h3>
            <div className="space-y-2.5">
              <Field label="Name" id="p2name"><input id="p2name" className={INPUT} value={form.party2Name} onChange={set('party2Name')} placeholder="John Doe" /></Field>
              <Field label="Title" id="p2title"><input id="p2title" className={INPUT} value={form.party2Title} onChange={set('party2Title')} placeholder="CTO" /></Field>
              <Field label="Company" id="p2co"><input id="p2co" className={INPUT} value={form.party2Company} onChange={set('party2Company')} placeholder="Beta Ltd" /></Field>
              <Field label="Email" id="p2email"><input id="p2email" type="email" className={INPUT} value={form.party2Email} onChange={set('party2Email')} placeholder="john@beta.com" /></Field>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agreement</h3>
            <div className="space-y-2.5">
              <Field label="Purpose" id="purpose">
                <textarea id="purpose" className={`${INPUT} resize-none`} rows={3} value={form.purpose} onChange={set('purpose')} placeholder="Evaluating a potential business relationship…" />
              </Field>
              <Field label="Effective Date" id="date">
                <input id="date" type="date" className={INPUT} value={form.effectiveDate} onChange={set('effectiveDate')} />
              </Field>
              <Field label="MNDA Term (years)" id="term">
                <input id="term" type="number" min="1" className={INPUT} value={form.mndaTermYears} onChange={set('mndaTermYears')} />
              </Field>
              <Field label="Confidentiality Term (years)" id="conf">
                <input id="conf" type="number" min="1" className={INPUT} value={form.termOfConfidentialityYears} onChange={set('termOfConfidentialityYears')} />
              </Field>
              <Field label="Governing Law (state)" id="law">
                <input id="law" className={INPUT} value={form.governingLaw} onChange={set('governingLaw')} placeholder="California" />
              </Field>
              <Field label="Jurisdiction" id="juris">
                <input id="juris" className={INPUT} value={form.jurisdiction} onChange={set('jurisdiction')} placeholder="San Francisco, CA" />
              </Field>
              <Field label="Modifications (optional)" id="mods">
                <textarea id="mods" className={`${INPUT} resize-none`} rows={2} value={form.modifications} onChange={set('modifications')} placeholder="Any changes to standard terms…" />
              </Field>
            </div>
          </section>
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

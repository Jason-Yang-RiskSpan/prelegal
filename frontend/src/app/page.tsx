"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

interface FormData {
  party1Name: string;
  party1Title: string;
  party1Company: string;
  party1Address: string;
  party2Name: string;
  party2Title: string;
  party2Company: string;
  party2Address: string;
  purpose: string;
  effectiveDate: string;
  mndaTerm: string;
  confidentialityTerm: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
}

const defaultForm: FormData = {
  party1Name: "Jane Smith",
  party1Title: "CEO",
  party1Company: "Acme Corp",
  party1Address: "jane@acme.com",
  party2Name: "John Doe",
  party2Title: "CTO",
  party2Company: "Globex Inc",
  party2Address: "john@globex.com",
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: new Date().toISOString().split("T")[0],
  mndaTerm: "1",
  confidentialityTerm: "1",
  governingLaw: "Delaware",
  jurisdiction: "courts located in Wilmington, DE",
  modifications: "",
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (name: keyof FormData, value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {textarea ? (
        <textarea
          className={cls}
          rows={2}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={cls}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [document, setDocument] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (name: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setDocument(data.document);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generate(); }, []);

  const download = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(document, 180);
    doc.text(lines, 15, 15);
    doc.save("Mutual-NDA.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Mutual NDA Creator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the key details and let AI complete your Mutual Non-Disclosure Agreement.
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Form panel */}
        <aside className="w-96 bg-white border-r overflow-y-auto p-6 flex flex-col gap-5 shrink-0">
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Party 1</h2>
            <div className="flex flex-col gap-3">
              <Field label="Full Name" name="party1Name" value={form.party1Name} onChange={update} placeholder="Jane Smith" />
              <Field label="Title" name="party1Title" value={form.party1Title} onChange={update} placeholder="CEO" />
              <Field label="Company" name="party1Company" value={form.party1Company} onChange={update} placeholder="Acme Corp" />
              <Field label="Notice Address / Email" name="party1Address" value={form.party1Address} onChange={update} placeholder="jane@acme.com" />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Party 2</h2>
            <div className="flex flex-col gap-3">
              <Field label="Full Name" name="party2Name" value={form.party2Name} onChange={update} placeholder="John Doe" />
              <Field label="Title" name="party2Title" value={form.party2Title} onChange={update} placeholder="CTO" />
              <Field label="Company" name="party2Company" value={form.party2Company} onChange={update} placeholder="Globex Inc" />
              <Field label="Notice Address / Email" name="party2Address" value={form.party2Address} onChange={update} placeholder="john@globex.com" />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agreement Terms</h2>
            <div className="flex flex-col gap-3">
              <Field label="Purpose" name="purpose" value={form.purpose} onChange={update} textarea />
              <Field label="Effective Date" name="effectiveDate" value={form.effectiveDate} onChange={update} placeholder="2025-01-01" />
              <Field label="MNDA Term (years)" name="mndaTerm" value={form.mndaTerm} onChange={update} placeholder="1" />
              <Field label="Term of Confidentiality (years)" name="confidentialityTerm" value={form.confidentialityTerm} onChange={update} placeholder="1" />
              <Field label="Governing Law (state)" name="governingLaw" value={form.governingLaw} onChange={update} placeholder="Delaware" />
              <Field label="Jurisdiction" name="jurisdiction" value={form.jurisdiction} onChange={update} placeholder="courts located in New Castle, DE" />
              <Field label="Modifications (optional)" name="modifications" value={form.modifications} onChange={update} textarea placeholder="None" />
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded text-sm transition-colors cursor-pointer"
          >
            {loading ? "Generating..." : "Generate NDA"}
          </button>
        </aside>

        {/* Preview panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {document ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</h2>
                <button
                  onClick={download}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  Download PDF
                </button>
              </div>
              <pre className="bg-white border rounded p-6 text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                {document}
              </pre>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Fill in the form and click Generate NDA to see the preview here.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

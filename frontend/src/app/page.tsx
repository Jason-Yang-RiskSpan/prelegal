"use client";

import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { buildMarkdown, type NdaFormData as FormData } from "@/lib/buildMarkdown";

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
  const previewRef = useRef<HTMLDivElement>(null);

  const update = (name: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [name]: value }));

  const markdown = useMemo(() => buildMarkdown(form), [form]);
  const html = useMemo(() => {
    const raw = marked(markdown, { async: false });
    return typeof window !== "undefined" ? DOMPurify.sanitize(raw) : raw;
  }, [markdown]);

  const download = async () => {
    if (!previewRef.current) return;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;

    let cursorY = margin;
    const children = Array.from(previewRef.current.children) as HTMLElement[];

    for (const el of children) {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
      const blockH = (canvas.height * usableW) / canvas.width;

      // Block fits on one page but overflows current — start fresh page.
      if (blockH <= usableH && cursorY + blockH > pageH - margin) {
        pdf.addPage();
        cursorY = margin;
      }

      // Block is taller than one page — slice across pages.
      if (blockH > usableH) {
        const ratio = canvas.width / usableW;
        let sourceY = 0;
        while (sourceY < canvas.height) {
          if (cursorY > margin) { pdf.addPage(); cursorY = margin; }
          const sliceSrcH = Math.round(Math.min(usableH * ratio, canvas.height - sourceY));
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = sliceSrcH;
          const ctx = slice.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, slice.width, slice.height);
            ctx.drawImage(canvas, 0, -sourceY);
          }
          const sliceH = sliceSrcH / ratio;
          pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, cursorY, usableW, sliceH);
          sourceY += sliceSrcH;
          cursorY = pageH;
        }
        continue;
      }

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, cursorY, usableW, blockH);
      cursorY += blockH + 8;
    }

    pdf.save("Mutual-NDA.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Mutual NDA Creator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit the fields on the left — the agreement updates live on the right.
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
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

          <button
            onClick={download}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded text-sm transition-colors cursor-pointer"
          >
            Download PDF
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Preview</h2>
            <div
              ref={previewRef}
              className="nda-doc bg-white border rounded p-10 text-sm text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

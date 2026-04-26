"use client";

import { useMemo, useRef } from "react";
import { marked } from "marked";
import html2canvas from "html2canvas";
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

import { useState } from "react";

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

function buildMarkdown(f: FormData): string {
  return `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

### Purpose
*How Confidential Information may be used*

${f.purpose}

### Effective Date
${f.effectiveDate}

### MNDA Term
*The length of this MNDA*
- [x] Expires ${f.mndaTerm} year(s) from Effective Date.
- [ ] Continues until terminated in accordance with the terms of the MNDA.

### Term of Confidentiality
*How long Confidential Information is protected*
- [x] ${f.confidentialityTerm} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.
- [ ] In perpetuity.

### Governing Law & Jurisdiction
**Governing Law:** ${f.governingLaw}

**Jurisdiction:** ${f.jurisdiction}

### MNDA Modifications
${f.modifications || "None"}

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

| | PARTY 1 | PARTY 2 |
|:---|:---:|:---:|
| **Print Name** | ${f.party1Name} | ${f.party2Name} |
| **Title** | ${f.party1Title} | ${f.party2Title} |
| **Company** | ${f.party1Company} | ${f.party2Company} |
| **Notice Address** | ${f.party1Address} | ${f.party2Address} |
| **Date** | ${f.effectiveDate} | ${f.effectiveDate} |
| **Signature** | | |

---
*Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*

---

# Standard Terms

1. **Introduction**. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("**MNDA**") allows each party ("**Disclosing Party**") to disclose or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the receiving party ("**Receiving Party**") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("**Confidential Information**"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("**Cover Page**"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the Purpose, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. **Exceptions**. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. **Disclosures Required by Law**. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. **Term and Termination**. This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the Term of Confidentiality, despite any expiration or termination of this MNDA.

6. **Return or Destruction of Confidential Information**. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.

7. **Proprietary Rights**. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. **Disclaimer**. ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. **Governing Law and Jurisdiction**. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${f.governingLaw}, without regard to the conflict of laws provisions of such ${f.governingLaw}. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${f.jurisdiction}. Each party irrevocably submits to the exclusive jurisdiction of such ${f.jurisdiction} in any such suit, action, or proceeding.

10. **Equitable Relief**. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. **General**. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.

*Common Paper Mutual Non-Disclosure Agreement [Version 1.0](https://commonpaper.com/standards/mutual-nda/1.0/) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*`;
}

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
  const html = useMemo(() => marked(markdown) as string, [markdown]);

  const download = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "px", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    let y = 0;
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH);
      y += pageH;
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

          <button
            onClick={download}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded text-sm transition-colors cursor-pointer"
          >
            Download PDF
          </button>
        </aside>

        {/* Preview panel */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</h2>
            </div>
            <div
              ref={previewRef}
              className="bg-white border rounded p-8 text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

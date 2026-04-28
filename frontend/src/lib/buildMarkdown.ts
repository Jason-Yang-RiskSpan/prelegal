import { NdaFormData } from './types';

const STANDARD_TERMS = `
## Standard Terms

1. **Introduction**. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("**MNDA**") allows each party ("**Disclosing Party**") to disclose or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the receiving party ("**Receiving Party**") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("**Confidential Information**"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page.

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the Purpose, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. **Exceptions**. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. **Disclosures Required by Law**. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. **Term and Termination**. This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the Term of Confidentiality, despite any expiration or termination of this MNDA.

6. **Return or Destruction of Confidential Information**. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing.

7. **Proprietary Rights**. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. **Disclaimer**. ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. **Governing Law and Jurisdiction**. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${'{'}Governing Law{'}'}, without regard to the conflict of laws provisions of such Governing Law. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${'{'}Jurisdiction{'}'}.

10. **Equitable Relief**. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. **General**. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter.

---
*Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
`;

export function buildMarkdown(data: NdaFormData): string {
  const p1 = data.party1Company || data.party1Name || 'Party 1';
  const p2 = data.party2Company || data.party2Name || 'Party 2';

  const coverPage = `# Mutual Non-Disclosure Agreement

*This MNDA consists of this Cover Page and the Common Paper Mutual NDA Standard Terms Version 1.0.*

---

**Purpose**
${data.purpose || '*[How Confidential Information may be used]*'}

**Effective Date**
${data.effectiveDate || '*[Date]*'}

**MNDA Term**
${data.mndaTermYears ? `${data.mndaTermYears} year(s) from Effective Date` : '*[Duration]*'}

**Term of Confidentiality**
${data.termOfConfidentialityYears ? `${data.termOfConfidentialityYears} year(s) from Effective Date` : '*[Duration]*'}

**Governing Law**
${data.governingLaw || '*[State]*'}

**Jurisdiction**
${data.jurisdiction || '*[City, State]*'}

${data.modifications ? `**Modifications**\n${data.modifications}\n` : ''}

| | ${p1} | ${p2} |
|:---|:---:|:---:|
| **Name** | ${data.party1Name} | ${data.party2Name} |
| **Title** | ${data.party1Title} | ${data.party2Title} |
| **Company** | ${data.party1Company} | ${data.party2Company} |
| **Email** | ${data.party1Email} | ${data.party2Email} |
| **Signature** | | |
| **Date** | | |

---
`;

  return coverPage + STANDARD_TERMS;
}

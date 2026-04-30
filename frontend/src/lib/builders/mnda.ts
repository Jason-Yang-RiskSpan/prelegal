import { FormData } from '../types';

export function buildMndaCoverPage(data: FormData): string {
  const p1 = data.party1Company || data.party1Name || 'Party 1';
  const p2 = data.party2Company || data.party2Name || 'Party 2';

  return `# Mutual Non-Disclosure Agreement

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

| | ${p1} | ${p2} |
|:---|:---:|:---:|
| **Name** | ${data.party1Name || ''} | ${data.party2Name || ''} |
| **Title** | ${data.party1Title || ''} | ${data.party2Title || ''} |
| **Company** | ${data.party1Company || ''} | ${data.party2Company || ''} |
| **Email** | ${data.party1Email || ''} | ${data.party2Email || ''} |
| **Signature** | | |
| **Date** | | |

---
`;
}

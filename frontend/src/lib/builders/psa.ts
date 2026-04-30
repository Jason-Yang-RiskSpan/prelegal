import { FormData } from '../types';

export function buildPsaCoverPage(data: FormData): string {
  const provider = data.providerCompany || 'Provider';
  const customer = data.customerCompany || 'Customer';

  return `# Professional Services Agreement — Cover Page

*This Professional Services Agreement consists of this Cover Page and the Common Paper PSA Standard Terms.*

---

**Provider**
${provider}

**Customer**
${customer}

**Services**
${data.servicesDescription || '*[Description of services]*'}

**Fees**
${data.fees || '*[Amount and structure]*'}

**Effective Date**
${data.effectiveDate || '*[Date]*'}

**Governing Law**
${data.governingLaw || '*[State]*'}

**Jurisdiction**
${data.jurisdiction || '*[City, State]*'}

| | ${provider} | ${customer} |
|:---|:---:|:---:|
| **Name** | ${data.party1Name || ''} | ${data.party2Name || ''} |
| **Title** | ${data.party1Title || ''} | ${data.party2Title || ''} |
| **Email** | ${data.party1Email || ''} | ${data.party2Email || ''} |
| **Signature** | | |
| **Date** | | |

---
`;
}

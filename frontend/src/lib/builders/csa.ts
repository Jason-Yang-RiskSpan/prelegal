import { FormData } from '../types';

export function buildCsaCoverPage(data: FormData): string {
  const provider = data.providerCompany || 'Provider';
  const customer = data.customerCompany || 'Customer';

  return `# Cloud Service Agreement — Cover Page

*This Cloud Service Agreement consists of this Cover Page and the Common Paper Cloud Service Agreement Standard Terms.*

---

**Provider**
${provider}

**Customer**
${customer}

**Product / Service**
${data.productDescription || '*[Description of the cloud service]*'}

**Subscription Period**
${data.subscriptionPeriod || '*[Duration]*'}

**Fees**
${data.fees || '*[Amount and frequency]*'}

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

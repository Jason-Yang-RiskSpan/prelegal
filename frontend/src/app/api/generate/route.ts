import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const document = `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

### Purpose
<label>How Confidential Information may be used</label>

${body.purpose}

### Effective Date
${body.effectiveDate}

### MNDA Term
<label>The length of this MNDA</label>
- [x]     Expires ${body.mndaTerm} year(s) from Effective Date.
- [ ]     Continues until terminated in accordance with the terms of the MNDA.

### Term of Confidentiality
<label>How long Confidential Information is protected</label>
- [x]     ${body.confidentialityTerm} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.
- [ ]     In perpetuity.

### Governing Law & Jurisdiction
Governing Law: ${body.governingLaw}

Jurisdiction: ${body.jurisdiction}

### MNDA Modifications
${body.modifications || "None"}

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

|| PARTY 1 | PARTY 2 |
|:--- | :----: | :----: |
| Signature | | |
| Print Name | ${body.party1Name} | ${body.party2Name} |
| Title | ${body.party1Title} | ${body.party2Title} |
| Company | ${body.party1Company} | ${body.party2Company} |
| Notice Address | ${body.party1Address} | ${body.party2Address} |
| Date | ${body.effectiveDate} | ${body.effectiveDate} |

Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).`;

  return Response.json({ document });
}

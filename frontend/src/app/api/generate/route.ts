import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const COVER_PAGE_TEMPLATE = `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0). Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

### Purpose
<label>How Confidential Information may be used</label>

[Evaluating whether to enter into a business relationship with the other party.]

### Effective Date
[Today's date]

### MNDA Term
<label>The length of this MNDA</label>
- [x]     Expires [1 year(s)] from Effective Date.
- [ ]     Continues until terminated in accordance with the terms of the MNDA.

### Term of Confidentiality
<label>How long Confidential Information is protected</label>
- [x]     [1 year(s)] from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.
- [ ]     In perpetuity.

### Governing Law & Jurisdiction
Governing Law: [Fill in state]

Jurisdiction: [Fill in city or county and state, i.e. "courts located in New Castle, DE"]

### MNDA Modifications
List any modifications to the MNDA

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

|| PARTY 1 | PARTY 2 |
|:--- | :----: | :----: |
| Signature | | |
| Print Name | |
| Title | | |
| Company | | |
| Notice Address <label>Use either email or postal address</label> | | |
| Date | | |

Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).`;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system:
      "You are a legal document assistant. Fill in the provided Mutual NDA cover page template using the user's information. Replace all bracketed placeholders with appropriate values. Return only the completed markdown document — no explanation, no preamble.",
    messages: [
      {
        role: "user",
        content: `Fill in this Mutual NDA cover page template using the following information:

Party 1:
- Name: ${body.party1Name}
- Title: ${body.party1Title}
- Company: ${body.party1Company}
- Address/Email: ${body.party1Address}

Party 2:
- Name: ${body.party2Name}
- Title: ${body.party2Title}
- Company: ${body.party2Company}
- Address/Email: ${body.party2Address}

Purpose: ${body.purpose}
Effective Date: ${body.effectiveDate}
MNDA Term: ${body.mndaTerm} year(s)
Term of Confidentiality: ${body.confidentialityTerm} year(s)
Governing Law (state): ${body.governingLaw}
Jurisdiction: ${body.jurisdiction}
Modifications: ${body.modifications || "None"}

Template:
${COVER_PAGE_TEMPLATE}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return Response.json({ error: "Unexpected response" }, { status: 500 });
  }

  return Response.json({ document: content.text });
}

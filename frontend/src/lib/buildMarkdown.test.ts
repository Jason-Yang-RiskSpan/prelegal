import { buildMarkdown, NdaFormData } from "./buildMarkdown";

const base: NdaFormData = {
  party1Name: "Jane Smith",
  party1Title: "CEO",
  party1Company: "Acme Corp",
  party1Address: "jane@acme.com",
  party2Name: "John Doe",
  party2Title: "CTO",
  party2Company: "Globex Inc",
  party2Address: "john@globex.com",
  purpose: "Evaluating a potential partnership.",
  effectiveDate: "2026-04-26",
  mndaTerm: "1",
  confidentialityTerm: "2",
  governingLaw: "Delaware",
  jurisdiction: "courts located in Wilmington, DE",
  modifications: "",
};

describe("buildMarkdown", () => {
  it("includes both party names in the signature table", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("Jane Smith");
    expect(md).toContain("John Doe");
  });

  it("includes both party companies", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("Acme Corp");
    expect(md).toContain("Globex Inc");
  });

  it("includes both party titles", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("CEO");
    expect(md).toContain("CTO");
  });

  it("includes both party addresses", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("jane@acme.com");
    expect(md).toContain("john@globex.com");
  });

  it("includes the purpose text", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("Evaluating a potential partnership.");
  });

  it("includes the effective date", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("2026-04-26");
  });

  it("includes the MNDA term", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("Expires 1 year(s)");
  });

  it("includes the confidentiality term", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("2 year(s) from Effective Date");
  });

  it("includes governing law", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("Delaware");
  });

  it("includes jurisdiction", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("courts located in Wilmington, DE");
  });

  it("substitutes governing law into standard terms clause 9", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("laws of the State of Delaware");
    expect(md).toContain("courts located in Wilmington, DE");
  });

  it("shows 'None' when modifications is empty", () => {
    const md = buildMarkdown({ ...base, modifications: "" });
    expect(md).toContain("\nNone\n");
  });

  it("includes custom modifications when provided", () => {
    const md = buildMarkdown({ ...base, modifications: "Section 5 is waived." });
    expect(md).toContain("Section 5 is waived.");
  });

  it("includes the CC BY 4.0 license footer", () => {
    const md = buildMarkdown(base);
    expect(md).toContain("CC BY 4.0");
  });

  it("includes all 11 standard term clauses", () => {
    const md = buildMarkdown(base);
    for (let i = 1; i <= 11; i++) {
      expect(md).toContain(`${i}.`);
    }
  });

  it("returns a non-empty string", () => {
    const md = buildMarkdown(base);
    expect(typeof md).toBe("string");
    expect(md.length).toBeGreaterThan(500);
  });

  it("updates live when party name changes", () => {
    const md1 = buildMarkdown(base);
    const md2 = buildMarkdown({ ...base, party1Name: "Alice Wonder" });
    expect(md1).toContain("Jane Smith");
    expect(md2).toContain("Alice Wonder");
    expect(md2).not.toContain("Jane Smith");
  });
});

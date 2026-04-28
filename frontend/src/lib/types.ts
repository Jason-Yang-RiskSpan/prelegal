export interface NdaFormData {
  party1Name: string;
  party1Title: string;
  party1Company: string;
  party1Email: string;
  party2Name: string;
  party2Title: string;
  party2Company: string;
  party2Email: string;
  purpose: string;
  effectiveDate: string;
  mndaTermYears: string;
  termOfConfidentialityYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
}

export const EMPTY_FORM: NdaFormData = {
  party1Name: '',
  party1Title: '',
  party1Company: '',
  party1Email: '',
  party2Name: '',
  party2Title: '',
  party2Company: '',
  party2Email: '',
  purpose: '',
  effectiveDate: '',
  mndaTermYears: '1',
  termOfConfidentialityYears: '1',
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
};

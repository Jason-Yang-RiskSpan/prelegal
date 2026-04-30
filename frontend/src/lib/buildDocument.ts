import { FormData } from './types';
import { buildMndaCoverPage } from './builders/mnda';
import { buildCsaCoverPage } from './builders/csa';
import { buildPsaCoverPage } from './builders/psa';

const BUILDERS: Record<string, (data: FormData) => string> = {
  'mutual-nda': buildMndaCoverPage,
  csa: buildCsaCoverPage,
  psa: buildPsaCoverPage,
};

export function buildCoverPage(templateId: string, data: FormData): string {
  const builder = BUILDERS[templateId];
  return builder ? builder(data) : '';
}

export function buildDocument(templateId: string | null, data: FormData, standardTerms: string): string {
  if (!templateId) return '';
  const cover = buildCoverPage(templateId, data);
  return cover + '\n\n' + standardTerms;
}

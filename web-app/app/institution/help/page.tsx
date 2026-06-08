import { HelpSupport } from '@/components/shared/HelpSupport';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Institution Help & Support | MediSaar',
  description: 'Find guides, FAQs, and support contact channels tailored for medical clinics and hospital institutions on MediSaar.',
};

export default function InstitutionHelpPage() {
  return <HelpSupport role="INSTITUTION" />;
}

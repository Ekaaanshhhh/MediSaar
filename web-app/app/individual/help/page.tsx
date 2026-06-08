import { HelpSupport } from '@/components/shared/HelpSupport';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Individual Help & Support | MediSaar',
  description: 'Find guides, FAQs, and support contact channels tailored for individual patient users on MediSaar.',
};

export default function IndividualHelpPage() {
  return <HelpSupport role="INDIVIDUAL" />;
}

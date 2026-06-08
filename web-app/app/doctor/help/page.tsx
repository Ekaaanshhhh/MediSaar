import { HelpSupport } from '@/components/shared/HelpSupport';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Help & Support | MediSaar',
  description: 'Find guides, search-enabled FAQs, and support contact channels tailored for medical doctors on MediSaar.',
};

export default function DoctorHelpPage() {
  return <HelpSupport role="DOCTOR" />;
}

import type { Metadata } from 'next';
import { KnowledgeHeader } from '@/components/knowledge/KnowledgeHeader';
import { KnowledgeTabs } from '@/components/knowledge/KnowledgeTabs';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Knowledge & Pipeline Inspection — Sea View Skydiving',
  description:
    'Read-only inspection view of grounded website sources, registered media, and pipeline trace.',
};

export default function KnowledgePage() {
  return (
    <>
      <KnowledgeHeader />
      <main id="main">
        <KnowledgeTabs />
      </main>
      <Footer />
    </>
  );
}


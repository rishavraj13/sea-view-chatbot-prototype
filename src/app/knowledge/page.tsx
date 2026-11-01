import type { Metadata } from 'next';
import { KNOWLEDGE_METADATA, KNOWLEDGE_UI } from '@/content';
import { KnowledgeHeader } from '@/components/knowledge/KnowledgeHeader';
import { KnowledgeTabs } from '@/components/knowledge/KnowledgeTabs';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: KNOWLEDGE_METADATA.title,
  description: KNOWLEDGE_UI.subtitle,
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

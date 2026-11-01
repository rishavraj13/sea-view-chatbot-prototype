import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PhotoBand } from '@/components/PhotoBand';
import { Statement } from '@/components/Statement';
import { Packages } from '@/components/Packages';
import { ThePlan } from '@/components/ThePlan';
import { Faq } from '@/components/Faq';
import { WhereAndWho } from '@/components/WhereAndWho';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <PhotoBand />
        <Statement />
        <Packages />
        <ThePlan />
        <Faq />
        <WhereAndWho />
      </main>
      <Footer />
    </>
  );
}

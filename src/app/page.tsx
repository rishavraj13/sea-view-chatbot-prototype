import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HeroIntro } from '@/components/HeroIntro';
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
        <HeroIntro />
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

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PhotoBand } from '@/components/PhotoBand';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <PhotoBand />
      </main>
    </>
  );
}

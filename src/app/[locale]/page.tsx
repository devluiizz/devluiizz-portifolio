import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Terminal } from "@/components/Terminal";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <Hero />
        <Experience />
        <Projects />
        <About />
        <Terminal year={new Date().getFullYear()} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

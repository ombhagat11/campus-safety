import React from "react";
import Header from "../components/home/Header";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import CTA from "../components/home/CTA";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 antialiased">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mt-12">
          <Hero />
        </section>
        <section id="features" className="mt-20">
          <Features />
        </section>
        <section id="how" className="mt-20">
          <HowItWorks />
        </section>
        <section className="mt-20">
          <CTA />
        </section>
      </main>
      <Footer />
    </div>
  );
}
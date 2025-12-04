import React from "react";
import { FiMapPin } from "react-icons/fi";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Campus Safety</div>
              <div className="text-xs text-slate-500">Pilot — Secure campus reporting</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
            <a href="/login" className="ml-3 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white hover:opacity-95">
              Get Started
            </a>
          </nav>
          <div className="md:hidden">
            <a href="/login" className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm">Get</a>
          </div>
        </div>
      </div>
    </header>
  );
}
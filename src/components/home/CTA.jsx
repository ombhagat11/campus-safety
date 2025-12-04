import React from "react";

export default function CTA() {
  return (
    <div id="get" className="py-12">
      <div className="rounded-2xl p-8 md:p-12 bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Ready to keep your campus safe?</h3>
            <p className="mt-2 text-sky-100/90">Start a pilot in your college or department — fast onboarding for admins & moderators.</p>
          </div>
          <div className="flex gap-3">
            <a className="px-6 py-3 bg-white text-sky-600 rounded-lg font-semibold" href="#contact">Contact Sales</a>
            <a className="px-6 py-3 border border-white/30 rounded-lg text-white" href="#signup">Request Pilot</a>
          </div>
        </div>
      </div>
    </div>
  );
}
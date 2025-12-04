import React from "react";
import { FiMap } from "react-icons/fi";

export default function MapCard() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
      <div className="p-5 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Live campus map</div>
            <div className="text-lg font-semibold">Reports around you</div>
          </div>
          <div className="text-slate-500">
            <FiMap />
          </div>
        </div>
        <div className="mt-4 h-64 rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-100 flex items-center justify-center text-slate-300">
          <div className="text-center">
            <div className="text-4xl">🗺️</div>
            <div className="mt-2 text-sm">Interactive map placeholder</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-center">
            <div className="text-xs text-red-600 font-semibold">High</div>
            <div className="text-sm font-medium">12</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-center">
            <div className="text-xs text-amber-600 font-semibold">Medium</div>
            <div className="text-sm font-medium">18</div>
          </div>
          <div className="p-2 rounded-lg bg-sky-50 text-center">
            <div className="text-xs text-sky-600 font-semibold">Low</div>
            <div className="text-sm font-medium">4</div>
          </div>
        </div>
      </div>
    </div>
  );
}
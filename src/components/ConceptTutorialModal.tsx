/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, ArrowRight, Lightbulb, Box, Layers } from 'lucide-react';

interface ConceptTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptTutorialModal: React.FC<ConceptTutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Why Do We Regroup (Borrow)?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                A simple visual guide for parents and students
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Cookie Box Analogy */}
        <div className="my-6 p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🍪</div>
            <div>
              <h3 className="text-base font-bold text-amber-900">The Cookie Box Analogy</h3>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Imagine you have <strong>5 boxes of 10 cookies</strong> and <strong>2 single cookies</strong> (52 total). A friend asks for <strong>7 single cookies</strong>.
              </p>
              <p className="text-sm text-amber-800 mt-2 font-medium leading-relaxed">
                You only have 2 loose cookies on your plate, so what do you do? You open <strong>1 box of 10 cookies</strong>!
                Now you have <strong>4 boxes</strong> left, and <strong>12 loose cookies</strong> (10 + 2 = 12). Now you can easily give your friend 7 cookies, leaving 5 loose cookies!
              </p>
            </div>
          </div>
        </div>

        {/* 4 Step Rules */}
        <div className="space-y-4 my-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            The 4 Golden Steps of Regrouping:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 rounded-2xl border border-indigo-100 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-2 shadow-xs shadow-indigo-200">
                1
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Start in the Ones Column</h4>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Always check the right column first. Is the top digit smaller than the bottom? (e.g. 2 &lt; 7)
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-100 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center mb-2 shadow-xs shadow-amber-200">
                2
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Borrow from Tens</h4>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Cross out the Tens digit and decrease it by 1. (5 becomes 4). Write 4 above it.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50/70 to-pink-50/40 rounded-2xl border border-purple-100 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-black text-xs flex items-center justify-center mb-2 shadow-xs shadow-purple-200">
                3
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Give 10 to the Ones</h4>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Add 10 to the top ones digit (2 + 10 = 12). Write 12 in the top box.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-black text-xs flex items-center justify-center mb-2 shadow-xs shadow-emerald-200">
                4
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Subtract Each Column</h4>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Subtract the Ones (12 − 7 = 5), then subtract the Tens (4 − 2 = 2). Answer: 25!
              </p>
            </div>
          </div>
        </div>

        {/* Visual Place Value representation */}
        <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl border border-indigo-700/50 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-2xl text-amber-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Interactive Base-10 Blocks Included</div>
              <div className="text-xs text-indigo-200">Watch real 10-rods break apart into 10 single units on screen!</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-md shadow-amber-400/20 shrink-0 cursor-pointer active:scale-95"
          >
            Got it! Let's Practice
          </button>
        </div>
      </motion.div>
    </div>
  );
};

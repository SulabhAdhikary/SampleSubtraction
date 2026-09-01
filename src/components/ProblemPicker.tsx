/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Dices, Edit3, CheckCircle, ChevronDown, BookOpen, Play, Check } from 'lucide-react';
import { PRESET_LEVELS } from '../utils/stepGenerator';

interface ProblemPickerProps {
  currentTop: number;
  currentBottom: number;
  onSelectProblem: (top: number, bottom: number, title?: string) => void;
  isAutoDemo: boolean;
  onToggleAutoDemo: () => void;
}

export const ProblemPicker: React.FC<ProblemPickerProps> = ({
  currentTop,
  currentBottom,
  onSelectProblem,
  isAutoDemo,
  onToggleAutoDemo,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState('level-1');
  const [customTop, setCustomTop] = useState('62');
  const [customBottom, setCustomBottom] = useState('37');
  const [customError, setCustomError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'custom'>('levels');

  const currentLevel = PRESET_LEVELS.find((lvl) => lvl.id === selectedLevelId) || PRESET_LEVELS[0];

  const handleRandomProblem = () => {
    const problems = currentLevel.problems;
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    onSelectProblem(randomProblem.top, randomProblem.bottom, currentLevel.name);
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const top = parseInt(customTop, 10);
    const bottom = parseInt(customBottom, 10);

    if (isNaN(top) || isNaN(bottom)) {
      setCustomError('Please enter valid numbers');
      return;
    }

    if (top <= bottom) {
      setCustomError('Top number must be larger than bottom number for positive subtraction');
      return;
    }

    if (top > 999 || bottom > 999) {
      setCustomError('Numbers must be 3 digits or fewer (max 999)');
      return;
    }

    setCustomError(null);
    onSelectProblem(top, bottom, `Custom (${top} − ${bottom})`);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-xl bg-white/95 border border-indigo-100 rounded-3xl p-3 sm:p-4 shadow-md shadow-indigo-100/40 mb-4">
      <div className="flex items-center justify-between gap-2">
        {/* Current Problem Summary Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-50 to-indigo-50/40 hover:from-indigo-50 hover:to-indigo-100/50 border border-indigo-100 rounded-2xl text-left transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">Current Problem</div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {currentTop} − {currentBottom}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick Randomize Button */}
        <button
          type="button"
          onClick={handleRandomProblem}
          className="p-3 bg-gradient-to-br from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 rounded-2xl transition-all shadow-md shadow-amber-400/20 cursor-pointer shrink-0 active:scale-95"
          title="New Random Problem"
          aria-label="New Random Problem"
        >
          <Dices className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-indigo-100 animate-fadeIn">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-slate-100/90 p-1 mb-3.5">
            <button
              type="button"
              onClick={() => setActiveTab('levels')}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeTab === 'levels'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Curated Levels
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Custom Problem
            </button>
          </div>

          {activeTab === 'levels' ? (
            <div className="space-y-3">
              {/* Level Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevelId(lvl.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedLevelId === lvl.id
                        ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{lvl.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {lvl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">{lvl.description}</p>
                  </button>
                ))}
              </div>

              {/* Problem Quick Chips */}
              <div>
                <div className="text-xs font-extrabold text-slate-700 mb-2">Select a problem:</div>
                <div className="flex flex-wrap gap-2">
                  {currentLevel.problems.map((prob, idx) => {
                    const isSelected = prob.top === currentTop && prob.bottom === currentBottom;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onSelectProblem(prob.top, prob.bottom, currentLevel.name);
                          setIsOpen(false);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                            : 'bg-slate-50 hover:bg-indigo-50/80 text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {prob.top} − {prob.bottom}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Problem Creator */
            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top Number (Minuend)</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={customTop}
                    onChange={(e) => setCustomTop(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none"
                    placeholder="e.g. 74"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bottom Number (Subtrahend)</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={customBottom}
                    onChange={(e) => setCustomBottom(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none"
                    placeholder="e.g. 29"
                  />
                </div>
              </div>

              {customError && (
                <div className="text-xs text-rose-700 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {customError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Start Custom Problem</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

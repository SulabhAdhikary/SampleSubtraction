/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Layers, Box, Square } from 'lucide-react';
import { ColumnType } from '../types';

interface Base10Props {
  topNumber: number;
  bottomNumber: number;
  currentStepIndex: number;
  activeColumn: ColumnType;
  unbundleInfo?: { from: ColumnType; to: ColumnType } | null;
  tensCount: number;
  onesCount: number;
  hundredsCount: number;
  is3Digit: boolean;
  onesAnswerSubmitted: boolean;
  tensAnswerSubmitted: boolean;
  hundredsAnswerSubmitted: boolean;
  onesSubtrahend: number;
  tensSubtrahend: number;
  hundredsSubtrahend: number;
}

export const Base10Manipulatives: React.FC<Base10Props> = ({
  tensCount,
  onesCount,
  hundredsCount,
  is3Digit,
  activeColumn,
  unbundleInfo,
  onesAnswerSubmitted,
  tensAnswerSubmitted,
  hundredsAnswerSubmitted,
  onesSubtrahend,
  tensSubtrahend,
  hundredsSubtrahend,
}) => {
  return (
    <div className="bg-slate-900/90 text-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-100 flex items-center gap-2">
              Place Value Blocks (Base-10)
              {unbundleInfo && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Unbundling 1 Ten into 10 Ones!
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Watch how regrouping physically breaks apart blocks into 10 smaller units.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {is3Digit && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 border border-blue-400 inline-block"></span>
              <span>Hundreds (100)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-4 rounded bg-emerald-500 border border-emerald-400 inline-block"></span>
            <span>Tens (10)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-300 inline-block"></span>
            <span>Ones (1)</span>
          </div>
        </div>
      </div>

      {/* Columns Grid */}
      <div className={`grid gap-3 ${is3Digit ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Hundreds Column (if 3-digit) */}
        {is3Digit && (
          <div
            className={`rounded-xl p-3 border transition-all duration-300 flex flex-col ${
              activeColumn === 'hundreds'
                ? 'bg-blue-950/40 border-blue-500/80 ring-2 ring-blue-500/30'
                : 'bg-slate-800/40 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Square className="w-3.5 h-3.5" /> Hundreds
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {hundredsCount} Flat{hundredsCount !== 1 ? 's' : ''} ({hundredsCount * 100})
              </span>
            </div>

            <div className="flex-1 min-h-[110px] bg-slate-950/50 rounded-lg p-2 flex flex-wrap gap-2 items-center justify-center border border-slate-800/80">
              <AnimatePresence>
                {Array.from({ length: Math.max(0, hundredsCount) }).map((_, i) => {
                  const isSubtracted = hundredsAnswerSubmitted && i >= hundredsCount - hundredsSubtrahend;
                  return (
                    <motion.div
                      key={`hundred-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: isSubtracted ? 0.25 : 1 }}
                      exit={{ scale: 0.5, opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`relative w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-300/40 shadow-sm flex items-center justify-center ${
                        isSubtracted ? 'line-through grayscale' : ''
                      }`}
                      title="100 Block (Flat)"
                    >
                      <div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-9 h-9 opacity-40">
                        {Array.from({ length: 16 }).map((_, j) => (
                          <div key={j} className="bg-white/40 rounded-[1px]"></div>
                        ))}
                      </div>
                      <span className="absolute text-[10px] font-bold text-white drop-shadow">100</span>
                      {isSubtracted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {hundredsCount === 0 && (
                <div className="text-xs text-slate-500 italic py-4">0 Hundreds</div>
              )}
            </div>

            {hundredsAnswerSubmitted && (
              <div className="mt-2 text-center text-xs text-blue-300 bg-blue-900/30 py-1 rounded border border-blue-800">
                Left: <strong className="font-bold text-white">{hundredsCount - hundredsSubtrahend}</strong>
              </div>
            )}
          </div>
        )}

        {/* Tens Column */}
        <div
          className={`rounded-xl p-3 border transition-all duration-300 flex flex-col ${
            activeColumn === 'tens'
              ? 'bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/30'
              : 'bg-slate-800/40 border-slate-700/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Box className="w-3.5 h-3.5" /> Tens
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {tensCount} Rod{tensCount !== 1 ? 's' : ''} ({tensCount * 10})
            </span>
          </div>

          <div className="flex-1 min-h-[110px] bg-slate-950/50 rounded-lg p-2 flex flex-wrap gap-2 items-center justify-center border border-slate-800/80">
            <AnimatePresence>
              {Array.from({ length: Math.max(0, tensCount) }).map((_, i) => {
                const isSubtracted = tensAnswerSubmitted && i >= tensCount - tensSubtrahend;
                return (
                  <motion.div
                    key={`ten-${i}`}
                    initial={{ scale: 0, opacity: 0, x: -10 }}
                    animate={{ scale: 1, opacity: isSubtracted ? 0.25 : 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0, x: 30, rotate: 15 }}
                    transition={{ duration: 0.35 }}
                    className={`relative w-4 h-16 rounded bg-gradient-to-b from-emerald-400 to-teal-600 border border-emerald-300/40 shadow-sm flex flex-col justify-between p-0.5 ${
                      isSubtracted ? 'line-through grayscale' : ''
                    }`}
                    title="10 Rod"
                  >
                    {Array.from({ length: 9 }).map((_, j) => (
                      <div key={j} className="h-px bg-emerald-800/60 w-full"></div>
                    ))}
                    {isSubtracted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {tensCount === 0 && (
              <div className="text-xs text-slate-500 italic py-4">0 Tens</div>
            )}
          </div>

          {tensAnswerSubmitted && (
            <div className="mt-2 text-center text-xs text-emerald-300 bg-emerald-900/30 py-1 rounded border border-emerald-800">
              Left: <strong className="font-bold text-white">{tensCount - tensSubtrahend}</strong>
            </div>
          )}
        </div>

        {/* Ones Column */}
        <div
          className={`rounded-xl p-3 border transition-all duration-300 flex flex-col ${
            activeColumn === 'ones'
              ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30'
              : 'bg-slate-800/40 border-slate-700/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Ones
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {onesCount} Unit{onesCount !== 1 ? 's' : ''} ({onesCount})
            </span>
          </div>

          <div className="flex-1 min-h-[110px] bg-slate-950/50 rounded-lg p-2 flex flex-wrap gap-1.5 items-center justify-center content-center border border-slate-800/80">
            <AnimatePresence>
              {Array.from({ length: Math.max(0, onesCount) }).map((_, i) => {
                const isSubtracted = onesAnswerSubmitted && i >= onesCount - onesSubtrahend;
                const isNewFromRegroup = unbundleInfo?.to === 'ones' && i >= onesCount - 10;

                return (
                  <motion.div
                    key={`one-${i}`}
                    initial={{ scale: 0, opacity: 0, y: -15 }}
                    animate={{
                      scale: 1,
                      opacity: isSubtracted ? 0.25 : 1,
                      y: 0,
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: isNewFromRegroup ? (i % 10) * 0.04 : 0,
                    }}
                    className={`relative w-4 h-4 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200/50 shadow-sm flex items-center justify-center ${
                      isNewFromRegroup ? 'ring-1 ring-amber-300 animate-bounce' : ''
                    } ${isSubtracted ? 'grayscale' : ''}`}
                    title="1 Unit"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-100/50 rounded-[1px]"></div>
                    {isSubtracted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {onesCount === 0 && (
              <div className="text-xs text-slate-500 italic py-4">0 Units</div>
            )}
          </div>

          {onesAnswerSubmitted && (
            <div className="mt-2 text-center text-xs text-amber-300 bg-amber-900/30 py-1 rounded border border-amber-800">
              Left: <strong className="font-bold text-white">{onesCount - onesSubtrahend}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

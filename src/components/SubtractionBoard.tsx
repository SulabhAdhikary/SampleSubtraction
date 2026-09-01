/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Check, Sparkles, AlertCircle, ArrowDown, HelpCircle, Delete } from 'lucide-react';
import { ColumnType, StepDefinition } from '../types';

interface SubtractionBoardProps {
  topNumber: number;
  bottomNumber: number;
  currentStep: StepDefinition;
  is3Digit: boolean;
  
  // Scratchpad values (the rewritten regrouped values above)
  scratchHundreds: string;
  scratchTens: string;
  scratchOnes: string;
  
  // Crossed out states
  isHundredsCrossed: boolean;
  isTensCrossed: boolean;
  isOnesCrossed: boolean;
  
  // Answer values (in bottom answer row)
  answerHundreds: string;
  answerTens: string;
  answerOnes: string;

  // Active step inputs
  activeInputValue: string;
  onInputChange: (val: string) => void;
  onSubmitValue: (val: string) => void;
  onDonorCrossClick: (col: ColumnType) => void;
  inputError: string | null;
  
  // Quick hints
  onShowHint: () => void;
  isFinished: boolean;
}

export const SubtractionBoard: React.FC<SubtractionBoardProps> = ({
  topNumber,
  bottomNumber,
  currentStep,
  is3Digit,
  scratchHundreds,
  scratchTens,
  scratchOnes,
  isHundredsCrossed,
  isTensCrossed,
  isOnesCrossed,
  answerHundreds,
  answerTens,
  answerOnes,
  activeInputValue,
  onInputChange,
  onSubmitValue,
  onDonorCrossClick,
  inputError,
  onShowHint,
  isFinished,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Digits breakdown
  const onesTop = topNumber % 10;
  const onesBottom = bottomNumber % 10;
  const tensTop = Math.floor((topNumber % 100) / 10);
  const tensBottom = Math.floor((bottomNumber % 100) / 10);
  const hundredsTop = Math.floor(topNumber / 100);
  const hundredsBottom = Math.floor(bottomNumber / 100);

  // Determine active cell
  const isScratchHundredsActive = currentStep.column === 'hundreds' && currentStep.stepType === 'BORROW_INPUT_NEW_SOURCE';
  const isScratchTensActive =
    (currentStep.column === 'tens' && (currentStep.stepType === 'BORROW_INPUT_NEW_SOURCE' || currentStep.stepType === 'BORROW_INPUT_NEW_TARGET'));
  const isScratchOnesActive = currentStep.column === 'ones' && currentStep.stepType === 'BORROW_INPUT_NEW_TARGET';

  const isAnswerHundredsActive = currentStep.column === 'hundreds' && currentStep.stepType === 'SUBTRACT_COLUMN';
  const isAnswerTensActive = currentStep.column === 'tens' && currentStep.stepType === 'SUBTRACT_COLUMN';
  const isAnswerOnesActive = currentStep.column === 'ones' && currentStep.stepType === 'SUBTRACT_COLUMN';

  // Blinking donor states
  const isTensDonorBlinking =
    (currentStep.stepType === 'BORROW_CROSS_SOURCE' && currentStep.column === 'tens') ||
    (currentStep.stepType === 'CHECK_NEED_BORROW' && currentStep.donorColumn === 'tens');

  const isHundredsDonorBlinking =
    (currentStep.stepType === 'BORROW_CROSS_SOURCE' && currentStep.column === 'hundreds') ||
    (currentStep.stepType === 'CHECK_NEED_BORROW' && currentStep.donorColumn === 'hundreds');

  // Focus input automatically whenever active step changes
  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep.id, isFinished]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmitValue(activeInputValue);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (digit === 'del') {
      onInputChange('');
    } else if (digit === 'check') {
      onSubmitValue(activeInputValue);
    } else {
      // replace or append (for 2-digit values like 12 or 10)
      const next = activeInputValue.length >= 2 ? digit : activeInputValue + digit;
      onInputChange(next);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Math Problem Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100/50 border border-indigo-100 relative overflow-hidden">
        {/* Column Labels Header */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 pb-2 border-b border-indigo-100 text-center font-bold text-xs sm:text-sm tracking-wider uppercase">
          <div className="text-slate-400"></div>
          {is3Digit && (
            <div className={`p-1.5 rounded-xl font-black transition-colors ${currentStep.column === 'hundreds' ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-300' : 'text-slate-500'}`}>
              Hundreds (H)
            </div>
          )}
          {!is3Digit && <div></div>}
          <div className={`p-1.5 rounded-xl font-black transition-colors ${currentStep.column === 'tens' ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300' : 'text-slate-500'}`}>
            Tens (T)
          </div>
          <div className={`p-1.5 rounded-xl font-black transition-colors ${currentStep.column === 'ones' ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300' : 'text-slate-500'}`}>
            Ones (O)
          </div>
        </div>

        {/* MATH VERTICAL COLUMN LAYOUT */}
        <div className="space-y-3 sm:space-y-4">
          {/* ROW 1: REGROUP / SCRATCHPAD ROW (Above the original top numbers) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
            <div className="text-right text-xs font-bold text-indigo-500 flex items-center justify-end gap-1">
              <span className="hidden sm:inline">Regroup</span>
            </div>

            {/* Hundreds Scratchpad Box */}
            {is3Digit ? (
              <div className="flex justify-center">
                {isScratchHundredsActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="relative"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={activeInputValue}
                      onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={handleKeyDown}
                      placeholder="?"
                      aria-label="New Hundreds value"
                      className="w-12 h-11 sm:w-14 sm:h-13 text-center text-xl sm:text-2xl font-black text-blue-700 bg-blue-50 border-2 border-blue-500 rounded-2xl shadow-md shadow-blue-200 ring-4 ring-blue-200 outline-none"
                    />
                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow animate-bounce">
                      Type!
                    </div>
                  </motion.div>
                ) : scratchHundreds ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-11 h-10 sm:w-13 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-black text-blue-600 bg-blue-50 border border-blue-300 rounded-2xl shadow-xs"
                  >
                    {scratchHundreds}
                  </motion.div>
                ) : (
                  <div className="w-11 h-10 sm:w-13 sm:h-12 rounded-2xl border-2 border-dashed border-indigo-100 bg-slate-50/50 flex items-center justify-center text-slate-300 text-xs">
                    -
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}

            {/* Tens Scratchpad Box */}
            <div className="flex justify-center">
              {isScratchTensActive ? (
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="relative"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={activeInputValue}
                    onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder="?"
                    aria-label="New Tens value"
                    className="w-12 h-11 sm:w-14 sm:h-13 text-center text-xl sm:text-2xl font-black text-emerald-700 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-md shadow-emerald-200 ring-4 ring-emerald-200 outline-none"
                  />
                  <div className="absolute -top-3 -right-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow animate-bounce">
                    Type!
                  </div>
                </motion.div>
              ) : scratchTens ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-11 h-10 sm:w-13 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-black text-emerald-600 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-xs"
                >
                  {scratchTens}
                </motion.div>
              ) : (
                <div className="w-11 h-10 sm:w-13 sm:h-12 rounded-2xl border-2 border-dashed border-indigo-100 bg-slate-50/50 flex items-center justify-center text-slate-300 text-xs">
                  -
                </div>
              )}
            </div>

            {/* Ones Scratchpad Box */}
            <div className="flex justify-center">
              {isScratchOnesActive ? (
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="relative"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={activeInputValue}
                    onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder="?"
                    aria-label="New Ones value"
                    className="w-12 h-11 sm:w-14 sm:h-13 text-center text-xl sm:text-2xl font-black text-amber-700 bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-md shadow-amber-200 ring-4 ring-amber-200 outline-none"
                  />
                  <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow animate-bounce">
                    Type!
                  </div>
                </motion.div>
              ) : scratchOnes ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-11 h-10 sm:w-13 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-black text-amber-600 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs"
                >
                  {scratchOnes}
                </motion.div>
              ) : (
                <div className="w-11 h-10 sm:w-13 sm:h-12 rounded-2xl border-2 border-dashed border-indigo-100 bg-slate-50/50 flex items-center justify-center text-slate-300 text-xs">
                  -
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: TOP MINUEND DIGITS */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
            <div className="text-right text-xs font-semibold text-slate-400">
              <span className="hidden sm:inline">Top</span>
            </div>

            {/* Hundreds Top Digit */}
            {is3Digit ? (
              <div className="flex justify-center">
                <div
                  onClick={() => isHundredsDonorBlinking && onDonorCrossClick('hundreds')}
                  className={`relative w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold rounded-2xl transition-all duration-300 select-none ${
                    isHundredsCrossed
                      ? 'text-slate-400 bg-slate-100'
                      : isHundredsDonorBlinking
                      ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 ring-4 ring-amber-300 cursor-pointer animate-pulse scale-105 shadow-md shadow-amber-200'
                      : 'text-slate-900 bg-slate-50/80 border border-indigo-100/80'
                  }`}
                  role={isHundredsDonorBlinking ? 'button' : undefined}
                  tabIndex={isHundredsDonorBlinking ? 0 : undefined}
                >
                  <span>{hundredsTop}</span>

                  {/* Diagonal Strike-through for Crossed out */}
                  {isHundredsCrossed && (
                    <motion.div
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-4/5 h-1 bg-red-500 rounded-full rotate-45 transform origin-center shadow-sm"></div>
                    </motion.div>
                  )}

                  {/* Blinking Callout Badge */}
                  {isHundredsDonorBlinking && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute -top-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap"
                    >
                      Borrow From!
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div></div>
            )}

            {/* Tens Top Digit */}
            <div className="flex justify-center">
              <div
                onClick={() => isTensDonorBlinking && onDonorCrossClick('tens')}
                className={`relative w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold rounded-2xl transition-all duration-300 select-none ${
                  isTensCrossed
                    ? 'text-slate-400 bg-slate-100'
                    : isTensDonorBlinking
                    ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 ring-4 ring-amber-300 cursor-pointer animate-pulse scale-105 shadow-md shadow-amber-200'
                    : 'text-slate-900 bg-slate-50/80 border border-indigo-100/80'
                }`}
                role={isTensDonorBlinking ? 'button' : undefined}
                tabIndex={isTensDonorBlinking ? 0 : undefined}
              >
                <span>{tensTop}</span>

                {/* Diagonal Strike-through */}
                {isTensCrossed && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-4/5 h-1 bg-red-500 rounded-full rotate-45 transform origin-center shadow-sm"></div>
                  </motion.div>
                )}

                {/* Blinking Callout Badge */}
                {isTensDonorBlinking && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute -top-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap"
                  >
                    Borrow From!
                  </motion.div>
                )}
              </div>
            </div>

            {/* Ones Top Digit */}
            <div className="flex justify-center">
              <div
                className={`relative w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold rounded-2xl transition-all duration-300 select-none ${
                  isOnesCrossed
                    ? 'text-slate-400 bg-slate-100'
                    : currentStep.column === 'ones' && currentStep.stepType === 'CHECK_NEED_BORROW'
                    ? 'bg-amber-50 text-amber-950 border-2 border-amber-400 shadow-xs'
                    : 'text-slate-900 bg-slate-50/80 border border-indigo-100/80'
                }`}
              >
                <span>{onesTop}</span>

                {/* Diagonal Strike-through */}
                {isOnesCrossed && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-4/5 h-1 bg-red-500 rounded-full rotate-45 transform origin-center shadow-sm"></div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* ROW 3: BOTTOM SUBTRAHEND DIGITS (with Minus Sign) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
            {/* Minus Sign */}
            <div className="text-right text-3xl sm:text-4xl font-black text-rose-500 pr-2">
              −
            </div>

            {/* Hundreds Bottom */}
            {is3Digit ? (
              <div className="flex justify-center">
                <div className="w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-slate-700 bg-slate-100/80 border border-slate-200 rounded-2xl">
                  {hundredsBottom}
                </div>
              </div>
            ) : (
              <div></div>
            )}

            {/* Tens Bottom */}
            <div className="flex justify-center">
              <div className="w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-slate-700 bg-slate-100/80 border border-slate-200 rounded-2xl">
                {tensBottom}
              </div>
            </div>

            {/* Ones Bottom */}
            <div className="flex justify-center">
              <div className="w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-slate-700 bg-slate-100/80 border border-slate-200 rounded-2xl">
                {onesBottom}
              </div>
            </div>
          </div>

          {/* EQUAL BAR DIVIDER */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full my-2 sm:my-3"></div>

          {/* ROW 4: ANSWER ROW (State-Locked) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
            <div className="text-right text-xs font-bold text-slate-500">
              <span className="hidden sm:inline">Answer =</span>
            </div>

            {/* Hundreds Answer Box */}
            {is3Digit ? (
              <div className="flex justify-center">
                {isAnswerHundredsActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="relative"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={activeInputValue}
                      onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={handleKeyDown}
                      placeholder="?"
                      aria-label="Hundreds difference answer"
                      className="w-14 h-16 sm:w-18 sm:h-20 text-center text-3xl sm:text-4xl font-extrabold text-blue-700 bg-blue-50 border-3 border-blue-500 rounded-2xl shadow-lg shadow-blue-200 ring-4 ring-blue-200 outline-none"
                    />
                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      Subtract!
                    </div>
                  </motion.div>
                ) : answerHundreds ? (
                  <div className="w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-black text-emerald-700 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm">
                    {answerHundreds}
                  </div>
                ) : (
                  <div className="w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-2 border-dashed border-indigo-100 bg-slate-50 flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <Lock className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] mt-0.5 font-semibold">Locked</span>
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}

            {/* Tens Answer Box */}
            <div className="flex justify-center">
              {isAnswerTensActive ? (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="relative"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={activeInputValue}
                    onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder="?"
                    aria-label="Tens difference answer"
                    className="w-14 h-16 sm:w-18 sm:h-20 text-center text-3xl sm:text-4xl font-extrabold text-emerald-700 bg-emerald-50 border-3 border-emerald-500 rounded-2xl shadow-lg shadow-emerald-200 ring-4 ring-emerald-200 outline-none"
                  />
                  <div className="absolute -top-3 -right-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Subtract!
                  </div>
                </motion.div>
              ) : answerTens ? (
                <div className="w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-black text-emerald-700 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm">
                  {answerTens}
                </div>
              ) : (
                <div className="w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-2 border-dashed border-indigo-100 bg-slate-50 flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <Lock className="w-4 h-4 text-slate-300" />
                  <span className="text-[10px] mt-0.5 font-semibold">Locked</span>
                </div>
              )}
            </div>

            {/* Ones Answer Box */}
            <div className="flex justify-center">
              {isAnswerOnesActive ? (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="relative"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={activeInputValue}
                    onChange={(e) => onInputChange(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder="?"
                    aria-label="Ones difference answer"
                    className="w-14 h-16 sm:w-18 sm:h-20 text-center text-3xl sm:text-4xl font-extrabold text-amber-700 bg-amber-50 border-3 border-amber-500 rounded-2xl shadow-lg shadow-amber-200 ring-4 ring-amber-200 outline-none"
                  />
                  <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Subtract!
                  </div>
                </motion.div>
              ) : answerOnes ? (
                <div className="w-14 h-16 sm:w-18 sm:h-20 flex items-center justify-center text-3xl sm:text-4xl font-black text-emerald-700 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm">
                  {answerOnes}
                </div>
              ) : (
                <div className="w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-2 border-dashed border-indigo-100 bg-slate-50 flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <Lock className="w-4 h-4 text-slate-300" />
                  <span className="text-[10px] mt-0.5 font-semibold">Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Error Message Shake Banner */}
        <AnimatePresence>
          {inputError && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{inputError}</span>
              </div>
              <button
                type="button"
                onClick={onShowHint}
                className="shrink-0 underline text-rose-800 font-bold hover:text-rose-950 text-xs"
              >
                Show Hint
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ON-SCREEN CHILD KEYPAD (Touch & Click Friendly) */}
      {!isFinished && (
        <div className="w-full max-w-xl mt-4 bg-white/95 border border-indigo-100 rounded-3xl p-3.5 sm:p-4 shadow-md shadow-indigo-100/40">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-black text-indigo-900 uppercase tracking-wider">
              Touch Keypad
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Or use your keyboard / numpad
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="h-11 sm:h-12 bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 border border-slate-200 hover:border-indigo-300 rounded-2xl text-lg sm:text-xl font-black text-slate-800 shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {digit}
              </button>
            ))}

            {/* Clear / Delete */}
            <button
              type="button"
              onClick={() => handleKeypadPress('del')}
              className="h-11 sm:h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              title="Clear"
            >
              <Delete className="w-4 h-4" />
            </button>

            {/* Submit / Next Button */}
            <button
              type="button"
              onClick={() => handleKeypadPress('check')}
              className="h-11 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:from-emerald-700 active:to-teal-800 text-white rounded-2xl text-sm font-black shadow-md shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              title="Check Answer"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  Volume2,
  VolumeX,
  Smile,
  HelpCircle,
  Play,
  Pause,
  Award,
  Layers,
  BarChart2,
  CheckCircle,
} from 'lucide-react';

import { ColumnType, StepDefinition } from './types';
import { generateStepsForProblem, PRESET_LEVELS } from './utils/stepGenerator';
import { soundManager } from './utils/audio';
import { SubtractionBoard } from './components/SubtractionBoard';
import { Base10Manipulatives } from './components/Base10Manipulatives';
import { CoachBar } from './components/CoachBar';
import { ProblemPicker } from './components/ProblemPicker';
import { ConceptTutorialModal } from './components/ConceptTutorialModal';

export default function App() {
  // Current problem configuration
  const [topNumber, setTopNumber] = useState<number>(52);
  const [bottomNumber, setBottomNumber] = useState<number>(27);
  const [problemTitle, setProblemTitle] = useState<string>('Level 1: 2-Digit Regrouping');

  // Steps Engine
  const [steps, setSteps] = useState<StepDefinition[]>(() => generateStepsForProblem(52, 27));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Scratchpad values (the rewritten regroup numbers above)
  const [scratchHundreds, setScratchHundreds] = useState<string>('');
  const [scratchTens, setScratchTens] = useState<string>('');
  const [scratchOnes, setScratchOnes] = useState<string>('');

  // Strike-through crossed states
  const [isHundredsCrossed, setIsHundredsCrossed] = useState<boolean>(false);
  const [isTensCrossed, setIsTensCrossed] = useState<boolean>(false);
  const [isOnesCrossed, setIsOnesCrossed] = useState<boolean>(false);

  // Answer values (in bottom answer row)
  const [answerHundreds, setAnswerHundreds] = useState<string>('');
  const [answerTens, setAnswerTens] = useState<string>('');
  const [answerOnes, setAnswerOnes] = useState<string>('');

  // Active Input Box state
  const [activeInputValue, setActiveInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Base-10 Manipulatives Counts
  const [hundredsCount, setHundredsCount] = useState<number>(() => Math.floor(52 / 100));
  const [tensCount, setTensCount] = useState<number>(() => Math.floor((52 % 100) / 10));
  const [onesCount, setOnesCount] = useState<number>(() => 52 % 10);
  const [unbundleInfo, setUnbundleInfo] = useState<{ from: ColumnType; to: ColumnType } | null>(null);

  // Settings & Audio
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showManipulatives, setShowManipulatives] = useState<boolean>(true);

  // Stats & Streaks
  const [streak, setStreak] = useState<number>(0);
  const [totalSolved, setTotalSolved] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);

  // Auto-Demo State
  const [isAutoDemo, setIsAutoDemo] = useState<boolean>(false);
  const autoDemoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const is3Digit = topNumber >= 100 || bottomNumber >= 100;
  const currentStep = steps[currentStepIndex] || steps[steps.length - 1];
  const isFinished = currentStepIndex >= steps.length - 1;

  // Subtrahend digit breakdown for base-10 strikethrough visual
  const onesSubtrahend = bottomNumber % 10;
  const tensSubtrahend = Math.floor((bottomNumber % 100) / 10);
  const hundredsSubtrahend = Math.floor(bottomNumber / 100);

  // Initialize/Reset problem
  const loadProblem = useCallback((top: number, bottom: number, title?: string) => {
    setTopNumber(top);
    setBottomNumber(bottom);
    if (title) setProblemTitle(title);

    const newSteps = generateStepsForProblem(top, bottom);
    setSteps(newSteps);
    setCurrentStepIndex(0);

    setScratchHundreds('');
    setScratchTens('');
    setScratchOnes('');

    setIsHundredsCrossed(false);
    setIsTensCrossed(false);
    setIsOnesCrossed(false);

    setAnswerHundreds('');
    setAnswerTens('');
    setAnswerOnes('');

    setActiveInputValue('');
    setInputError(null);
    setUnbundleInfo(null);

    setHundredsCount(Math.floor(top / 100));
    setTensCount(Math.floor((top % 100) / 10));
    setOnesCount(top % 10);

    // Speak initial step instruction
    if (newSteps.length > 0) {
      setTimeout(() => {
        soundManager.speakNarration(newSteps[0].speechText || newSteps[0].instruction);
      }, 200);
    }
  }, []);

  // Voice narration whenever step changes
  useEffect(() => {
    if (!isFinished && currentStep) {
      soundManager.speakNarration(currentStep.speechText || currentStep.instruction);
    }
  }, [currentStepIndex, currentStep, isFinished]);

  // Audio mute sync
  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    soundManager.isSoundMuted = next;
  };

  const toggleVoice = () => {
    const next = !isVoiceMuted;
    setIsVoiceMuted(next);
    soundManager.isVoiceMuted = next;
    if (next) soundManager.stopSpeech();
  };

  // Trigger Confetti on completion
  const triggerCelebration = () => {
    soundManager.playVictorySound();
    setStreak((s) => s + 1);
    setTotalSolved((t) => t + 1);
    setStars((st) => st + 3);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  // Next Problem handler
  const handleNextProblem = () => {
    // Generate next from current level or random
    const allPresets = PRESET_LEVELS.flatMap((lvl) => lvl.problems);
    const random = allPresets[Math.floor(Math.random() * allPresets.length)];
    loadProblem(random.top, random.bottom);
  };

  // Handle donor cross click (e.g. clicking the blinking 5 in tens column)
  const handleDonorCrossClick = (col: ColumnType) => {
    if (currentStep.stepType === 'CHECK_NEED_BORROW' || currentStep.stepType === 'BORROW_CROSS_SOURCE') {
      if (col === 'tens') {
        setIsTensCrossed(true);
        soundManager.playBorrowSound();
        setInputError(null);

        // Advance to inputting new value
        if (currentStep.stepType === 'CHECK_NEED_BORROW') {
          // If in CHECK_NEED_BORROW, step to the cross/input step
          const nextIdx = currentStepIndex + 2; // to input tens
          setCurrentStepIndex(Math.min(nextIdx, steps.length - 1));
        } else {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (col === 'hundreds') {
        setIsHundredsCrossed(true);
        soundManager.playBorrowSound();
        setInputError(null);
        setCurrentStepIndex((prev) => prev + 1);
      }
    }
  };

  // Submit and validate user's input value for the current locked step
  const handleInputSubmit = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setInputError('Please enter a number');
      soundManager.playErrorSound();
      return;
    }

    const numVal = parseInt(trimmed, 10);
    const expected = currentStep.expectedValue;

    if (expected !== undefined && numVal !== expected) {
      soundManager.playErrorSound();
      setInputError(`Not quite! Expected ${expected}. Check the hint for help.`);
      return;
    }

    // SUCCESS: Apply changes based on step type
    soundManager.playCorrectSound();
    setInputError(null);
    setActiveInputValue('');

    const stepType = currentStep.stepType;
    const col = currentStep.column;

    if (stepType === 'BORROW_INPUT_NEW_SOURCE') {
      if (col === 'tens') {
        setScratchTens(trimmed);
        setIsTensCrossed(true);
        setTensCount((c) => Math.max(0, c - 1));
      } else if (col === 'hundreds') {
        setScratchHundreds(trimmed);
        setIsHundredsCrossed(true);
        setHundredsCount((c) => Math.max(0, c - 1));
      }
    } else if (stepType === 'BORROW_INPUT_NEW_TARGET') {
      if (col === 'ones') {
        setScratchOnes(trimmed);
        setIsOnesCrossed(true);
        setOnesCount((c) => c + 10);
        soundManager.playBorrowSound();
        setUnbundleInfo({ from: 'tens', to: 'ones' });
        setTimeout(() => setUnbundleInfo(null), 1800);
      } else if (col === 'tens') {
        setScratchTens(trimmed);
        setIsTensCrossed(true);
        setTensCount((c) => c + 10);
        soundManager.playBorrowSound();
        setUnbundleInfo({ from: 'hundreds', to: 'tens' });
        setTimeout(() => setUnbundleInfo(null), 1800);
      }
    } else if (stepType === 'SUBTRACT_COLUMN') {
      if (col === 'ones') {
        setAnswerOnes(trimmed);
      } else if (col === 'tens') {
        setAnswerTens(trimmed);
      } else if (col === 'hundreds') {
        setAnswerHundreds(trimmed);
      }
    }

    // Check if next step is final completion
    if (currentStepIndex + 1 >= steps.length - 1) {
      setCurrentStepIndex(steps.length - 1);
      triggerCelebration();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Show Hint helper
  const handleShowHint = () => {
    if (currentStep.hint) {
      soundManager.speakNarration(currentStep.hint);
    }
  };

  // Auto Demo loop
  useEffect(() => {
    if (isAutoDemo && !isFinished) {
      autoDemoTimerRef.current = setTimeout(() => {
        if (currentStep.stepType === 'CHECK_NEED_BORROW') {
          setCurrentStepIndex((p) => p + 1);
        } else if (currentStep.stepType === 'BORROW_CROSS_SOURCE') {
          handleDonorCrossClick(currentStep.column);
        } else if (currentStep.expectedValue !== undefined) {
          handleInputSubmit(String(currentStep.expectedValue));
        }
      }, 1600);
    }

    return () => {
      if (autoDemoTimerRef.current) clearTimeout(autoDemoTimerRef.current);
    };
  }, [isAutoDemo, currentStepIndex, isFinished]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50 text-slate-800 flex flex-col font-sans selection:bg-amber-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-indigo-100 shadow-sm shadow-indigo-100/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200">
              −
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
                Regrouping Subtraction
              </h1>
              <div className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Step-by-Step Borrowing Tutor</span>
              </div>
            </div>
          </div>

          {/* Gamification Badges & Toggles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-800 font-bold text-xs shadow-xs">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{streak} Streak</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-900 font-bold text-xs shadow-xs">
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span>{stars} Stars</span>
            </div>

            {/* Reset Current */}
            <button
              type="button"
              onClick={() => loadProblem(topNumber, bottomNumber, problemTitle)}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs cursor-pointer"
              title="Reset current problem"
              aria-label="Reset current problem"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Manipulatives View Toggle */}
            <button
              type="button"
              onClick={() => setShowManipulatives(!showManipulatives)}
              className={`p-2 rounded-xl border transition-all shadow-xs cursor-pointer ${
                showManipulatives
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title={showManipulatives ? 'Hide Base-10 Blocks' : 'Show Base-10 Blocks'}
              aria-label="Toggle base 10 blocks"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
        {/* Level & Problem Selector */}
        <ProblemPicker
          currentTop={topNumber}
          currentBottom={bottomNumber}
          onSelectProblem={loadProblem}
          isAutoDemo={isAutoDemo}
          onToggleAutoDemo={() => setIsAutoDemo(!isAutoDemo)}
        />

        {/* Two-Column Responsive Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start justify-center">
          {/* LEFT COLUMN: Subtraction Board & Input Keypad (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-center gap-4">
            <SubtractionBoard
              topNumber={topNumber}
              bottomNumber={bottomNumber}
              currentStep={currentStep}
              is3Digit={is3Digit}
              scratchHundreds={scratchHundreds}
              scratchTens={scratchTens}
              scratchOnes={scratchOnes}
              isHundredsCrossed={isHundredsCrossed}
              isTensCrossed={isTensCrossed}
              isOnesCrossed={isOnesCrossed}
              answerHundreds={answerHundreds}
              answerTens={answerTens}
              answerOnes={answerOnes}
              activeInputValue={activeInputValue}
              onInputChange={setActiveInputValue}
              onSubmitValue={handleInputSubmit}
              onDonorCrossClick={handleDonorCrossClick}
              inputError={inputError}
              onShowHint={handleShowHint}
              isFinished={isFinished}
            />
          </div>

          {/* RIGHT COLUMN: Coach Guidance Bar & Base-10 Manipulatives (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Step Coach Guidance Card */}
            <CoachBar
              currentStep={currentStep}
              stepIndex={currentStepIndex}
              totalSteps={steps.length}
              onShowHint={handleShowHint}
              onNextProblem={handleNextProblem}
              isSoundMuted={isSoundMuted}
              onToggleSound={toggleSound}
              isVoiceMuted={isVoiceMuted}
              onToggleVoice={toggleVoice}
              onShowTutorial={() => setShowTutorial(true)}
              isFinished={isFinished}
            />

            {/* Auto-Demo Helper Banner */}
            <div className="bg-white/95 border border-indigo-100 rounded-2xl p-3 shadow-md shadow-indigo-100/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Auto-Solve Demo</span>
                <span className="text-[11px] text-slate-500 font-medium">Watch the steps solved automatically</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoDemo(!isAutoDemo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isAutoDemo
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isAutoDemo ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Demo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Play Demo</span>
                  </>
                )}
              </button>
            </div>

            {/* Base-10 Visual Manipulatives Mat */}
            {showManipulatives && (
              <Base10Manipulatives
                topNumber={topNumber}
                bottomNumber={bottomNumber}
                currentStepIndex={currentStepIndex}
                activeColumn={currentStep.column}
                unbundleInfo={unbundleInfo}
                hundredsCount={hundredsCount}
                tensCount={tensCount}
                onesCount={onesCount}
                is3Digit={is3Digit}
                onesAnswerSubmitted={!!answerOnes}
                tensAnswerSubmitted={!!answerTens}
                hundredsAnswerSubmitted={!!answerHundreds}
                onesSubtrahend={onesSubtrahend}
                tensSubtrahend={tensSubtrahend}
                hundredsSubtrahend={hundredsSubtrahend}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-100 bg-white/70 backdrop-blur-xs py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">Step-by-Step Regrouping (Borrowing) Subtraction Tutor</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer transition-colors"
            >
              Why Borrowing Works (Cookie Box Rule)
            </button>
            <span className="font-semibold text-slate-700">Total Solved: {totalSolved}</span>
          </div>
        </div>
      </footer>

      {/* Concept & Tutorial Modal */}
      <ConceptTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}

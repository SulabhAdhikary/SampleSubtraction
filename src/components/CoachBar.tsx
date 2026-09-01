/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Award,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { StepDefinition } from '../types';
import { soundManager, VoiceName } from '../utils/audio';

interface CoachBarProps {
  currentStep: StepDefinition;
  stepIndex: number;
  totalSteps: number;
  onShowHint: () => void;
  onNextProblem: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  isVoiceMuted: boolean;
  onToggleVoice: () => void;
  onShowTutorial: () => void;
  isFinished: boolean;
}

export const CoachBar: React.FC<CoachBarProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  onShowHint,
  onNextProblem,
  isVoiceMuted,
  onToggleVoice,
  onShowTutorial,
  isFinished,
}) => {
  const [hintShown, setHintShown] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<VoiceName>(soundManager.selectedVoice);
  const [currentSpeed, setCurrentSpeed] = useState<number>(soundManager.speechSpeed);
  const [isSpeakingState, setIsSpeakingState] = useState(false);

  const handleSpeak = () => {
    setIsSpeakingState(true);
    soundManager.speakNarration(
      currentStep.speechText || currentStep.instruction,
      () => setIsSpeakingState(false)
    );
  };

  const handleHintClick = () => {
    setHintShown(true);
    onShowHint();
  };

  // Update voice settings
  const handleSelectVoice = (v: VoiceName) => {
    setCurrentVoice(v);
    soundManager.setVoice(v);
    soundManager.speakNarration(`Hi! I am ${v}, your math tutor. Let's solve this together!`);
  };

  const handleSelectSpeed = (s: number) => {
    setCurrentSpeed(s);
    soundManager.setSpeed(s);
    soundManager.speakNarration(`Voice pace set to ${s <= 0.8 ? 'slow and clear' : 'normal'}.`);
  };

  // Reset hint on new step
  useEffect(() => {
    setHintShown(false);
  }, [currentStep.id]);

  return (
    <div className="w-full max-w-xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-5 shadow-xl shadow-indigo-950/30 border border-indigo-500/40">
      {/* Top Header: Progress & Audio Controls */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-indigo-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
            {isFinished ? <Award className="w-5 h-5 text-slate-950" /> : stepIndex + 1}
          </div>
          <div>
            <div className="text-[11px] uppercase font-extrabold text-indigo-300 tracking-wider">
              {isFinished ? 'Complete!' : `Step ${stepIndex + 1} of ${totalSteps}`}
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              {currentStep.title}
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1.5">
          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={handleSpeak}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              isSpeakingState
                ? 'bg-emerald-500 border-emerald-400 text-slate-950 animate-pulse'
                : 'bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 hover:text-white border-indigo-600/40'
            }`}
            title="Read instruction aloud with Ursa voice"
            aria-label="Read instruction aloud with Ursa voice"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Voice Settings Pill */}
          <button
            type="button"
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-[11px] font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Ursa Voice & Speed Settings"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>{currentVoice} ({currentSpeed}x)</span>
          </button>

          {/* Mute Voice Toggle */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-xs ${
              isVoiceMuted
                ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                : 'bg-indigo-800/80 border-indigo-500/50 text-indigo-100 hover:text-white'
            }`}
            title={isVoiceMuted ? 'Voice is Muted (Click to Unmute)' : 'Voice is Active'}
            aria-label="Toggle voice narration"
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Concept Guide Button */}
          <button
            type="button"
            onClick={onShowTutorial}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-xs font-bold text-indigo-100 hover:text-white flex items-center gap-1 transition-colors cursor-pointer border border-indigo-600/50 shadow-xs"
            title="Why do we borrow?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Concept</span>
          </button>
        </div>
      </div>

      {/* Voice Settings Drawer */}
      <AnimatePresence>
        {showVoiceSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-950/90 border border-amber-400/30 rounded-2xl p-3 mb-3 text-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[10px]">
                Voice Narration Settings
              </span>
              <span className="text-[10px] text-indigo-300 font-medium">Gemini 3.1 Flash Audio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Voice Choice */}
              <div>
                <span className="block text-[11px] font-bold text-indigo-200 mb-1">Voice Character:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {(['Ursa', 'Kore', 'Aoede', 'Zephyr'] as VoiceName[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleSelectVoice(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                        currentVoice === v
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                          : 'bg-indigo-900/60 text-indigo-200 border-indigo-700 hover:bg-indigo-800'
                      }`}
                    >
                      {v === 'Ursa' ? '🐻 Ursa (Warm)' : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Choice */}
              <div>
                <span className="block text-[11px] font-bold text-indigo-200 mb-1">Reading Pace:</span>
                <div className="flex gap-1.5">
                  {[
                    { label: '0.75x (Slow)', value: 0.75 },
                    { label: '0.85x (Gentle)', value: 0.85 },
                    { label: '1.0x (Normal)', value: 1.0 },
                  ].map((spd) => (
                    <button
                      key={spd.value}
                      type="button"
                      onClick={() => handleSelectSpeed(spd.value)}
                      className={`px-2 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                        currentSpeed === spd.value
                          ? 'bg-emerald-400 text-slate-950 border-emerald-400 shadow-xs'
                          : 'bg-indigo-900/60 text-indigo-200 border-indigo-700 hover:bg-indigo-800'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="w-full bg-slate-900/80 rounded-full h-2.5 mb-4 overflow-hidden flex gap-1 p-0.5 border border-indigo-900/50">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-full rounded-full transition-all duration-300 ${
              idx < stepIndex
                ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                : idx === stepIndex
                ? 'bg-amber-400 animate-pulse shadow-xs shadow-amber-400/50'
                : 'bg-slate-800'
            }`}
          ></div>
        ))}
      </div>

      {/* Coach Message Bubble */}
      <div className="bg-indigo-950/80 border border-indigo-600/40 rounded-2xl p-4 relative shadow-inner">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-400 text-slate-950 rounded-2xl font-black shrink-0 shadow-md">
            {isFinished ? '🌟' : '🐻'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider">
                Ursa Tutor Voice
              </span>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/80 px-2 py-0.5 rounded-full border border-indigo-700/50">
                Pace: {currentSpeed}x
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-indigo-50 leading-relaxed">
              {currentStep.instruction}
            </p>

            <AnimatePresence>
              {hintShown && currentStep.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2.5 pt-2.5 border-t border-indigo-800/80 text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Hint: {currentStep.hint}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3.5 flex items-center justify-between gap-2">
        {!isFinished ? (
          <>
            <button
              type="button"
              onClick={handleHintClick}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Need a Hint?</span>
            </button>

            <div className="text-xs text-indigo-200 font-semibold italic">
              {currentStep.stepType.includes('BORROW')
                ? 'Regrouping is in progress...'
                : currentStep.stepType === 'CHECK_NEED_BORROW'
                ? 'Check column digits'
                : 'Enter your answer'}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onNextProblem}
            className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-600 active:to-teal-600 text-slate-950 font-black rounded-2xl text-base shadow-lg shadow-emerald-500/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Next Problem!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ColumnType = 'ones' | 'tens' | 'hundreds';

export type SubtractionStepType =
  | 'CHECK_NEED_BORROW'       // "Is top < bottom? Do we need to borrow?"
  | 'BORROW_CROSS_SOURCE'     // "Click or cross out the donor column (e.g. Tens)"
  | 'BORROW_INPUT_NEW_SOURCE' // "Enter new value for donor column (e.g. 5 -> 4)"
  | 'BORROW_CROSS_TARGET'     // "Cross out target column (e.g. Ones)"
  | 'BORROW_INPUT_NEW_TARGET' // "Enter new value for target column (e.g. 2 + 10 = 12)"
  | 'SUBTRACT_COLUMN'         // "Subtract top - bottom for current column (e.g. 12 - 7 = 5)"
  | 'COMPLETED';              // "Problem complete!"

export interface StepDefinition {
  id: string;
  column: ColumnType;
  stepType: SubtractionStepType;
  title: string;
  instruction: string;
  hint: string;
  speechText: string;
  expectedValue?: number | string;
  donorColumn?: ColumnType;
  targetColumn?: ColumnType;
  unbundleAnimation?: {
    from: ColumnType;
    to: ColumnType;
  };
}

export interface ProblemConfig {
  topNumber: number;
  bottomNumber: number;
  id?: string;
  title?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'across-zero' | 'custom';
}

export interface ColumnState {
  originalTop: number;
  currentTop: number;
  bottom: number;
  isCrossedOut: boolean;
  regroupedValue: number | null; // value written in top scratchpad
  answerValue: number | null;    // value written in bottom answer
  needsBorrow: boolean;
  isSourceDonor: boolean;        // was borrowed from
  isTargetReceiver: boolean;     // received 10
}

export interface ProblemSessionState {
  config: ProblemConfig;
  columns: {
    hundreds?: ColumnState;
    tens: ColumnState;
    ones: ColumnState;
  };
  steps: StepDefinition[];
  currentStepIndex: number;
  isFinished: boolean;
  mistakesCount: number;
  hintsUsedCount: number;
  startTime: number;
}

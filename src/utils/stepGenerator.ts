/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColumnType, ProblemConfig, StepDefinition } from '../types';

export function generateStepsForProblem(topNum: number, bottomNum: number): StepDefinition[] {
  const steps: StepDefinition[] = [];
  const is3Digit = topNum >= 100 || bottomNum >= 100;

  // Digits extraction
  const onesTop = topNum % 10;
  const onesBottom = bottomNum % 10;
  
  const tensTop = Math.floor((topNum % 100) / 10);
  const tensBottom = Math.floor((bottomNum % 100) / 10);

  const hundredsTop = Math.floor(topNum / 100);
  const hundredsBottom = Math.floor(bottomNum / 100);

  // Simulation state to compute values at each step
  let curOnesTop = onesTop;
  let curTensTop = tensTop;
  let curHundredsTop = hundredsTop;

  // --- ONES COLUMN ---
  if (curOnesTop < onesBottom) {
    // Need to borrow from tens
    // Check if tens is 0 (regroup across zero)
    if (curTensTop === 0 && is3Digit && curHundredsTop > 0) {
      // Step A: Tens borrows from Hundreds first
      steps.push({
        id: 'borrow-hundreds-to-tens-cross',
        column: 'hundreds',
        stepType: 'BORROW_CROSS_SOURCE',
        title: 'Borrow from Hundreds',
        instruction: `The Tens has 0, so Tens must first borrow 1 Hundred from the Hundreds column! Click or cross out the ${curHundredsTop}.`,
        hint: `Click the ${curHundredsTop} in Hundreds to cross it out.`,
        speechText: `The tens column has zero, so we must first borrow one hundred from the hundreds column.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
        expectedValue: curHundredsTop - 1,
      });

      steps.push({
        id: 'borrow-hundreds-to-tens-input-hundreds',
        column: 'hundreds',
        stepType: 'BORROW_INPUT_NEW_SOURCE',
        title: 'Write New Hundreds',
        instruction: `${curHundredsTop} minus 1 is ${curHundredsTop - 1}. Write ${curHundredsTop - 1} above the Hundreds.`,
        hint: `Type ${curHundredsTop - 1} in the box above Hundreds.`,
        speechText: `Write ${curHundredsTop - 1} above the hundreds column.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
        expectedValue: curHundredsTop - 1,
      });

      curHundredsTop -= 1;

      steps.push({
        id: 'borrow-hundreds-to-tens-input-tens',
        column: 'tens',
        stepType: 'BORROW_INPUT_NEW_TARGET',
        title: 'Tens Becomes 10',
        instruction: `1 Hundred is 10 Tens! 0 + 10 = 10. Write 10 above Tens.`,
        hint: `Type 10 in the box above Tens.`,
        speechText: `One hundred gives 10 tens. Write 10 above the tens column.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
        expectedValue: 10,
        unbundleAnimation: { from: 'hundreds', to: 'tens' },
      });

      curTensTop = 10;
    }

    // Now Tens has curTensTop (>= 1). We borrow 1 Ten for Ones!
    steps.push({
      id: 'ones-need-borrow-prompt',
      column: 'ones',
      stepType: 'CHECK_NEED_BORROW',
      title: 'Compare Ones Column',
      instruction: `In the Ones column, ${curOnesTop} is smaller than ${onesBottom}. You cannot take ${onesBottom} from ${curOnesTop}. We need to borrow 1 Ten from the Tens column!`,
      hint: `Since ${curOnesTop} < ${onesBottom}, look at the Tens column blinking.`,
      speechText: `${curOnesTop} is smaller than ${onesBottom}. We need to borrow one ten from the tens column.`,
      donorColumn: 'tens',
      targetColumn: 'ones',
    });

    steps.push({
      id: 'ones-borrow-cross-tens',
      column: 'tens',
      stepType: 'BORROW_CROSS_SOURCE',
      title: 'Borrow from Tens',
      instruction: `The Tens column is blinking! Cross out ${curTensTop} in Tens by clicking it or entering the new value.`,
      hint: `Click the ${curTensTop} in Tens.`,
      speechText: `Borrow one ten. Cross out ${curTensTop} in the tens column.`,
      donorColumn: 'tens',
      targetColumn: 'ones',
      expectedValue: curTensTop - 1,
    });

    const newTensVal = curTensTop - 1;
    steps.push({
      id: 'ones-borrow-input-tens',
      column: 'tens',
      stepType: 'BORROW_INPUT_NEW_SOURCE',
      title: 'Write New Tens Value',
      instruction: `${curTensTop} Ten minus 1 is ${newTensVal}. Write ${newTensVal} above the Tens column.`,
      hint: `Type ${newTensVal} in the box above Tens.`,
      speechText: `Write ${newTensVal} in the box above tens.`,
      donorColumn: 'tens',
      targetColumn: 'ones',
      expectedValue: newTensVal,
    });

    curTensTop = newTensVal;

    const newOnesVal = curOnesTop + 10;
    steps.push({
      id: 'ones-borrow-input-ones',
      column: 'ones',
      stepType: 'BORROW_INPUT_NEW_TARGET',
      title: 'Add 10 to Ones',
      instruction: `1 Ten = 10 Ones! Add 10 to ${curOnesTop} (${curOnesTop} + 10 = ${newOnesVal}). Write ${newOnesVal} above the Ones column.`,
      hint: `Type ${newOnesVal} in the box above Ones.`,
      speechText: `One ten becomes 10 ones. ${curOnesTop} plus 10 is ${newOnesVal}. Write ${newOnesVal} in the top box.`,
      donorColumn: 'tens',
      targetColumn: 'ones',
      expectedValue: newOnesVal,
      unbundleAnimation: { from: 'tens', to: 'ones' },
    });

    curOnesTop = newOnesVal;
  }

  // Subtract Ones
  const onesAnswer = curOnesTop - onesBottom;
  steps.push({
    id: 'subtract-ones',
    column: 'ones',
    stepType: 'SUBTRACT_COLUMN',
    title: 'Subtract the Ones',
    instruction: `Now subtract the Ones: ${curOnesTop} − ${onesBottom} = ? Type your answer in the Ones box below.`,
    hint: `${curOnesTop} minus ${onesBottom} equals ${onesAnswer}.`,
    speechText: `Now calculate ${curOnesTop} minus ${onesBottom}. Enter the result in the ones column below.`,
    expectedValue: onesAnswer,
  });

  // --- TENS COLUMN ---
  if (is3Digit) {
    if (curTensTop < tensBottom) {
      // Need to borrow from Hundreds
      steps.push({
        id: 'tens-need-borrow-prompt',
        column: 'tens',
        stepType: 'CHECK_NEED_BORROW',
        title: 'Compare Tens Column',
        instruction: `In the Tens column, ${curTensTop} is smaller than ${tensBottom}. You cannot take ${tensBottom} from ${curTensTop}. Let's borrow 1 Hundred from the Hundreds column!`,
        hint: `Look at the Hundreds column blinking to borrow.`,
        speechText: `In the tens column, ${curTensTop} is less than ${tensBottom}. We must borrow one hundred from the hundreds column.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
      });

      steps.push({
        id: 'tens-borrow-cross-hundreds',
        column: 'hundreds',
        stepType: 'BORROW_CROSS_SOURCE',
        title: 'Borrow from Hundreds',
        instruction: `The Hundreds column is blinking! Cross out ${curHundredsTop} in Hundreds.`,
        hint: `Click the ${curHundredsTop} in Hundreds to cross it out.`,
        speechText: `Cross out ${curHundredsTop} in the hundreds column.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
        expectedValue: curHundredsTop - 1,
      });

      const newHundredsVal = curHundredsTop - 1;
      steps.push({
        id: 'tens-borrow-input-hundreds',
        column: 'hundreds',
        stepType: 'BORROW_INPUT_NEW_SOURCE',
        title: 'Write New Hundreds Value',
        instruction: `${curHundredsTop} Hundred minus 1 is ${newHundredsVal}. Write ${newHundredsVal} above Hundreds.`,
        hint: `Type ${newHundredsVal} in the box above Hundreds.`,
        speechText: `Write ${newHundredsVal} in the box above hundreds.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
        expectedValue: newHundredsVal,
      });

      curHundredsTop = newHundredsVal;

      const newTensVal = curTensTop + 10;
      steps.push({
        id: 'tens-borrow-input-tens',
        column: 'tens',
        stepType: 'BORROW_INPUT_NEW_TARGET',
        title: 'Add 10 Tens',
        instruction: `1 Hundred = 10 Tens! Add 10 to ${curTensTop} (${curTensTop} + 10 = ${newTensVal}). Write ${newTensVal} above Tens.`,
        hint: `Type ${newTensVal} in the box above Tens.`,
        speechText: `Add 10 tens to ${curTensTop}, giving ${newTensVal}. Write ${newTensVal} above the tens.`,
        donorColumn: 'hundreds',
        targetColumn: 'tens',
        expectedValue: newTensVal,
        unbundleAnimation: { from: 'hundreds', to: 'tens' },
      });

      curTensTop = newTensVal;
    }

    // Subtract Tens
    const tensAnswer = curTensTop - tensBottom;
    steps.push({
      id: 'subtract-tens',
      column: 'tens',
      stepType: 'SUBTRACT_COLUMN',
      title: 'Subtract the Tens',
      instruction: `Now subtract the Tens: ${curTensTop} − ${tensBottom} = ? Type your answer in the Tens box below.`,
      hint: `${curTensTop} minus ${tensBottom} equals ${tensAnswer}.`,
      speechText: `Subtract the tens: ${curTensTop} minus ${tensBottom}. Enter your answer below.`,
      expectedValue: tensAnswer,
    });

    // Subtract Hundreds
    const hundredsAnswer = curHundredsTop - hundredsBottom;
    steps.push({
      id: 'subtract-hundreds',
      column: 'hundreds',
      stepType: 'SUBTRACT_COLUMN',
      title: 'Subtract the Hundreds',
      instruction: `Finally, subtract the Hundreds: ${curHundredsTop} − ${hundredsBottom} = ? Type your answer in the Hundreds box below.`,
      hint: `${curHundredsTop} minus ${hundredsBottom} equals ${hundredsAnswer}.`,
      speechText: `Finally, calculate ${curHundredsTop} minus ${hundredsBottom} for the hundreds column.`,
      expectedValue: hundredsAnswer,
    });

  } else {
    // 2-digit subtraction: just subtract Tens
    const tensAnswer = curTensTop - tensBottom;
    steps.push({
      id: 'subtract-tens-2digit',
      column: 'tens',
      stepType: 'SUBTRACT_COLUMN',
      title: 'Subtract the Tens',
      instruction: `Now subtract the Tens column: ${curTensTop} − ${tensBottom} = ? Type your answer in the Tens box below.`,
      hint: `${curTensTop} minus ${tensBottom} equals ${tensAnswer}.`,
      speechText: `Now subtract the tens column: ${curTensTop} minus ${tensBottom}. Enter your answer below.`,
      expectedValue: tensAnswer,
    });
  }

  // Completed Step
  const totalDiff = topNum - bottomNum;
  steps.push({
    id: 'problem-completed',
    column: 'ones',
    stepType: 'COMPLETED',
    title: 'Fantastic Job! 🎉',
    instruction: `You did it! ${topNum} − ${bottomNum} = ${totalDiff}. Every step was solved with proper regrouping!`,
    hint: `Click "Next Problem" to practice another one!`,
    speechText: `Fantastic job! You solved ${topNum} minus ${bottomNum} equals ${totalDiff}!`,
  });

  return steps;
}

export const PRESET_LEVELS: {
  id: string;
  name: string;
  badge: string;
  description: string;
  problems: { top: number; bottom: number }[];
}[] = [
  {
    id: 'level-1',
    name: 'Level 1: 2-Digit Regrouping',
    badge: 'Beginner',
    description: 'Master borrowing 1 ten for ones column (e.g. 52 − 27)',
    problems: [
      { top: 52, bottom: 27 },
      { top: 63, bottom: 38 },
      { top: 74, bottom: 49 },
      { top: 81, bottom: 36 },
      { top: 95, bottom: 48 },
      { top: 43, bottom: 19 },
      { top: 65, bottom: 28 },
    ],
  },
  {
    id: 'level-2',
    name: 'Level 2: Zeros in Ones',
    badge: 'Zeros in Ones',
    description: 'Borrowing when the top ones digit is 0 (e.g. 70 − 35)',
    problems: [
      { top: 70, bottom: 34 },
      { top: 80, bottom: 46 },
      { top: 50, bottom: 28 },
      { top: 90, bottom: 53 },
      { top: 60, bottom: 27 },
      { top: 40, bottom: 19 },
    ],
  },
  {
    id: 'level-3',
    name: 'Level 3: 3-Digit (1 Regroup)',
    badge: '3-Digit Simple',
    description: '3-digit subtraction with a single borrow step (e.g. 463 − 128)',
    problems: [
      { top: 463, bottom: 128 },
      { top: 582, bottom: 247 },
      { top: 791, bottom: 356 },
      { top: 674, bottom: 239 },
      { top: 895, bottom: 468 },
    ],
  },
  {
    id: 'level-4',
    name: 'Level 4: 3-Digit Double Regroup',
    badge: 'Double Regroup',
    description: 'Borrow from Tens AND Hundreds (e.g. 624 − 278)',
    problems: [
      { top: 624, bottom: 278 },
      { top: 735, bottom: 389 },
      { top: 512, bottom: 267 },
      { top: 843, bottom: 476 },
      { top: 921, bottom: 564 },
    ],
  },
  {
    id: 'level-5',
    name: 'Level 5: Across Zero',
    badge: 'Mastery',
    description: 'Regrouping across zero in the tens column (e.g. 504 − 237)',
    problems: [
      { top: 504, bottom: 237 },
      { top: 602, bottom: 348 },
      { top: 705, bottom: 429 },
      { top: 803, bottom: 276 },
      { top: 901, bottom: 457 },
    ],
  },
];

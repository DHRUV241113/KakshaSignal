import fs from 'fs';
import path from 'path';

// Load existing questions
const questionsPath = path.resolve('server/data/questions.js');
const raw = fs.readFileSync(questionsPath, 'utf-8');

// Function to generate explanation based on question content
function generateExplanation(nodeId, q) {
  const correctText = q.options[q.answer];
  
  // Specific authored explanations for core curriculum nodes
  const specificExplanations = {
    // 6_whole_numbers
    '6wn1': 'The predecessor of a whole number is obtained by subtracting 1 from it: 1000 - 1 = 999.',
    '6wn2': 'The distributive property of multiplication over addition states that a × (b + c) = a × b + a × c.',
    '6wn3': 'The first 5 whole numbers are 0, 1, 2, 3, and 4. Their sum is 0 + 1 + 2 + 3 + 4 = 10.',
    '6wn4': 'Whole numbers start from 0 and include all positive integers: {0, 1, 2, 3, ...}. Negative numbers like -3 are not whole numbers.',
    '6wn5': 'On a standard number line with uniform unit spacing, 4 lies strictly between 3 and 5.',
    '6wn6': 'By the distributive property: 126 × 55 + 126 × 45 = 126 × (55 + 45) = 126 × 100 = 12600.',
    '6wn7': 'The successor of a whole number is obtained by adding 1: 9999 + 1 = 10000.',
    '6wn8': 'The associative property of addition states that (a + b) + c = a + (b + c); grouping does not affect the sum.',
    '6wn9': 'The first 4 whole numbers are 0, 1, 2, and 3. Their sum is 0 + 1 + 2 + 3 = 6.',
    '6wn10': 'Natural numbers start from 1, whereas whole numbers include 0. Negative numbers like -5 are integers, not whole numbers.',
    '6wn11': 'By the distributive property: 245 × 68 + 245 × 32 = 245 × (68 + 32) = 245 × 100 = 24500.',

    // 6_integers
    '6i1': 'When adding integers with different signs, subtract the smaller absolute value from the larger and keep the sign of the larger: (-5) + 3 = -2.',
    '6i2': 'Moving to the left on a number line means subtracting: starting at 2 and moving 4 units left gives 2 - 4 = -2.',
    '6i3': 'On the number line, numbers increase from left to right. Thus -7 < -3 < -1 < 0 < 5.',
    '6i4': 'Subtracting a negative number is equivalent to adding its positive opposite: (-8) - (-3) = (-8) + 3 = -5.',
    '6i5': 'Starting at -4°C and rising by 7°C gives (-4) + 7 = 3°C.',
    '6i6': 'The absolute value |x| represents distance from zero on the number line, which is always non-negative: |-15| = 15.',
    '6i7': 'Adding integers with opposite signs: 12 - 7 = 5, keeping the positive sign of 12.',
    '6i8': 'Moving 5 units to the left of -1: (-1) - 5 = -6.',
    '6i9': 'Ascending order moves from smallest to largest: -9 < -4 < -2 < 0 < 3.',
    '6i10': 'Subtracting a negative is equivalent to addition: (-12) - (-5) = (-12) + 5 = -7.',
    '6i11': 'Starting at -25m elevation and ascending 18m gives (-25) + 18 = -7 m.',

    // 6_fractions
    '6f1': 'An improper fraction is defined as a fraction where the numerator is greater than or equal to the denominator (7 ≥ 3).',
    '6f2': 'To convert mixed number a b/c to an improper fraction, compute (a × c + b) / c: (2 × 4 + 3) / 4 = 11/4.',
    '6f3': 'Multiplying both numerator and denominator of 2/5 by 2 gives the equivalent fraction (2 × 2) / (5 × 2) = 4/10.',
    '6f4': 'Find the common denominator (LCM of 3 and 6 is 6): 1/3 + 1/6 = 2/6 + 1/6 = 3/6, which simplifies to 1/2.',
    '6f5': 'Convert to a common denominator: 3/4 = 6/8. Since 6/8 > 5/8, 3/4 is greater.',
    '6f6': 'Convert to a common denominator 6: 5/6 - 1/3 = 5/6 - 2/6 = 3/6 = 1/2.',
    '6f7': 'In 9/4, the numerator 9 is greater than denominator 4, making it an improper fraction.',
    '6f8': 'Converting 3 ½: (3 × 2 + 1) / 2 = 7/2.',
    '6f9': 'Multiplying numerator and denominator of 3/7 by 2 gives (3 × 2) / (7 × 2) = 6/14.',
    '6f10': 'Find common denominator 10: 2/5 = 4/10; then 4/10 + 3/10 = 7/10.',
    '6f11': 'Convert to common denominator 9: 2/3 = 6/9. Comparing 6/9 and 5/9, 6/9 is greater, so 2/3 > 5/9.',

    // 6_decimals
    '6d1': 'In 45.678, the digit 7 is two places to the right of the decimal point, representing hundredths (7/100 = 0.07).',
    '6d2': 'Dividing numerator by denominator: 3 ÷ 4 = 0.75.',
    '6d3': 'Aligning decimal points: 12.35 + 4.80 = 17.15.',
    '6d4': 'Comparing tenths place: in 0.5 tenths is 5; in 0.05 tenths is 0. Since 5 > 0, 0.5 > 0.05.',
    '6d5': '0.25 = 25/100, which reduces by dividing numerator and denominator by 25 to 1/4.',
    '6d6': 'In 18.235, the digit 3 is in the hundredths place (value 0.03).',
    '6d7': 'Dividing 7 by 8 gives 0.875.',
    '6d8': 'Aligning decimal points: 24.65 + 3.80 = 28.45.',
    '6d9': 'Comparing tenths place: 0.7 > 0.07 because 7 tenths > 0 tenths.',
    '6d10': '0.75 = 75/100, which reduces by dividing numerator and denominator by 25 to 3/4.',

    // 7_rational_numbers
    '7rn1': 'A rational number is any number expressible in the form p/q where p and q are integers and q ≠ 0. -3/7 satisfies this definition.',
    '7rn2': 'With common denominator 3: (-2/3) + (4/3) = (-2 + 4)/3 = 2/3.',
    '7rn3': 'The additive inverse of a/b is the number that sums to 0, which is -a/b. The additive inverse of -5/8 is 5/8.',
    '7rn4': 'Multiply numerators and denominators: (-1 × 4) / (2 × 5) = -4/10 = -2/5.',
    '7rn5': 'As a decimal, -3/4 = -0.75, which lies between -1 and 0 on the number line.',
    '7rn6': 'Using the mean method: (1/4 + 1/2) / 2 = (1/4 + 2/4) / 2 = (3/4) / 2 = 3/8.',
    '7rn7': 'Dividing two negative numbers yields a positive result: -7/(-9) = 7/9, which is positive.',
    '7rn8': 'Subtracting with common denominator: (-3 - 2)/5 = -5/5 = -1.',
    '7rn9': 'The reciprocal (multiplicative inverse) flips the fraction while preserving sign: reciprocal of -13/17 is -17/13.',
    '7rn10': 'Dividing by a fraction equals multiplying by its reciprocal: (-2/7) ÷ (4/21) = (-2/7) × (21/4) = -42/28 = -3/2.',
    '7rn11': 'A rational number p/q is in standard form if q > 0 and HCF(|p|, q) = 1. -3/5 satisfies these conditions.',

    // 8_rational_numbers_adv
    '8rna1': 'The identity a × (b + c) = a × b + a × c demonstrates the Distributive Property of multiplication over addition.',
    '8rna2': 'The multiplicative inverse (reciprocal) satisfies x × (1/x) = 1. For -2/3, multiplying by -3/2 gives (-2/3) × (-3/2) = 1.',
    '8rna3': 'Using the mean method: (1/3 + 1/2)/2 = (2/6 + 3/6)/2 = (5/6)/2 = 5/12.',
    '8rna4': 'Zero is the additive identity because adding 0 to any rational number leaves it unchanged: a/b + 0 = a/b.',
    '8rna5': 'Subtraction is not commutative: for example, 1/2 - 1/3 = 1/6, but 1/3 - 1/2 = -1/6 (1/6 ≠ -1/6).',
    '8rna6': 'The Closure Property states that performing an operation on elements of a set always produces an element within that same set.',
    '8rna7': 'The additive inverse of a/b is -a/b. For -7/19, the additive inverse is 7/19 because (-7/19) + (7/19) = 0.',
    '8rna8': 'Strictly between 1/4 (0.25) and 3/4 (0.75) lies 1/2 (0.50).',
    '8rna9': 'One is the multiplicative identity because multiplying any rational number by 1 preserves its value: a/b × 1 = a/b.',
    '8rna10': 'Division is not associative: for example, (8 ÷ 4) ÷ 2 = 2 ÷ 2 = 1, but 8 ÷ (4 ÷ 2) = 8 ÷ 2 = 4.'
  };

  if (specificExplanations[q.id]) {
    return specificExplanations[q.id];
  }

  // Fallback programmatic pedagogical explanation
  if (q.competency) {
    return `For ${q.competency.replace(/-/g, ' ')}, applying the foundational mathematical rule yields "${correctText}".`;
  }
  return `By applying standard NCERT mathematical properties, the correct evaluation is "${correctText}".`;
}

// Read questions object
import('../server/data/questions.js').then(async (m) => {
  const allQuestions = m.default;
  let count = 0;

  for (const nodeId in allQuestions) {
    for (const q of allQuestions[nodeId]) {
      q.explanation = generateExplanation(nodeId, q);
      count++;
    }
  }

  const outputJs = `// Quiz Question Bank for CBSE Math Classes 6-8\n// Questions mapped to knowledge graph nodes with pedagogical explanations\n// Based on NCERT textbook exercise patterns\n\nconst questions = ${JSON.stringify(allQuestions, null, 2)};\n\nexport default questions;\n`;
  fs.writeFileSync(questionsPath, outputJs, 'utf-8');
  console.log(`Successfully enriched ${count} questions across all nodes with pedagogical explanations!`);
});

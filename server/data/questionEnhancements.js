// Question Enhancements: Progressive Hints, Misconception Analysis, and Difficulty Tiers
// Aligned with CBSE / NCERT Mathematics Classes 6-8

import knowledgeGraph, { getNode, getPrerequisites } from './knowledgeGraph.js';

// Curated enhancements for demonstrative and high-frequency assessment questions
export const CURATED_ENHANCEMENTS = {
  // --- Class 8: Rational Numbers (Advanced) ---
  "8rna1": {
    difficulty: "medium",
    hints: [
      "Concept Reminder: Notice how multiplication is being applied across an addition operation inside parentheses.",
      "Formula / Method: Recall the algebraic law a × (b + c) = a × b + a × c, which distributes multiplication across terms.",
      "Step-by-Step Guidance: The factor 'a' is multiplied by both 'b' and 'c' individually and then added. This is the Distributive Property."
    ],
    misconceptions: {
      1: {
        label: "Commutativity Confusion",
        misconception: "Confused the order of operands with distributing multiplication across addition.",
        prerequisiteNode: "6_whole_numbers",
        rationale: "Commutative property only deals with changing the order of numbers (a × b = b × a), not distributing across addition."
      },
      2: {
        label: "Associativity Confusion",
        misconception: "Confused regrouping brackets with distributing multiplication across terms.",
        prerequisiteNode: "6_whole_numbers",
        rationale: "Associative property alters grouping under the same operation: (a × b) × c = a × (b × c)."
      },
      3: {
        label: "Closure Confusion",
        misconception: "Confused set closure with an algebraic equivalence identity.",
        prerequisiteNode: "7_rational_numbers",
        rationale: "Closure states that operations on rationals yield rationals; it is not a distributive expansion identity."
      }
    }
  },
  "8rna2": {
    difficulty: "medium",
    hints: [
      "Concept Reminder: A multiplicative inverse (reciprocal) of a number x satisfies x × (reciprocal) = 1.",
      "Formula / Method: For any rational fraction p/q (where p, q ≠ 0), the reciprocal is q/p. The product must equal positive 1.",
      "Step-by-Step Guidance: Flip numerator and denominator: -2/3 becomes -3/2. Check: (-2/3) × (-3/2) = +6/6 = 1."
    ],
    misconceptions: {
      0: {
        label: "Additive Inverse Sign Confusion",
        misconception: "Confused additive inverse (negation/opposite sign) with multiplicative inverse (reciprocal).",
        prerequisiteNode: "6_integers",
        rationale: "Changing -2/3 to +2/3 is an additive operation; multiplying (-2/3) × (2/3) yields -4/9, not 1."
      },
      2: {
        label: "Reciprocal Without Sign Preservation",
        misconception: "Inverted numerator and denominator but dropped the negative sign.",
        prerequisiteNode: "7_integers_ops",
        rationale: "Reciprocals must preserve the sign because a negative times a positive yields a negative: (-2/3) × (3/2) = -1 ≠ 1."
      },
      3: {
        label: "Identity Confusion",
        misconception: "Assumed multiplicative inverse leaves the number unchanged.",
        prerequisiteNode: "7_rational_numbers",
        rationale: "Multiplying -2/3 by itself yields 4/9 ≠ 1."
      }
    }
  },
  "8rna3": {
    difficulty: "hard",
    hints: [
      "Concept Reminder: To find a rational number strictly between two fractions, use the arithmetic mean (average) method.",
      "Formula / Method: Mean = (a + b) / 2. First convert fractions to a common denominator before adding.",
      "Step-by-Step Guidance: 1/3 = 2/6 and 1/2 = 3/6. Sum = 5/6. Dividing by 2: (5/6) ÷ 2 = 5/12."
    ],
    misconceptions: {
      0: {
        label: "Fraction Magnitude Underestimation",
        misconception: "Selected a number smaller than the lower bound (1/4 = 0.25 < 1/3 ≈ 0.33).",
        prerequisiteNode: "6_fractions",
        rationale: "Student has difficulty ordering fractions and comparing relative magnitude."
      },
      1: {
        label: "Freshman Sum Fallacy",
        misconception: "Directly added numerators and denominators: (1+1)/(3+2) = 2/5.",
        prerequisiteNode: "6_fractions",
        rationale: "Fractions cannot be added by combining tops and bottoms; a common denominator or mean is required."
      },
      3: {
        label: "Fraction Magnitude Overestimation",
        misconception: "Selected a number larger than the upper bound (2/3 ≈ 0.67 > 1/2 = 0.50).",
        prerequisiteNode: "6_fractions",
        rationale: "Student confused the comparison order between 2/3 and 1/2."
      }
    }
  },
  "8rna4": {
    difficulty: "easy",
    hints: [
      "Concept Reminder: The additive identity is the number that leaves any rational number unchanged when added to it.",
      "Formula / Method: Find 'e' such that a/b + e = a/b.",
      "Step-by-Step Guidance: For any fraction like 5/7, adding 0 gives 5/7 + 0 = 5/7. Therefore, 0 is the additive identity."
    ],
    misconceptions: {
      0: {
        label: "Identity Existence Confusion",
        misconception: "Believed rational numbers do not have an additive identity element.",
        prerequisiteNode: "6_whole_numbers",
        rationale: "Zero is a valid rational number (0/1) and serves as the universal additive identity."
      },
      1: {
        label: "Multiplicative vs Additive Identity Confusion",
        misconception: "Confused the multiplicative identity (1) with the additive identity (0).",
        prerequisiteNode: "7_rational_numbers",
        rationale: "Adding 1 changes the value (a/b + 1 ≠ a/b); 1 is the multiplicative identity."
      },
      2: {
        label: "Sign Inversion Confusion",
        misconception: "Confused identity element with negative unit.",
        prerequisiteNode: "6_integers",
        rationale: "Adding -1 subtracts 1 from the number instead of leaving it invariant."
      }
    }
  },
  "8rna5": {
    difficulty: "medium",
    hints: [
      "Concept Reminder: Commutative property means changing the order of operands does not change the result (a - b = b - a).",
      "Formula / Method: Test a counterexample with two simple rational numbers: e.g. 1/2 and 1/3.",
      "Step-by-Step Guidance: 1/2 - 1/3 = 1/6, but 1/3 - 1/2 = -1/6. Since 1/6 ≠ -1/6, subtraction is not commutative."
    ],
    misconceptions: {
      1: {
        label: "Operation Commutativity Generalization",
        misconception: "Assumed subtraction is commutative because addition and multiplication are commutative.",
        prerequisiteNode: "6_integers",
        rationale: "Subtraction changes sign when operand order is reversed: a - b = -(b - a)."
      },
      2: {
        label: "Partial Subdomain Commutativity Fallacy",
        misconception: "Believed subtraction is commutative for positive numbers.",
        prerequisiteNode: "6_integers",
        rationale: "Positive fractions still produce opposite signs when reversed (e.g. 3 - 2 = 1, but 2 - 3 = -1)."
      },
      3: {
        label: "Domain Invariance Confusion",
        misconception: "Believed whole integer properties differ from general rationals in commutativity.",
        prerequisiteNode: "6_whole_numbers",
        rationale: "Subtraction is non-commutative across whole numbers, integers, and rationals alike."
      }
    }
  },

  // --- Class 7: Rational Numbers ---
  "7rn1": {
    difficulty: "easy",
    hints: [
      "Concept Reminder: A rational number is any number that can be expressed as p/q where p and q are integers and q ≠ 0.",
      "Formula / Method: Look for a ratio of two integers with a non-zero denominator.",
      "Step-by-Step Guidance: In -3/7, both -3 and 7 are integers, and 7 ≠ 0. Square roots of non-perfect squares like √2 and constants like π are irrational."
    ],
    misconceptions: {
      1: {
        label: "Irrational Radical Confusion",
        misconception: "Thought square root of 2 is a rational number.",
        prerequisiteNode: "6_whole_numbers",
        rationale: "√2 cannot be written as a ratio of two integers; its decimal expansion is non-terminating and non-repeating."
      },
      2: {
        label: "Transcendental Constant Confusion",
        misconception: "Thought π is a rational number.",
        prerequisiteNode: "6_fractions",
        rationale: "π is an irrational number; 22/7 is only an approximate representation."
      },
      3: {
        label: "Negative Fraction Misclassification",
        misconception: "Assumed negative fractions cannot be rational numbers.",
        prerequisiteNode: "6_integers",
        rationale: "Integers can be negative, so -3/7 is fully rational."
      }
    }
  },
  "7rn2": {
    difficulty: "easy",
    hints: [
      "Concept Reminder: When adding fractions with like denominators, add the numerators and keep the common denominator.",
      "Formula / Method: (-a/c) + (b/c) = (-a + b) / c.",
      "Step-by-Step Guidance: Here denominators are both 3. Add numerators: -2 + 4 = +2. The result is 2/3."
    ],
    misconceptions: {
      0: {
        label: "Integer Sign Subtraction Error",
        misconception: "Calculated -2 + 4 as -2.",
        prerequisiteNode: "6_integers",
        rationale: "Failed to correctly apply integer addition on the number line: starting at -2 and moving right 4 units arrives at +2."
      },
      2: {
        label: "Denominator Addition Error",
        misconception: "Added both numerators and denominators: (-2+4)/(3+3) = 2/6.",
        prerequisiteNode: "6_fractions",
        rationale: "Denominators are common units and must not be added together."
      },
      3: {
        label: "Sign Multiplication Confusion",
        misconception: "Treated addition like multiplication and produced a negative product.",
        prerequisiteNode: "7_integers_ops",
        rationale: "In addition, the sign of the larger absolute value dominates."
      }
    }
  },

  // --- Class 6: Fractions ---
  "6f1": {
    difficulty: "easy",
    hints: [
      "Concept Reminder: Compare the numerator (top number) and denominator (bottom number).",
      "Formula / Method: In a fraction p/q, if p < q it is proper; if p ≥ q it is improper; if it has a whole part and fraction it is mixed.",
      "Step-by-Step Guidance: In 7/3, 7 is strictly greater than 3. A fraction where numerator ≥ denominator is an improper fraction."
    ],
    misconceptions: {
      1: {
        label: "Proper / Improper Inversion",
        misconception: "Confused proper fraction with improper fraction.",
        prerequisiteNode: "6_fractions",
        rationale: "Proper fractions represent less than one whole (numerator < denominator)."
      },
      2: {
        label: "Mixed Number Confusion",
        misconception: "Confused improper fraction with mixed fraction notation.",
        prerequisiteNode: "6_fractions",
        rationale: "7/3 can be converted to 2 1/3, but written as 7/3 it is strictly an improper fraction."
      },
      3: {
        label: "Unit Fraction Confusion",
        misconception: "Confused with a unit fraction (numerator = 1).",
        prerequisiteNode: "6_fractions",
        rationale: "Unit fractions must have 1 in the numerator (e.g. 1/3)."
      }
    }
  },
  "6f3": {
    difficulty: "easy",
    hints: [
      "Concept Reminder: Equivalent fractions represent the exact same value or proportion.",
      "Formula / Method: Multiply or divide both numerator and denominator by the exact same non-zero whole number.",
      "Step-by-Step Guidance: Multiply 2/3 by 2/2: (2 × 2) / (3 × 2) = 4/6."
    ],
    misconceptions: {
      1: {
        label: "Additive Equivalence Fallacy",
        misconception: "Added 1 to both numerator and denominator: (2+1)/(3+1) = 3/4.",
        prerequisiteNode: "6_fractions",
        rationale: "Adding numbers to top and bottom changes the ratio; only multiplying/dividing maintains equivalence."
      },
      2: {
        label: "Unequal Scaling Error",
        misconception: "Multiplied numerator by 2.5 and denominator by 2 to get 5/6.",
        prerequisiteNode: "6_fractions",
        rationale: "Scaling factors for numerator and denominator must be identical."
      },
      3: {
        label: "Numerator Invariance Error",
        misconception: "Doubled denominator while keeping numerator unchanged: 2/6.",
        prerequisiteNode: "6_fractions",
        rationale: "Doubling only the denominator cuts the fraction's value in half."
      }
    }
  }
};

/**
 * Deterministically generates pedagogical hints, difficulty, and distractor misconceptions
 * for any question based on its competency, options, and node prerequisites.
 */
export function synthesizeQuestionEnhancements(q, nodeId) {
  if (CURATED_ENHANCEMENTS[q.id]) {
    return CURATED_ENHANCEMENTS[q.id];
  }

  const node = getNode(nodeId);
  const prereqs = getPrerequisites(nodeId);
  const primaryPrereq = prereqs.length > 0 ? prereqs[0] : (node?.class === 6 ? '6_whole_numbers' : '6_fractions');
  const compLabel = (q.competency || 'foundational concept').replace(/-/g, ' ');

  // Deterministic difficulty based on question index / form / complexity
  let difficulty = 'medium';
  if (q.form === 'B') {
    difficulty = q.id.endsWith('1') || q.id.endsWith('2') ? 'medium' : 'hard';
  } else {
    difficulty = q.id.endsWith('1') || q.id.endsWith('4') ? 'easy' : (q.id.endsWith('3') ? 'hard' : 'medium');
  }

  // Synthesize progressive 3-level hints
  const hints = [
    `Concept Reminder: Focus on the key definition of ${compLabel} in Grade ${node?.class || 6} Mathematics.`,
    `Formula / Method: Apply the standard NCERT curriculum rule for ${compLabel}. Verify units and sign conventions carefully.`,
    `Step-by-Step Guidance: Review the question stem: "${q.text}". Test each candidate option against the formal mathematical definition.`
  ];

  // Synthesize misconceptions for distractors
  const misconceptions = {};
  if (Array.isArray(q.options)) {
    q.options.forEach((optText, idx) => {
      if (idx !== q.answer) {
        misconceptions[idx] = {
          label: `${compLabel} Misconception`,
          misconception: `Selected option "${optText}" instead of the correct rule for ${compLabel}.`,
          prerequisiteNode: primaryPrereq,
          rationale: `Difficulty with ${compLabel} traces to foundational prerequisite ${getNode(primaryPrereq)?.label || primaryPrereq}.`
        };
      }
    });
  }

  return { difficulty, hints, misconceptions };
}

/**
 * Enrich a question object with progressive hints, difficulty, and misconceptions.
 */
export function enrichQuestion(q, nodeId) {
  const enhancements = synthesizeQuestionEnhancements(q, nodeId);
  return {
    ...q,
    difficulty: q.difficulty || enhancements.difficulty,
    hints: Array.isArray(q.hints) && q.hints.length === 3 ? q.hints : enhancements.hints,
    misconceptions: q.misconceptions || enhancements.misconceptions
  };
}

/**
 * Analyze a specific answer selection for misconceptions.
 */
export function analyzeMisconception(question, selectedOption, nodeId) {
  if (!question) {
    return { isCorrect: false, error: 'Question not found' };
  }

  const isCorrect = (question.answer === selectedOption);
  if (isCorrect) {
    return {
      isCorrect: true,
      questionId: question.id,
      selectedOption,
      explanation: question.explanation || 'Correct answer.'
    };
  }

  const enriched = enrichQuestion(question, nodeId);
  const misc = enriched.misconceptions?.[selectedOption];
  const prereqNodeId = misc?.prerequisiteNode || getPrerequisites(nodeId)[0] || '6_fractions';
  const prereqNode = getNode(prereqNodeId);

  return {
    isCorrect: false,
    questionId: question.id,
    questionText: question.text,
    selectedOption,
    selectedOptionText: question.options?.[selectedOption] || '',
    correctOption: question.answer,
    correctOptionText: question.options?.[question.answer] || '',
    label: misc?.label || 'Curricular Misconception',
    misconception: misc?.misconception || `Chose "${question.options?.[selectedOption]}" which indicates misunderstanding of ${question.competency || 'the concept'}.`,
    prerequisiteNodeId: prereqNodeId,
    prerequisiteLabel: prereqNode?.label || prereqNodeId,
    prerequisiteClass: prereqNode?.class || 6,
    rationale: misc?.rationale || `Traced to prerequisite ${prereqNode?.label || prereqNodeId}.`,
    pedagogicalExplanation: question.explanation
  };
}

export default {
  CURATED_ENHANCEMENTS,
  synthesizeQuestionEnhancements,
  enrichQuestion,
  analyzeMisconception
};

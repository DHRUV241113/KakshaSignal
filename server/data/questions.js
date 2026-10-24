// Quiz Question Bank for CBSE Math Classes 6-8
// Questions mapped to knowledge graph nodes
// Based on NCERT textbook exercise patterns
// Each question has: correct answer, options, and the specific competency tested

const questions = {
  // ===== CLASS 6 =====

  "6_whole_numbers": [
    // Form A: Initial Diagnostic / Baseline
    { id: "6wn1", text: "What is the predecessor of 1000?", options: ["999", "1001", "998", "100"], answer: 0, competency: "predecessor-successor", form: "A" },
    { id: "6wn2", text: "Which property is shown by: 25 × (10 + 5) = 25 × 10 + 25 × 5?", options: ["Distributive", "Commutative", "Associative", "Closure"], answer: 0, competency: "properties", form: "A" },
    { id: "6wn3", text: "What is the sum of the first 5 whole numbers?", options: ["10", "15", "5", "20"], answer: 0, competency: "operations", form: "A" },
    { id: "6wn4", text: "Which of these is NOT a whole number?", options: ["-3", "0", "5", "100"], answer: 0, competency: "identification", form: "A" },
    { id: "6wn5", text: "On a number line, which number lies between 3 and 5?", options: ["4", "6", "2", "8"], answer: 0, competency: "number-line", form: "A" },
    { id: "6wn6", text: "What is 126 × 55 + 126 × 45? (Use distributive property)", options: ["12600", "12500", "11600", "13600"], answer: 0, competency: "properties-application", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "6wn7", text: "What is the successor of 9999?", options: ["10000", "9998", "10001", "1000"], answer: 0, competency: "predecessor-successor", form: "B" },
    { id: "6wn8", text: "Which property is illustrated by 17 + 23 = 23 + 17?", options: ["Commutative", "Associative", "Distributive", "Closure"], answer: 0, competency: "properties", form: "B" },
    { id: "6wn9", text: "What is the product of the smallest whole number and the smallest natural number?", options: ["0", "1", "Cannot be determined", "2"], answer: 0, competency: "operations", form: "B" },
    { id: "6wn10", text: "On a number line, 12 lies to the ___ of 8:", options: ["Right", "Left", "Middle", "Below"], answer: 0, competency: "number-line", form: "B" },
    { id: "6wn11", text: "Evaluate using distributive property: 738 × 103", options: ["76014", "76114", "75914", "74014"], answer: 0, competency: "properties-application", form: "B" },
  ],

  "6_integers": [
    // Form A: Initial Diagnostic / Baseline
    { id: "6i1", text: "What is (-5) + 3?", options: ["-2", "2", "-8", "8"], answer: 0, competency: "addition", form: "A" },
    { id: "6i2", text: "Which integer is 4 units to the left of 2 on the number line?", options: ["-2", "6", "-4", "0"], answer: 0, competency: "number-line", form: "A" },
    { id: "6i3", text: "Arrange in ascending order: -3, 5, -1, 0, -7", options: ["-7, -3, -1, 0, 5", "-1, -3, -7, 0, 5", "5, 0, -1, -3, -7", "0, -1, -3, -7, 5"], answer: 0, competency: "ordering", form: "A" },
    { id: "6i4", text: "What is (-8) - (-3)?", options: ["-5", "-11", "5", "11"], answer: 0, competency: "subtraction", form: "A" },
    { id: "6i5", text: "The temperature was -4°C in the morning and rose by 7°C. What is the temperature now?", options: ["3°C", "-3°C", "11°C", "-11°C"], answer: 0, competency: "word-problems", form: "A" },
    { id: "6i6", text: "What is the absolute value of -15?", options: ["15", "-15", "0", "1"], answer: 0, competency: "absolute-value", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "6i7", text: "Evaluate: (-7) + 12", options: ["5", "-5", "19", "-19"], answer: 0, competency: "addition", form: "B" },
    { id: "6i8", text: "Which integer is 5 units to the left of -1 on the number line?", options: ["-6", "4", "-4", "6"], answer: 0, competency: "number-line", form: "B" },
    { id: "6i9", text: "Which is the correct ascending order of: -8, 2, -4, 0, 6?", options: ["-8, -4, 0, 2, 6", "-4, -8, 0, 2, 6", "6, 2, 0, -4, -8", "0, -4, -8, 2, 6"], answer: 0, competency: "ordering", form: "B" },
    { id: "6i10", text: "Evaluate: (-12) - (-5)", options: ["-7", "-17", "7", "17"], answer: 0, competency: "subtraction", form: "B" },
    { id: "6i11", text: "A mining cart starts at -25m underground and ascends 18m. What is its current elevation?", options: ["-7 m", "-43 m", "7 m", "43 m"], answer: 0, competency: "word-problems", form: "B" },
  ],

  "6_fractions": [
    // Form A: Initial Diagnostic / Baseline
    { id: "6f1", text: "What type of fraction is 7/3?", options: ["Improper fraction", "Proper fraction", "Mixed number", "Unit fraction"], answer: 0, competency: "identification", form: "A" },
    { id: "6f2", text: "Convert 2 ¾ to an improper fraction.", options: ["11/4", "9/4", "8/4", "10/4"], answer: 0, competency: "conversion", form: "A" },
    { id: "6f3", text: "Which fraction is equivalent to 2/5?", options: ["4/10", "3/10", "2/10", "5/10"], answer: 0, competency: "equivalence", form: "A" },
    { id: "6f4", text: "What is 1/3 + 1/6?", options: ["1/2", "2/9", "1/9", "2/6"], answer: 0, competency: "addition", form: "A" },
    { id: "6f5", text: "Which is greater: 3/4 or 5/8?", options: ["3/4", "5/8", "They are equal", "Cannot compare"], answer: 0, competency: "comparison", form: "A" },
    { id: "6f6", text: "What is 5/6 - 1/3?", options: ["1/2", "4/3", "2/6", "4/6"], answer: 0, competency: "subtraction", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "6f7", text: "Simplify the fraction 18/24 to its lowest terms:", options: ["3/4", "9/12", "6/8", "2/3"], answer: 0, competency: "simplification", form: "B" },
    { id: "6f8", text: "What is the common denominator (LCM) needed to add 2/3 and 3/4?", options: ["12", "7", "6", "24"], answer: 0, competency: "common-denominators", form: "B" },
    { id: "6f9", text: "Evaluate: 3/5 + 1/10", options: ["7/10", "4/15", "4/10", "7/15"], answer: 0, competency: "addition", form: "B" },
    { id: "6f10", text: "Evaluate: 7/8 - 3/8", options: ["1/2", "4/16", "4/0", "10/8"], answer: 0, competency: "subtraction", form: "B" },
    { id: "6f11", text: "Which of the following is equivalent to 9/15?", options: ["3/5", "6/10", "18/30", "All of these"], answer: 3, competency: "equivalence", form: "B" },
  ],

  "6_decimals": [
    // Form A: Initial Diagnostic / Baseline
    { id: "6d1", text: "What is the place value of 3 in 27.35?", options: ["3 tenths", "3 ones", "3 hundredths", "30"], answer: 0, competency: "place-value", form: "A" },
    { id: "6d2", text: "Convert 3/4 to a decimal.", options: ["0.75", "0.34", "0.25", "0.50"], answer: 0, competency: "conversion", form: "A" },
    { id: "6d3", text: "What is 2.5 + 3.75?", options: ["6.25", "6.15", "5.25", "6.30"], answer: 0, competency: "addition", form: "A" },
    { id: "6d4", text: "Which is greater: 0.5 or 0.05?", options: ["0.5", "0.05", "They are equal", "Cannot compare"], answer: 0, competency: "comparison", form: "A" },
    { id: "6d5", text: "What is 10.5 - 3.25?", options: ["7.25", "7.75", "6.25", "13.75"], answer: 0, competency: "subtraction", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "6d6", text: "What is the place value of 7 in 14.072?", options: ["7 hundredths", "7 tenths", "7 ones", "7 thousandths"], answer: 0, competency: "place-value", form: "B" },
    { id: "6d7", text: "Convert 7/20 to a decimal.", options: ["0.35", "0.72", "0.035", "0.20"], answer: 0, competency: "conversion", form: "B" },
    { id: "6d8", text: "What is 4.8 + 1.25?", options: ["6.05", "5.13", "6.25", "5.05"], answer: 0, competency: "addition", form: "B" },
    { id: "6d9", text: "Which of the following is the smallest decimal?", options: ["0.089", "0.12", "0.8", "0.09"], answer: 0, competency: "comparison", form: "B" },
    { id: "6d10", text: "Evaluate: 15.6 - 4.85", options: ["10.75", "10.85", "11.25", "11.75"], answer: 0, competency: "subtraction", form: "B" },
  ],

  "6_basic_geometry": [
    { id: "6bg1", text: "How many endpoints does a ray have?", options: ["1", "2", "0", "3"], answer: 0, competency: "basic-concepts" },
    { id: "6bg2", text: "The sum of angles of a triangle is:", options: ["180°", "360°", "90°", "270°"], answer: 0, competency: "angle-sum" },
    { id: "6bg3", text: "A quadrilateral has how many diagonals?", options: ["2", "4", "3", "1"], answer: 0, competency: "quadrilateral-properties" },
    { id: "6bg4", text: "The longest chord of a circle is called:", options: ["Diameter", "Radius", "Arc", "Chord"], answer: 0, competency: "circle-concepts" },
    { id: "6bg5", text: "Two lines that never meet are called:", options: ["Parallel lines", "Intersecting lines", "Perpendicular lines", "Concurrent lines"], answer: 0, competency: "line-concepts" },
  ],

  "6_algebra_intro": [
    { id: "6a1", text: "If x = 3, what is the value of 2x + 5?", options: ["11", "10", "8", "6"], answer: 0, competency: "substitution" },
    { id: "6a2", text: "Which of these is an algebraic expression?", options: ["3x + 2", "5 + 7", "12", "3 > 2"], answer: 0, competency: "identification" },
    { id: "6a3", text: "The rule 'multiply by 3 and add 1' for input n is written as:", options: ["3n + 1", "n + 3", "3 + n", "n × 1 + 3"], answer: 0, competency: "pattern-to-expression" },
    { id: "6a4", text: "In the expression 5y + 3, the coefficient of y is:", options: ["5", "3", "y", "8"], answer: 0, competency: "terms-coefficients" },
    { id: "6a5", text: "Which equation represents 'a number increased by 7 equals 15'?", options: ["x + 7 = 15", "x - 7 = 15", "7x = 15", "x/7 = 15"], answer: 0, competency: "forming-equations" },
  ],

  "6_ratio_proportion": [
    { id: "6rp1", text: "The ratio of 15 to 25 in simplest form is:", options: ["3:5", "15:25", "5:3", "1:2"], answer: 0, competency: "simplification" },
    { id: "6rp2", text: "If 5 pens cost ₹75, what is the cost of 8 pens?", options: ["₹120", "₹100", "₹80", "₹150"], answer: 0, competency: "unitary-method" },
    { id: "6rp3", text: "Are 4:6 and 8:12 in proportion?", options: ["Yes", "No", "Cannot determine", "Only sometimes"], answer: 0, competency: "proportion-check" },
    { id: "6rp4", text: "If a:b = 2:3 and b = 12, find a.", options: ["8", "6", "18", "4"], answer: 0, competency: "finding-terms" },
    { id: "6rp5", text: "12 workers finish a job in 10 days. How many days for 15 workers?", options: ["8", "12", "6", "10"], answer: 0, competency: "word-problems" },
  ],

  "6_mensuration_perimeter_area": [
    { id: "6m1", text: "The perimeter of a rectangle with length 8cm and breadth 5cm is:", options: ["26 cm", "40 cm", "13 cm", "80 cm"], answer: 0, competency: "perimeter-rectangle" },
    { id: "6m2", text: "The area of a square with side 7cm is:", options: ["49 sq cm", "28 sq cm", "14 sq cm", "21 sq cm"], answer: 0, competency: "area-square" },
    { id: "6m3", text: "The perimeter of an equilateral triangle with side 6cm is:", options: ["18 cm", "12 cm", "36 cm", "24 cm"], answer: 0, competency: "perimeter-triangle" },
    { id: "6m4", text: "If the area of a rectangle is 48 sq cm and length is 8cm, the breadth is:", options: ["6 cm", "8 cm", "40 cm", "56 cm"], answer: 0, competency: "inverse-problems" },
    { id: "6m5", text: "Which has a greater area: square of side 5cm or rectangle 6cm × 4cm?", options: ["Square (25 sq cm)", "Rectangle (24 sq cm)", "Both equal", "Cannot compare"], answer: 0, competency: "comparison" },
  ],

  // ===== CLASS 7 =====

  "7_integers_ops": [
    // Form A: Initial Diagnostic / Baseline
    { id: "7io1", text: "What is (-3) × (-5)?", options: ["15", "-15", "8", "-8"], answer: 0, competency: "multiplication", form: "A" },
    { id: "7io2", text: "What is (-20) ÷ 4?", options: ["-5", "5", "-80", "80"], answer: 0, competency: "division", form: "A" },
    { id: "7io3", text: "What is (-1) × (-1) × (-1)?", options: ["-1", "1", "0", "-3"], answer: 0, competency: "sign-rules", form: "A" },
    { id: "7io4", text: "Which property: (-3) × [(-2) + 5] = (-3)×(-2) + (-3)×5?", options: ["Distributive", "Commutative", "Associative", "Identity"], answer: 0, competency: "properties", form: "A" },
    { id: "7io5", text: "Evaluate: (-36) ÷ (-9)", options: ["4", "-4", "27", "-27"], answer: 0, competency: "division", form: "A" },
    { id: "7io6", text: "A submarine is at -800m. It rises 250m. New depth?", options: ["-550 m", "-1050 m", "550 m", "1050 m"], answer: 0, competency: "word-problems", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "7io7", text: "What is (-6) × (-4)?", options: ["24", "-24", "10", "-10"], answer: 0, competency: "multiplication", form: "B" },
    { id: "7io8", text: "Evaluate: (-45) ÷ 9", options: ["-5", "5", "-54", "-36"], answer: 0, competency: "division", form: "B" },
    { id: "7io9", text: "What is (-1) multiplied by itself 4 times: (-1)⁴?", options: ["1", "-1", "4", "-4"], answer: 0, competency: "sign-rules", form: "B" },
    { id: "7io10", text: "Identify the missing value: 5 × [(-2) + 6] = 5 × (-2) + ___?", options: ["5 × 6", "6", "-10", "30"], answer: 0, competency: "properties", form: "B" },
    { id: "7io11", text: "During a cold front, temperature dropped 3°C each hour for 5 hours. What was the total temperature change?", options: ["-15°C", "15°C", "-8°C", "8°C"], answer: 0, competency: "word-problems", form: "B" },
  ],

  "7_fractions_decimals": [
    // Form A: Initial Diagnostic / Baseline
    { id: "7fd1", text: "What is 2/5 × 3/7?", options: ["6/35", "5/12", "6/12", "5/35"], answer: 0, competency: "multiplication-fractions", form: "A" },
    { id: "7fd2", text: "What is 3/4 ÷ 1/2?", options: ["3/2", "3/8", "2/3", "1/2"], answer: 0, competency: "division-fractions", form: "A" },
    { id: "7fd3", text: "What is 2.5 × 1.2?", options: ["3.0", "3.7", "2.7", "3.12"], answer: 0, competency: "multiplication-decimals", form: "A" },
    { id: "7fd4", text: "What is 4.5 ÷ 0.5?", options: ["9", "4", "0.9", "2.25"], answer: 0, competency: "division-decimals", form: "A" },
    { id: "7fd5", text: "A rope is 8.5m long. If cut into pieces of 0.5m each, how many pieces?", options: ["17", "8", "9", "4"], answer: 0, competency: "word-problems", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "7fd6", text: "Evaluate: 4/9 × 3/8", options: ["1/6", "7/17", "12/17", "1/12"], answer: 0, competency: "multiplication-fractions", form: "B" },
    { id: "7fd7", text: "Evaluate: 5/6 ÷ 2/3", options: ["5/4", "10/18", "4/5", "15/12"], answer: 0, competency: "division-fractions", form: "B" },
    { id: "7fd8", text: "What is 1.5 × 0.04?", options: ["0.06", "0.6", "0.006", "0.60"], answer: 0, competency: "multiplication-decimals", form: "B" },
    { id: "7fd9", text: "Evaluate: 3.6 ÷ 0.12", options: ["30", "3", "0.3", "300"], answer: 0, competency: "division-decimals", form: "B" },
    { id: "7fd10", text: "A vehicle travels 43.2 km on 2.4 liters of petrol. How much distance does it cover on 1 liter?", options: ["18 km", "16 km", "20 km", "14.4 km"], answer: 0, competency: "word-problems", form: "B" },
  ],

  "7_rational_numbers": [
    // Form A: Initial Diagnostic / Baseline
    { id: "7rn1", text: "Which is a rational number?", options: ["-3/7", "√2", "π", "None"], answer: 0, competency: "identification", form: "A" },
    { id: "7rn2", text: "What is (-2/3) + (4/3)?", options: ["2/3", "-2/3", "6/3", "-6/3"], answer: 0, competency: "addition", form: "A" },
    { id: "7rn3", text: "The additive inverse of -5/8 is:", options: ["5/8", "-5/8", "8/5", "-8/5"], answer: 0, competency: "additive-inverse", form: "A" },
    { id: "7rn4", text: "What is (-1/2) × (4/5)?", options: ["-2/5", "2/5", "-4/10", "3/10"], answer: 0, competency: "multiplication", form: "A" },
    { id: "7rn5", text: "Represent -3/4 on a number line. It lies between:", options: ["-1 and 0", "0 and 1", "-2 and -1", "1 and 2"], answer: 0, competency: "number-line", form: "A" },
    { id: "7rn6", text: "Find a rational number between 1/4 and 1/2.", options: ["3/8", "1/3", "2/4", "1/8"], answer: 0, competency: "between-rationals", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "7rn7", text: "Which statement is true for the rational number -7/(-9)?", options: ["It is a positive rational number", "It is negative", "It is zero", "It is undefined"], answer: 0, competency: "identification", form: "B" },
    { id: "7rn8", text: "What is (-3/5) - (2/5)?", options: ["-1", "1", "-5/10", "1/5"], answer: 0, competency: "subtraction", form: "B" },
    { id: "7rn9", text: "What is the reciprocal of -13/17?", options: ["-17/13", "17/13", "13/17", "-13/17"], answer: 0, competency: "reciprocal", form: "B" },
    { id: "7rn10", text: "Evaluate: (-2/7) ÷ (4/21)", options: ["-3/2", "-8/147", "3/2", "8/147"], answer: 0, competency: "division", form: "B" },
    { id: "7rn11", text: "Which rational number is in standard form?", options: ["-3/5", "6/-10", "9/15", "12/-20"], answer: 0, competency: "standard-form", form: "B" },
  ],

  "7_simple_equations": [
    { id: "7se1", text: "Solve: x + 5 = 12", options: ["x = 7", "x = 17", "x = 5", "x = -7"], answer: 0, competency: "one-step" },
    { id: "7se2", text: "Solve: 3x = 21", options: ["x = 7", "x = 63", "x = 18", "x = 24"], answer: 0, competency: "one-step" },
    { id: "7se3", text: "Solve: 2x - 3 = 7", options: ["x = 5", "x = 2", "x = 10", "x = -5"], answer: 0, competency: "two-step" },
    { id: "7se4", text: "Solve: x/4 + 2 = 5", options: ["x = 12", "x = 3", "x = 28", "x = 7"], answer: 0, competency: "two-step" },
    { id: "7se5", text: "The sum of three consecutive numbers is 42. Find the smallest.", options: ["13", "14", "12", "15"], answer: 0, competency: "word-problems" },
    { id: "7se6", text: "Ravi's age after 15 years will be 4 times his present age. His present age?", options: ["5 years", "10 years", "15 years", "3 years"], answer: 0, competency: "word-problems" },
  ],

  "7_lines_angles": [
    { id: "7la1", text: "If two angles are complementary and one is 35°, the other is:", options: ["55°", "145°", "35°", "65°"], answer: 0, competency: "complementary" },
    { id: "7la2", text: "Vertically opposite angles are:", options: ["Equal", "Supplementary", "Complementary", "Adjacent"], answer: 0, competency: "vertical-angles" },
    { id: "7la3", text: "If a transversal cuts two parallel lines, alternate interior angles are:", options: ["Equal", "Supplementary", "Complementary", "Unequal"], answer: 0, competency: "parallel-transversal" },
    { id: "7la4", text: "The supplement of 110° is:", options: ["70°", "250°", "80°", "20°"], answer: 0, competency: "supplementary" },
    { id: "7la5", text: "Two adjacent angles on a straight line sum to:", options: ["180°", "360°", "90°", "270°"], answer: 0, competency: "linear-pair" },
  ],

  "7_triangles": [
    { id: "7t1", text: "If two angles of a triangle are 60° and 70°, the third angle is:", options: ["50°", "60°", "70°", "80°"], answer: 0, competency: "angle-sum" },
    { id: "7t2", text: "An exterior angle of a triangle equals:", options: ["Sum of two interior opposite angles", "Sum of all three angles", "The adjacent interior angle", "180°"], answer: 0, competency: "exterior-angle" },
    { id: "7t3", text: "Can a triangle have sides 3cm, 4cm, and 8cm?", options: ["No", "Yes", "Sometimes", "Need more info"], answer: 0, competency: "triangle-inequality" },
    { id: "7t4", text: "Two triangles are congruent by SAS when:", options: ["Two sides and the included angle are equal", "Two sides and any angle are equal", "Three sides are equal", "Three angles are equal"], answer: 0, competency: "congruence" },
    { id: "7t5", text: "In a right triangle, the side opposite the right angle is called:", options: ["Hypotenuse", "Base", "Height", "Perpendicular"], answer: 0, competency: "right-triangle" },
  ],

  "7_algebraic_expressions": [
    { id: "7ae1", text: "How many terms are in 3x² + 5x - 7?", options: ["3", "2", "1", "5"], answer: 0, competency: "terms" },
    { id: "7ae2", text: "What is (3x + 2) + (5x - 4)?", options: ["8x - 2", "8x + 6", "2x - 2", "15x - 8"], answer: 0, competency: "addition" },
    { id: "7ae3", text: "Subtract (2a + 3b) from (5a + 7b):", options: ["3a + 4b", "7a + 10b", "-3a - 4b", "3a - 4b"], answer: 0, competency: "subtraction" },
    { id: "7ae4", text: "In 4xy, the coefficient of x is:", options: ["4y", "4", "xy", "y"], answer: 0, competency: "coefficients" },
    { id: "7ae5", text: "Which are like terms?", options: ["3x² and -5x²", "3x and 3x²", "2x and 2y", "x² and x³"], answer: 0, competency: "like-terms" },
  ],

  "7_exponents_powers": [
    { id: "7ep1", text: "What is 2⁴?", options: ["16", "8", "6", "32"], answer: 0, competency: "basic-exponents" },
    { id: "7ep2", text: "Simplify: 3² × 3³", options: ["3⁵", "3⁶", "9⁵", "9⁶"], answer: 0, competency: "laws-multiplication" },
    { id: "7ep3", text: "What is (5²)³?", options: ["5⁶", "5⁵", "5⁸", "5⁹"], answer: 0, competency: "power-of-power" },
    { id: "7ep4", text: "Simplify: 7⁵ ÷ 7²", options: ["7³", "7⁷", "7¹⁰", "1³"], answer: 0, competency: "laws-division" },
    { id: "7ep5", text: "Express 100000 in standard form:", options: ["10⁵", "10⁶", "5¹⁰", "10⁴"], answer: 0, competency: "standard-form" },
  ],

  "7_ratio_proportion_adv": [
    { id: "7rpa1", text: "Convert 3/8 to a percentage:", options: ["37.5%", "38%", "30%", "3.8%"], answer: 0, competency: "fraction-to-percent" },
    { id: "7rpa2", text: "A shirt costs ₹500 and is sold at ₹600. The profit percentage is:", options: ["20%", "100%", "10%", "16.67%"], answer: 0, competency: "profit-loss" },
    { id: "7rpa3", text: "Simple interest on ₹5000 at 10% for 2 years is:", options: ["₹1000", "₹500", "₹1500", "₹100"], answer: 0, competency: "simple-interest" },
    { id: "7rpa4", text: "If 60% of a number is 48, the number is:", options: ["80", "60", "72", "28.8"], answer: 0, competency: "percentage-problems" },
    { id: "7rpa5", text: "A book marked at ₹200 is sold at a discount of 15%. The selling price is:", options: ["₹170", "₹185", "₹30", "₹215"], answer: 0, competency: "discount" },
  ],

  "7_perimeter_area": [
    { id: "7pa1", text: "Area of a triangle with base 10cm and height 6cm is:", options: ["30 sq cm", "60 sq cm", "16 sq cm", "100 sq cm"], answer: 0, competency: "area-triangle" },
    { id: "7pa2", text: "Area of a parallelogram with base 8cm and height 5cm is:", options: ["40 sq cm", "26 sq cm", "20 sq cm", "80 sq cm"], answer: 0, competency: "area-parallelogram" },
    { id: "7pa3", text: "The circumference of a circle with radius 7cm is (use π = 22/7):", options: ["44 cm", "22 cm", "154 cm", "88 cm"], answer: 0, competency: "circumference" },
    { id: "7pa4", text: "Area of a circle with radius 14cm is (use π = 22/7):", options: ["616 sq cm", "88 sq cm", "308 sq cm", "44 sq cm"], answer: 0, competency: "area-circle" },
    { id: "7pa5", text: "A parallelogram and a rectangle have the same base and height. Their areas are:", options: ["Equal", "Parallelogram is larger", "Rectangle is larger", "Cannot compare"], answer: 0, competency: "comparison" },
  ],

  // ===== CLASS 8 =====

  "8_rational_numbers_adv": [
    // Form A: Initial Diagnostic / Baseline
    { id: "8rna1", text: "Which property is shown: a × (b + c) = a×b + a×c for rationals?", options: ["Distributive", "Commutative", "Associative", "Closure"], answer: 0, competency: "properties", form: "A" },
    { id: "8rna2", text: "The multiplicative inverse of -2/3 is:", options: ["-3/2", "2/3", "3/2", "-2/3"], answer: 0, competency: "multiplicative-inverse", form: "A" },
    { id: "8rna3", text: "Find a rational number between 1/3 and 1/2 using mean method:", options: ["5/12", "2/5", "1/4", "2/3"], answer: 0, competency: "between-rationals", form: "A" },
    { id: "8rna4", text: "What is the additive identity for rational numbers?", options: ["0", "1", "-1", "No identity exists"], answer: 0, competency: "identity-elements", form: "A" },
    { id: "8rna5", text: "Is subtraction commutative for rational numbers?", options: ["No", "Yes", "Only for positive", "Only for integers"], answer: 0, competency: "properties", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "8rna6", text: "Which property guarantees that the sum of any two rational numbers is always a rational number?", options: ["Closure Property", "Commutative Property", "Associative Property", "Distributive Property"], answer: 0, competency: "properties-closure", form: "B" },
    { id: "8rna7", text: "What is the additive inverse of -7/19?", options: ["7/19", "-19/7", "19/7", "-7/19"], answer: 0, competency: "additive-inverse", form: "B" },
    { id: "8rna8", text: "Find a rational number strictly between 1/4 and 3/4:", options: ["1/2", "4/4", "1/8", "7/8"], answer: 0, competency: "between-rationals", form: "B" },
    { id: "8rna9", text: "The multiplicative identity element for all rational numbers is:", options: ["1", "0", "-1", "Does not exist"], answer: 0, competency: "identity-elements", form: "B" },
    { id: "8rna10", text: "Is division associative for rational numbers?", options: ["No", "Yes", "Always", "Only for positive"], answer: 0, competency: "properties-associativity", form: "B" },
  ],

  "8_linear_equations": [
    // Form A: Initial Diagnostic / Baseline
    { id: "8le1", text: "Solve: 3x + 4 = 2x + 10", options: ["x = 6", "x = 14", "x = 2", "x = -6"], answer: 0, competency: "variable-both-sides", form: "A" },
    { id: "8le2", text: "Solve: (2x - 1)/3 = 5", options: ["x = 8", "x = 7", "x = 3", "x = 16"], answer: 0, competency: "reducing-to-linear", form: "A" },
    { id: "8le3", text: "Solve: 5(x - 2) = 3(x + 4)", options: ["x = 11", "x = 7", "x = -1", "x = 22"], answer: 0, competency: "brackets", form: "A" },
    { id: "8le4", text: "The sum of two numbers is 45 and their difference is 11. Find the larger number.", options: ["28", "17", "22", "34"], answer: 0, competency: "word-problems", form: "A" },
    { id: "8le5", text: "Solve: x/2 + x/3 = 10", options: ["x = 12", "x = 15", "x = 6", "x = 30"], answer: 0, competency: "fractional-equations", form: "A" },
    { id: "8le6", text: "A number is 7 more than its half. Find the number.", options: ["14", "7", "21", "10"], answer: 0, competency: "word-problems", form: "A" },
    // Form B: Parallel Reassessment Items
    { id: "8le7", text: "Solve: 7x - 5 = 2x + 25", options: ["x = 6", "x = 4", "x = 5", "x = 30"], answer: 0, competency: "variable-both-sides", form: "B" },
    { id: "8le8", text: "Solve: (3x + 1)/5 = 2", options: ["x = 3", "x = 5", "x = 9", "x = 11/3"], answer: 0, competency: "reducing-to-linear", form: "B" },
    { id: "8le9", text: "Solve: 4(x + 1) = 2(x + 8)", options: ["x = 6", "x = 8", "x = 12", "x = 4"], answer: 0, competency: "brackets", form: "B" },
    { id: "8le10", text: "The perimeter of a rectangle is 40cm. Its length is 4cm more than its breadth. Find the length.", options: ["12 cm", "8 cm", "14 cm", "10 cm"], answer: 0, competency: "word-problems", form: "B" },
    { id: "8le11", text: "Solve: 2x/3 - x/4 = 5", options: ["x = 12", "x = 10", "x = 6", "x = 15"], answer: 0, competency: "fractional-equations", form: "B" },
  ],

  "8_algebraic_expressions": [
    { id: "8ae1", text: "Expand: (x + 3)(x + 5)", options: ["x² + 8x + 15", "x² + 15x + 8", "x² + 2x + 15", "2x + 8"], answer: 0, competency: "multiplication" },
    { id: "8ae2", text: "Using identity, expand (a + b)² when a=2, b=3:", options: ["25", "13", "10", "12"], answer: 0, competency: "identity-a-plus-b-squared" },
    { id: "8ae3", text: "What is (x + 4)(x - 4)?", options: ["x² - 16", "x² + 16", "x² - 8x", "x² + 8x - 16"], answer: 0, competency: "identity-a-plus-b-a-minus-b" },
    { id: "8ae4", text: "Expand (3x - 2)²:", options: ["9x² - 12x + 4", "9x² + 12x + 4", "9x² - 4", "3x² - 12x + 4"], answer: 0, competency: "identity-a-minus-b-squared" },
    { id: "8ae5", text: "Find the product: (2x)(3x² + 5x - 4)", options: ["6x³ + 10x² - 8x", "6x² + 10x - 8", "5x³ + 7x² - 4x", "6x³ + 5x - 4"], answer: 0, competency: "monomial-polynomial" },
  ],

  "8_exponents_powers": [
    { id: "8ep1", text: "What is 2⁻³?", options: ["1/8", "-8", "-6", "8"], answer: 0, competency: "negative-exponents" },
    { id: "8ep2", text: "Simplify: (3⁻² × 3⁴)", options: ["9", "3⁶", "1/9", "3⁻²"], answer: 0, competency: "laws-with-negatives" },
    { id: "8ep3", text: "Express 0.00025 in standard form:", options: ["2.5 × 10⁻⁴", "25 × 10⁻⁵", "2.5 × 10⁴", "0.25 × 10⁻³"], answer: 0, competency: "standard-form-small" },
    { id: "8ep4", text: "What is (2/3)⁻²?", options: ["9/4", "4/9", "-4/9", "6/9"], answer: 0, competency: "negative-exp-fractions" },
    { id: "8ep5", text: "Simplify: (5⁰ + 3⁰) × 2⁰", options: ["2", "1", "0", "3"], answer: 0, competency: "zero-exponent" },
  ],

  "8_direct_inverse_proportion": [
    { id: "8dip1", text: "If 4 books cost ₹120, what do 7 books cost?", options: ["₹210", "₹168", "₹280", "₹84"], answer: 0, competency: "direct-proportion" },
    { id: "8dip2", text: "If 6 workers can complete a job in 12 days, how many days for 9 workers?", options: ["8 days", "18 days", "6 days", "15 days"], answer: 0, competency: "inverse-proportion" },
    { id: "8dip3", text: "Which is a case of direct proportion?", options: ["More items, more cost", "More speed, less time", "More workers, less days", "Faster pump, less time"], answer: 0, competency: "identification" },
    { id: "8dip4", text: "A car travels 180km in 3 hours. Distance in 5 hours at same speed?", options: ["300 km", "360 km", "540 km", "60 km"], answer: 0, competency: "direct-proportion" },
    { id: "8dip5", text: "If x and y are inversely proportional and x=4, y=6, find y when x=8.", options: ["3", "12", "48", "2"], answer: 0, competency: "inverse-proportion" },
  ],

  "8_comparing_quantities": [
    { id: "8cq1", text: "Find CI on ₹10000 at 10% for 2 years:", options: ["₹2100", "₹2000", "₹1000", "₹1100"], answer: 0, competency: "compound-interest" },
    { id: "8cq2", text: "A shirt marked ₹800 is sold at 20% discount. Selling price?", options: ["₹640", "₹780", "₹160", "₹960"], answer: 0, competency: "discount" },
    { id: "8cq3", text: "If a price increases by 10% and then by 10%, net increase is:", options: ["21%", "20%", "22%", "11%"], answer: 0, competency: "successive-percentage" },
    { id: "8cq4", text: "VAT of 5% is charged on an item costing ₹1000. Total cost?", options: ["₹1050", "₹1500", "₹950", "₹1005"], answer: 0, competency: "tax" },
    { id: "8cq5", text: "Difference between CI and SI on ₹5000 at 10% for 2 years:", options: ["₹50", "₹100", "₹0", "₹500"], answer: 0, competency: "ci-si-difference" },
  ],

  "8_quadrilaterals": [
    { id: "8q1", text: "The sum of angles in a quadrilateral is:", options: ["360°", "180°", "540°", "270°"], answer: 0, competency: "angle-sum" },
    { id: "8q2", text: "A parallelogram has:", options: ["Opposite sides parallel and equal", "All sides equal", "All angles 90°", "Only one pair of parallel sides"], answer: 0, competency: "properties" },
    { id: "8q3", text: "A rhombus is a parallelogram with:", options: ["All sides equal", "All angles 90°", "Diagonals equal", "Only opposite sides equal"], answer: 0, competency: "special-types" },
    { id: "8q4", text: "Which quadrilateral has exactly one pair of parallel sides?", options: ["Trapezium", "Parallelogram", "Rectangle", "Rhombus"], answer: 0, competency: "identification" },
    { id: "8q5", text: "In a parallelogram, if one angle is 70°, the adjacent angle is:", options: ["110°", "70°", "290°", "180°"], answer: 0, competency: "angle-properties" },
  ],

  "8_mensuration": [
    { id: "8men1", text: "Surface area of a cube with side 5cm:", options: ["150 sq cm", "125 sq cm", "25 sq cm", "30 sq cm"], answer: 0, competency: "sa-cube" },
    { id: "8men2", text: "Volume of a cuboid 4cm × 5cm × 6cm:", options: ["120 cu cm", "60 cu cm", "15 cu cm", "240 cu cm"], answer: 0, competency: "volume-cuboid" },
    { id: "8men3", text: "Volume of a cylinder with radius 7cm and height 10cm (π=22/7):", options: ["1540 cu cm", "440 cu cm", "770 cu cm", "220 cu cm"], answer: 0, competency: "volume-cylinder" },
    { id: "8men4", text: "Lateral surface area of a cuboid 3cm × 4cm × 5cm:", options: ["70 sq cm", "94 sq cm", "60 sq cm", "47 sq cm"], answer: 0, competency: "lsa-cuboid" },
    { id: "8men5", text: "Total surface area of a cylinder with r=3cm, h=7cm (π=22/7):", options: ["188.57 sq cm", "132 sq cm", "66 sq cm", "264 sq cm"], answer: 0, competency: "tsa-cylinder" },
  ],

  "8_factorisation": [
    { id: "8fac1", text: "Factorise: x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x+5)(x+1)", "(x-2)(x-3)"], answer: 0, competency: "trinomial" },
    { id: "8fac2", text: "Factorise: a² - 9", options: ["(a+3)(a-3)", "(a-9)(a+1)", "(a+9)(a-9)", "(a-3)²"], answer: 0, competency: "difference-of-squares" },
    { id: "8fac3", text: "Factorise: 4x² + 12x + 9", options: ["(2x+3)²", "(4x+3)(x+3)", "(2x+9)(2x+1)", "(2x-3)²"], answer: 0, competency: "perfect-square" },
    { id: "8fac4", text: "Divide: 10x³ by 2x", options: ["5x²", "5x³", "8x²", "5x"], answer: 0, competency: "division" },
    { id: "8fac5", text: "Factorise: 3xy + 6x", options: ["3x(y+2)", "3(xy+6x)", "6x(y+1)", "3xy(1+2)"], answer: 0, competency: "common-factor" },
  ],

  "8_squares_square_roots": [
    { id: "8ssr1", text: "Is 256 a perfect square?", options: ["Yes (16²)", "No", "Yes (15²)", "Cannot determine"], answer: 0, competency: "identification" },
    { id: "8ssr2", text: "The square root of 144 is:", options: ["12", "14", "11", "13"], answer: 0, competency: "square-roots" },
    { id: "8ssr3", text: "Which property: the square of an odd number is always odd?", options: ["True", "False", "Only for primes", "Only for single digits"], answer: 0, competency: "properties" },
    { id: "8ssr4", text: "Find √625 by prime factorisation:", options: ["25", "125", "5", "50"], answer: 0, competency: "prime-factorisation" },
    { id: "8ssr5", text: "How many non-perfect-square numbers lie between 12² and 13²?", options: ["24", "25", "12", "13"], answer: 0, competency: "patterns" },
  ],

  "8_cubes_cube_roots": [
    { id: "8ccr1", text: "What is the cube of 5?", options: ["125", "15", "25", "625"], answer: 0, competency: "cubes" },
    { id: "8ccr2", text: "Is 500 a perfect cube?", options: ["No", "Yes", "Cannot determine", "Yes (cube of 5)"], answer: 0, competency: "identification" },
    { id: "8ccr3", text: "The cube root of 216 is:", options: ["6", "36", "12", "18"], answer: 0, competency: "cube-roots" },
    { id: "8ccr4", text: "The cube root of -27 is:", options: ["-3", "3", "-9", "9"], answer: 0, competency: "negative-cubes" },
    { id: "8ccr5", text: "Find the smallest number by which 72 must be multiplied to get a perfect cube:", options: ["3", "2", "6", "9"], answer: 0, competency: "making-perfect-cube" },
  ],

  "8_data_handling": [
    { id: "8dh1", text: "In a pie chart, the total angle at the centre is:", options: ["360°", "180°", "90°", "270°"], answer: 0, competency: "pie-chart" },
    { id: "8dh2", text: "A die is thrown. The probability of getting a number less than 3 is:", options: ["1/3", "1/2", "2/3", "1/6"], answer: 0, competency: "basic-probability" },
    { id: "8dh3", text: "In a grouped frequency table, the class interval 10-20 has frequency 8. The class mark is:", options: ["15", "10", "20", "8"], answer: 0, competency: "frequency-distribution" },
    { id: "8dh4", text: "Which graph uses rectangular bars with no gaps for continuous data?", options: ["Histogram", "Bar graph", "Pie chart", "Line graph"], answer: 0, competency: "graph-types" },
    { id: "8dh5", text: "A coin is tossed twice. How many outcomes are possible?", options: ["4", "2", "3", "8"], answer: 0, competency: "sample-space" },
  ],

  "8_graphs": [
    { id: "8g1", text: "In which quadrant does the point (-3, 4) lie?", options: ["II", "I", "III", "IV"], answer: 0, competency: "quadrants" },
    { id: "8g2", text: "The coordinates of the origin are:", options: ["(0, 0)", "(1, 1)", "(0, 1)", "(1, 0)"], answer: 0, competency: "basics" },
    { id: "8g3", text: "A distance-time graph is a straight line. This means the object is:", options: ["Moving at constant speed", "Accelerating", "At rest", "Decelerating"], answer: 0, competency: "interpreting-graphs" },
    { id: "8g4", text: "Plot points (1,2), (2,4), (3,6). They form:", options: ["A straight line", "A curve", "A triangle", "No pattern"], answer: 0, competency: "linear-patterns" },
    { id: "8g5", text: "Which axis is the horizontal axis?", options: ["X-axis", "Y-axis", "Z-axis", "Origin"], answer: 0, competency: "basics" },
  ],
};

export default questions;

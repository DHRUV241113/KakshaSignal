// Learning content for each knowledge graph node
// Each entry contains a concise explanation + key examples
// Referenced from NCERT textbook chapter explanations

const learningContent = {
  "6_whole_numbers": {
    title: "Whole Numbers",
    classs: 6,
    explanation: `**Whole numbers** are the counting numbers starting from 0: {0, 1, 2, 3, 4, ...}

**Key Concepts:**
• **Predecessor**: The number just before (predecessor of 5 is 4)
• **Successor**: The number just after (successor of 5 is 6)
• **Number Line**: Whole numbers can be shown on a line, with equal spacing

**Properties of Whole Numbers:**
1. **Closure**: Adding or multiplying two whole numbers always gives a whole number
2. **Commutative**: a + b = b + a and a × b = b × a
3. **Associative**: (a + b) + c = a + (b + c)
4. **Distributive**: a × (b + c) = a × b + a × c — this is very useful for quick calculations!

**Example**: 25 × 104 = 25 × (100 + 4) = 2500 + 100 = 2600`,
    keyFormulas: ["Successor of n = n + 1", "Predecessor of n = n - 1", "a × (b + c) = a × b + a × c"],
    tips: ["0 is a whole number but NOT a natural number", "Division by zero is not defined", "Use the distributive property to simplify mental math"]
  },

  "6_integers": {
    title: "Integers",
    classs: 6,
    explanation: `**Integers** include all whole numbers and their negatives: {..., -3, -2, -1, 0, 1, 2, 3, ...}

**Key Concepts:**
• Positive integers: 1, 2, 3, ... (to the right of 0 on number line)
• Negative integers: -1, -2, -3, ... (to the left of 0 on number line)
• Zero is neither positive nor negative

**Addition Rules:**
• Same signs: Add the values, keep the sign → (-3) + (-5) = -8
• Different signs: Subtract smaller from larger, keep sign of larger → (-8) + 3 = -5

**Subtraction**: Change it to addition of the opposite → 5 - (-3) = 5 + 3 = 8

**Real-life uses**: Temperature (below zero), depth (below sea level), bank balance (debt)`,
    keyFormulas: ["a - (-b) = a + b", "(-a) + (-b) = -(a + b)", "|a| = distance from 0"],
    tips: ["Think of a number line: right is positive, left is negative", "Subtracting a negative = adding a positive"]
  },

  "6_fractions": {
    title: "Fractions",
    classs: 6,
    explanation: `A **fraction** represents a part of a whole. Written as **a/b** where a = numerator, b = denominator.

**Types:**
• **Proper**: numerator < denominator (e.g., 3/4)
• **Improper**: numerator ≥ denominator (e.g., 7/3)
• **Mixed**: whole number + fraction (e.g., 2⅓)

**Converting**: Mixed → Improper: 2⅓ = (2×3 + 1)/3 = 7/3
Improper → Mixed: 7/3 = 2 remainder 1 = 2⅓

**Equivalent Fractions**: Multiply/divide both parts by same number: 1/2 = 2/4 = 3/6

**Adding/Subtracting**: Make denominators same (LCM), then add/subtract numerators
• 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2

**Comparing**: Convert to same denominator, then compare numerators`,
    keyFormulas: ["a/b + c/b = (a+c)/b", "Mixed to improper: whole×denom + numer / denom", "Equivalent: a/b = (a×n)/(b×n)"],
    tips: ["Always simplify your final answer", "LCM of denominators helps in addition", "A pizza cut into 4 pieces: 1 piece = 1/4"]
  },

  "6_decimals": {
    title: "Decimals",
    classs: 6,
    explanation: `**Decimals** are another way to write fractions whose denominators are 10, 100, 1000, etc.

**Place Values**: 27.35 means 2 tens + 7 ones + 3 tenths + 5 hundredths

**Converting**:
• Fraction → Decimal: 3/4 = 0.75 (divide 3 by 4)
• Decimal → Fraction: 0.25 = 25/100 = 1/4

**Comparing**: Compare digit by digit from left: 0.5 > 0.05 (because 5 tenths > 0 tenths)

**Operations**: Line up decimal points when adding or subtracting
• 2.50 + 3.75 = 6.25`,
    keyFormulas: ["1 tenth = 0.1 = 1/10", "1 hundredth = 0.01 = 1/100", "Align decimal points for +/-"],
    tips: ["Add trailing zeros to make comparison easier: 0.5 = 0.50", "Money uses decimals: ₹10.50 = 10 rupees 50 paise"]
  },

  "6_basic_geometry": {
    title: "Basic Geometrical Ideas",
    classs: 6,
    explanation: `**Points, Lines, and Shapes** are the building blocks of geometry.

**Basics:**
• **Point**: A location with no size (marked by a dot)
• **Line**: Extends infinitely in both directions (←——→)
• **Ray**: Starts at a point, extends infinitely in one direction (●——→)
• **Line Segment**: Part of a line with two endpoints (●——●)

**Angles**: Formed when two rays meet at a point
• Acute: < 90° | Right: = 90° | Obtuse: > 90° and < 180°

**Triangles**: 3 sides, 3 angles, angle sum = 180°

**Quadrilaterals**: 4 sides, 4 angles, angle sum = 360°, have 2 diagonals

**Circles**: Set of all points at equal distance (radius) from centre
• Diameter = 2 × Radius (longest chord)`,
    keyFormulas: ["Triangle angle sum = 180°", "Quadrilateral angle sum = 360°", "Diameter = 2 × Radius"],
    tips: ["A ray has 1 endpoint, a line segment has 2, a line has none", "The diameter is the longest chord of a circle"]
  },

  "6_algebra_intro": {
    title: "Introduction to Algebra",
    classs: 6,
    explanation: `**Algebra** uses letters (variables) to represent unknown numbers.

**Key Ideas:**
• **Variable**: A letter that can take different values (x, y, n)
• **Constant**: A fixed number (5, -3, 100)
• **Expression**: A combination like 3x + 2

**Using Variables in Rules:**
• "Add 5 to a number" → n + 5
• "Triple a number and subtract 1" → 3n - 1

**Substitution**: If x = 4, then 2x + 3 = 2(4) + 3 = 11

**Forming Equations**: "A number plus 7 equals 15" → x + 7 = 15

**Coefficients**: In 5y, the coefficient of y is 5`,
    keyFormulas: ["Expression = terms connected by + or -", "Coefficient = number multiplying a variable", "Equation has an = sign"],
    tips: ["A variable is like a box that holds a number — we just don't know which one yet", "Practice converting English sentences to algebraic expressions"]
  },

  "6_ratio_proportion": {
    title: "Ratio and Proportion",
    classs: 6,
    explanation: `**Ratio** compares two quantities of the same kind: a:b = a/b

**Simplifying**: Divide both by their HCF → 15:25 = 3:5

**Proportion**: Two ratios are equal → a:b :: c:d means a/b = c/d
• Check: ad = bc (cross multiplication)

**Unitary Method**: Find the value of 1 unit first, then multiply
• 5 pens cost ₹75 → 1 pen = ₹15 → 8 pens = ₹120`,
    keyFormulas: ["a:b = a/b", "Proportion: a/b = c/d ⟹ ad = bc", "Unitary: find per-unit value first"],
    tips: ["Ratios have no units — they compare", "The unitary method works for almost all proportion problems"]
  },

  "6_mensuration_perimeter_area": {
    title: "Perimeter and Area",
    classs: 6,
    explanation: `**Perimeter** = total length around a shape | **Area** = space inside a shape

**Rectangle**: Perimeter = 2(l + b) | Area = l × b
**Square**: Perimeter = 4s | Area = s²
**Triangle**: Perimeter = sum of all 3 sides

**Units**: Length in cm/m → Area in cm²/m²

**Example**: Rectangle 8cm × 5cm → Perimeter = 2(8+5) = 26cm, Area = 40 sq cm`,
    keyFormulas: ["Perimeter of rectangle = 2(l + b)", "Area of rectangle = l × b", "Area of square = s²"],
    tips: ["Perimeter is measured in length units, area in square units", "Don't confuse perimeter (fence around) with area (carpet inside)"]
  },

  "7_integers_ops": {
    title: "Integers — Multiplication & Division",
    classs: 7,
    explanation: `Extending integer operations to multiplication and division.

**Multiplication Rules:**
• Positive × Positive = Positive → 3 × 5 = 15
• Negative × Negative = Positive → (-3) × (-5) = 15
• Positive × Negative = Negative → 3 × (-5) = -15
• Negative × Positive = Negative → (-3) × 5 = -15

**Quick Rule**: Same signs → positive result | Different signs → negative result

**Division**: Same rule applies → (-20) ÷ 4 = -5 | (-20) ÷ (-4) = 5

**Properties**: Distributive property works: a × (b + c) = ab + ac`,
    keyFormulas: ["(−) × (−) = (+)", "(+) × (−) = (−)", "Same sign rules apply to division"],
    tips: ["Count the negative signs: even number = positive, odd = negative", "(-1) × (-1) × (-1) = -1 (three negatives = negative)"]
  },

  "7_fractions_decimals": {
    title: "Fractions and Decimals — Multiplication & Division",
    classs: 7,
    explanation: `**Multiplying Fractions**: Multiply numerators together and denominators together.
• 2/5 × 3/7 = 6/35

**Dividing Fractions**: Multiply by the reciprocal (flip the second fraction).
• 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2

**Multiplying Decimals**: Multiply as whole numbers, then place the decimal point.
• 2.5 × 1.2 → 25 × 12 = 300 → 2 decimal places → 3.00 = 3.0

**Dividing Decimals**: Move decimal points to make divisor whole.
• 4.5 ÷ 0.5 → 45 ÷ 5 = 9`,
    keyFormulas: ["a/b × c/d = ac/bd", "a/b ÷ c/d = a/b × d/c", "Reciprocal of a/b = b/a"],
    tips: ["Dividing by a fraction = multiplying by its reciprocal", "Cancel common factors before multiplying for simpler answers"]
  },

  "7_rational_numbers": {
    title: "Rational Numbers",
    classs: 7,
    explanation: `A **rational number** is any number that can be written as p/q where q ≠ 0.

This includes: integers (5 = 5/1), fractions (3/4), negative fractions (-2/3)

**Operations**: Same rules as fractions — find common denominator for +/-, multiply/divide directly.

**Additive Inverse**: The number that adds to give 0 → additive inverse of -5/8 is 5/8

**Number Line**: Rational numbers fill in the gaps between integers
• -3/4 lies between -1 and 0

**Between any two rationals, there are infinitely many rationals.**
• Between 1/4 and 1/2: use mean → (1/4 + 1/2)/2 = (3/4)/2 = 3/8`,
    keyFormulas: ["p/q where q ≠ 0", "Additive inverse of a/b = -a/b", "Mean method: (a+b)/2 finds a number between a and b"],
    tips: ["Every integer is a rational number", "Every fraction is a rational number", "Irrational numbers like √2, π are NOT rational"]
  },

  "7_simple_equations": {
    title: "Simple Equations",
    classs: 7,
    explanation: `An **equation** is a statement where two expressions are equal, with an unknown variable.

**Solving Strategy**: Get the variable alone on one side.

**Method 1 — Balancing**: Do the same operation on both sides
• x + 5 = 12 → subtract 5 from both sides → x = 7

**Method 2 — Transposing**: Move terms to the other side (change sign)
• 2x - 3 = 7 → 2x = 7 + 3 = 10 → x = 5

**Word Problems**: Translate English to equation
• "The sum of three consecutive numbers is 42" → x + (x+1) + (x+2) = 42 → 3x + 3 = 42 → x = 13`,
    keyFormulas: ["Transpose: change side = change sign", "ax + b = c → x = (c - b)/a", "Check: substitute answer back"],
    tips: ["Always verify your answer by substituting back", "For word problems: identify the unknown, write the equation, then solve"]
  },

  "7_lines_angles": {
    title: "Lines and Angles",
    classs: 7,
    explanation: `**Angle Relationships:**
• **Complementary**: Sum = 90° (complement of 35° = 55°)
• **Supplementary**: Sum = 180° (supplement of 110° = 70°)
• **Linear Pair**: Adjacent angles on a straight line → sum = 180°
• **Vertically Opposite**: When two lines intersect → these angles are EQUAL

**Parallel Lines + Transversal:**
When a line crosses two parallel lines:
• **Alternate interior angles** are equal
• **Co-interior (same-side) angles** are supplementary (sum = 180°)
• **Corresponding angles** are equal`,
    keyFormulas: ["Complementary: a + b = 90°", "Supplementary: a + b = 180°", "Vertically opposite angles are equal"],
    tips: ["Look for Z-pattern (alternate angles) and F-pattern (corresponding angles)", "Linear pair angles always add to 180°"]
  },

  "7_triangles": {
    title: "Triangles and Their Properties",
    classs: 7,
    explanation: `**Angle Sum Property**: The three angles of any triangle add up to **180°**.

**Exterior Angle Theorem**: An exterior angle = sum of two non-adjacent interior angles.

**Triangle Inequality**: The sum of any two sides must be GREATER than the third side.
• Can 3, 4, 8 form a triangle? 3 + 4 = 7 < 8 → NO!

**Congruence** (two triangles are identical if):
• **SSS**: Three sides equal
• **SAS**: Two sides and included angle equal
• **ASA**: Two angles and included side equal
• **RHS**: Right angle + Hypotenuse + one Side equal`,
    keyFormulas: ["∠A + ∠B + ∠C = 180°", "Exterior angle = sum of remote interior angles", "a + b > c (triangle inequality)"],
    tips: ["For congruence, the 'included' angle/side matters — it must be between the other two", "SSA is NOT a valid congruence criterion (ambiguous case)"]
  },

  "7_algebraic_expressions": {
    title: "Algebraic Expressions",
    classs: 7,
    explanation: `**Terms**: Parts of an expression separated by + or -
• In 3x² + 5x - 7: three terms are 3x², 5x, and -7

**Like Terms**: Same variable part → 3x² and -5x² are like terms

**Coefficient**: The number part → in 4xy, coefficient of x is 4y

**Operations:**
• **Addition**: Combine like terms → (3x + 2) + (5x - 4) = 8x - 2
• **Subtraction**: Change signs of second expression, then add → (5a + 7b) - (2a + 3b) = 3a + 4b`,
    keyFormulas: ["Like terms have identical variable parts", "Add/subtract only like terms", "Coefficient = numerical factor"],
    tips: ["3x and 3x² are NOT like terms (different powers)", "When subtracting, change ALL signs inside the bracket being subtracted"]
  },

  "7_exponents_powers": {
    title: "Exponents and Powers",
    classs: 7,
    explanation: `**Exponent**: How many times to multiply a number by itself → 2⁴ = 2×2×2×2 = 16

**Laws of Exponents:**
1. aᵐ × aⁿ = aᵐ⁺ⁿ (same base, add powers)
2. aᵐ ÷ aⁿ = aᵐ⁻ⁿ (same base, subtract powers)
3. (aᵐ)ⁿ = aᵐˣⁿ (power of a power, multiply)
4. a⁰ = 1 (anything to the power 0 is 1, except 0⁰)
5. aᵐ × bᵐ = (ab)ᵐ (same power, different bases)

**Standard Form**: Large numbers → 100000 = 10⁵`,
    keyFormulas: ["aᵐ × aⁿ = aᵐ⁺ⁿ", "aᵐ ÷ aⁿ = aᵐ⁻ⁿ", "(aᵐ)ⁿ = aᵐⁿ", "a⁰ = 1"],
    tips: ["The base must be the same to use addition/subtraction of powers", "Standard form puts numbers as a × 10ⁿ where 1 ≤ a < 10"]
  },

  "7_ratio_proportion_adv": {
    title: "Comparing Quantities — Percentage, Profit & Loss",
    classs: 7,
    explanation: `**Percentage**: "Per hundred" → 45% = 45/100 = 0.45

**Converting**: Fraction → % : multiply by 100 → 3/8 × 100 = 37.5%

**Profit & Loss:**
• Profit = SP - CP | Loss = CP - SP
• Profit% = (Profit/CP) × 100
• Loss% = (Loss/CP) × 100

**Simple Interest**: SI = (P × R × T) / 100
• P = Principal, R = Rate%, T = Time in years
• Amount = P + SI`,
    keyFormulas: ["Percentage = (Part/Whole) × 100", "SI = PRT/100", "Profit% = (Profit/CP) × 100"],
    tips: ["Profit/Loss percentage is always calculated on Cost Price", "Simple Interest grows linearly — same amount each year"]
  },

  "7_perimeter_area": {
    title: "Perimeter and Area — Advanced Shapes",
    classs: 7,
    explanation: `**New formulas for Class 7:**

**Triangle**: Area = ½ × base × height

**Parallelogram**: Area = base × height (height is perpendicular distance)

**Circle**:
• Circumference = 2πr = πd
• Area = πr²
• Use π = 22/7 or 3.14

**Example**: Circle with radius 7cm:
• Circumference = 2 × 22/7 × 7 = 44 cm
• Area = 22/7 × 7 × 7 = 154 sq cm`,
    keyFormulas: ["Area of triangle = ½ × b × h", "Area of parallelogram = b × h", "Circumference = 2πr", "Area of circle = πr²"],
    tips: ["Height must be perpendicular to the base", "A rectangle is a special parallelogram, so same area formula works", "π ≈ 22/7 is used for calculations in CBSE"]
  },

  "8_rational_numbers_adv": {
    title: "Rational Numbers — Advanced Properties",
    classs: 8,
    explanation: `**Properties of Rational Numbers:**
1. **Closure**: Rationals are closed under +, -, × (not ÷ by 0)
2. **Commutativity**: a + b = b + a, a × b = b × a (NOT for - and ÷)
3. **Associativity**: Works for + and × (NOT for - and ÷)
4. **Distributive**: a(b + c) = ab + ac

**Identity Elements:**
• Additive identity: 0 (a + 0 = a)
• Multiplicative identity: 1 (a × 1 = a)

**Inverse:**
• Additive inverse of a/b = -a/b
• Multiplicative inverse of a/b = b/a (≠0)

**Dense property**: Between any two rationals, infinitely many rationals exist.
Mean method: number between a and b = (a + b)/2`,
    keyFormulas: ["Additive inverse: a + (-a) = 0", "Multiplicative inverse: a × (1/a) = 1", "Between a,b: (a+b)/2"],
    tips: ["Subtraction and division are NOT commutative or associative", "The multiplicative inverse of a negative is also negative"]
  },

  "8_linear_equations": {
    title: "Linear Equations in One Variable",
    classs: 8,
    explanation: `**Class 8 upgrade**: Now solving equations with variable on BOTH sides and more complex forms.

**Type 1 — Variable on both sides:**
• 3x + 4 = 2x + 10 → 3x - 2x = 10 - 4 → x = 6

**Type 2 — Equations with brackets:**
• 5(x - 2) = 3(x + 4) → 5x - 10 = 3x + 12 → 2x = 22 → x = 11

**Type 3 — Equations with fractions:**
• x/2 + x/3 = 10 → (3x + 2x)/6 = 10 → 5x = 60 → x = 12

**Type 4 — Reducible to linear form:**
• (2x - 1)/3 = 5 → 2x - 1 = 15 → 2x = 16 → x = 8`,
    keyFormulas: ["Transpose: move to other side, change sign", "Cross multiply for fraction equations", "Always check: substitute back"],
    tips: ["Expand brackets first, then collect variable terms on one side", "For fractions: multiply both sides by LCM of denominators"]
  },

  "8_algebraic_expressions": {
    title: "Algebraic Expressions and Identities",
    classs: 8,
    explanation: `**Standard Algebraic Identities:**
1. **(a + b)² = a² + 2ab + b²**
2. **(a - b)² = a² - 2ab + b²**
3. **(a + b)(a - b) = a² - b²**
4. **(x + a)(x + b) = x² + (a+b)x + ab**

**Multiplication of Expressions:**
• Monomial × Polynomial: 2x(3x² + 5x - 4) = 6x³ + 10x² - 8x
• Binomial × Binomial: (x + 3)(x + 5) = x² + 8x + 15

**Using Identities for Quick Calculation:**
• 102² = (100 + 2)² = 10000 + 400 + 4 = 10404
• 98 × 102 = (100-2)(100+2) = 10000 - 4 = 9996`,
    keyFormulas: ["(a+b)² = a² + 2ab + b²", "(a-b)² = a² - 2ab + b²", "(a+b)(a-b) = a² - b²"],
    tips: ["Memorize all 4 identities — they're used everywhere in Class 9 and 10", "These identities also help in quick mental arithmetic"]
  },

  "8_exponents_powers": {
    title: "Exponents and Powers — Negative Exponents",
    classs: 8,
    explanation: `**Negative Exponents**: a⁻ⁿ = 1/aⁿ
• 2⁻³ = 1/2³ = 1/8
• (2/3)⁻² = (3/2)² = 9/4

**All previous laws still apply:**
• 3⁻² × 3⁴ = 3⁻²⁺⁴ = 3² = 9
• 5⁰ = 1 (zero exponent rule still holds)

**Very Small Numbers in Standard Form:**
• 0.00025 = 2.5 × 10⁻⁴
• 0.000007 = 7 × 10⁻⁶`,
    keyFormulas: ["a⁻ⁿ = 1/aⁿ", "(a/b)⁻ⁿ = (b/a)ⁿ", "a⁰ = 1"],
    tips: ["Negative exponent means 'take the reciprocal'", "When multiplying powers with same base, ADD the exponents (even if negative)"]
  },

  "8_direct_inverse_proportion": {
    title: "Direct and Inverse Proportions",
    classs: 8,
    explanation: `**Direct Proportion**: When one quantity increases, the other increases at the same rate.
• x/y = constant
• More items → more cost | More distance → more time (at constant speed)

**Inverse Proportion**: When one increases, the other decreases proportionally.
• x × y = constant
• More workers → fewer days | More speed → less time

**Solving**: Set up the proportion, cross-multiply.

**Example (Direct)**: 4 books cost ₹120. Cost of 7 books?
→ 4/120 = 7/x → x = 120 × 7/4 = ₹210

**Example (Inverse)**: 6 workers in 12 days. How many days for 9 workers?
→ 6 × 12 = 9 × x → x = 72/9 = 8 days`,
    keyFormulas: ["Direct: x₁/y₁ = x₂/y₂", "Inverse: x₁ × y₁ = x₂ × y₂"],
    tips: ["Ask: does one going up make the other go up (direct) or down (inverse)?", "The unitary method still works well for direct proportion"]
  },

  "8_comparing_quantities": {
    title: "Comparing Quantities — Compound Interest, Tax, Discount",
    classs: 8,
    explanation: `**Compound Interest**: Interest calculated on principal + accumulated interest.
• A = P(1 + R/100)ⁿ | CI = A - P

**Example**: ₹10,000 at 10% for 2 years:
• A = 10000(1.1)² = 10000 × 1.21 = ₹12,100
• CI = ₹2,100 (vs SI = ₹2,000)

**Discount**: Reduction on Marked Price (MP)
• SP = MP - Discount | Discount = MP × Discount%/100

**Tax (VAT/GST)**: Added to selling price
• Total = SP + Tax | Tax = SP × Tax%/100

**Successive %**: 10% increase then 10% increase ≠ 20% increase!
• New = Original × 1.1 × 1.1 = Original × 1.21 → 21% increase`,
    keyFormulas: ["A = P(1 + R/100)ⁿ", "CI = A - P", "SP = MP × (1 - discount%/100)"],
    tips: ["CI > SI for the same P, R, T (when T > 1)", "Successive percentages: multiply the factors, don't just add percentages"]
  },

  "8_quadrilaterals": {
    title: "Understanding Quadrilaterals",
    classs: 8,
    explanation: `**Angle Sum**: Sum of all angles in any quadrilateral = **360°**

**Types (from general to specific):**

**Trapezium**: Exactly one pair of parallel sides

**Parallelogram**: Both pairs of opposite sides parallel
• Opposite sides equal | Opposite angles equal
• Diagonals bisect each other

**Rectangle**: Parallelogram + all angles 90°
• Diagonals are equal

**Rhombus**: Parallelogram + all sides equal
• Diagonals bisect each other at 90°

**Square**: Rectangle + Rhombus (all sides equal, all angles 90°)`,
    keyFormulas: ["Angle sum = 360°", "Parallelogram: opposite sides & angles equal", "Adjacent angles are supplementary in parallelogram"],
    tips: ["Every square is a rectangle AND a rhombus", "In a parallelogram: adjacent angles add to 180°"]
  },

  "8_mensuration": {
    title: "Mensuration — Surface Area and Volume",
    classs: 8,
    explanation: `**3D shapes** have surface area (outside covering) and volume (space inside).

**Cube (side = a):**
• LSA = 4a² | TSA = 6a² | Volume = a³

**Cuboid (l × b × h):**
• LSA = 2h(l + b) | TSA = 2(lb + bh + hl) | Volume = l × b × h

**Cylinder (radius r, height h):**
• CSA = 2πrh | TSA = 2πr(r + h) | Volume = πr²h`,
    keyFormulas: ["Cube: V = a³, TSA = 6a²", "Cuboid: V = lbh, TSA = 2(lb+bh+hl)", "Cylinder: V = πr²h, TSA = 2πr(r+h)"],
    tips: ["LSA/CSA = area without top and bottom", "TSA = LSA + area of top + area of bottom", "Volume is measured in cubic units (cm³, m³)"]
  },

  "8_factorisation": {
    title: "Factorisation",
    classs: 8,
    explanation: `**Factorisation** = breaking an expression into a product of simpler expressions.

**Method 1 — Common Factor:**
• 3xy + 6x = 3x(y + 2)

**Method 2 — Grouping:**
• 2xy + 3x + 2y + 3 = x(2y+3) + 1(2y+3) = (x+1)(2y+3)

**Method 3 — Using Identities:**
• a² - 9 = a² - 3² = (a+3)(a-3) [difference of squares]
• 4x² + 12x + 9 = (2x)² + 2(2x)(3) + 3² = (2x+3)² [perfect square]
• x² + 5x + 6: find two numbers that multiply to 6 and add to 5 → 2,3 → (x+2)(x+3)

**Division**: 10x³ ÷ 2x = 5x²`,
    keyFormulas: ["a² - b² = (a+b)(a-b)", "a² + 2ab + b² = (a+b)²", "Divide coefficients and subtract powers"],
    tips: ["Always check for common factors first", "For x² + bx + c: find two numbers that multiply to c and add to b"]
  },

  "8_squares_square_roots": {
    title: "Squares and Square Roots",
    classs: 8,
    explanation: `**Perfect Square**: A number that is the square of a whole number.
• 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, ...

**Properties:**
• Square of even number is even, odd number is odd
• Perfect squares end in 0, 1, 4, 5, 6, or 9 (never 2, 3, 7, 8)

**Finding Square Roots:**
• **Prime Factorisation**: 144 = 2⁴ × 3² → √144 = 2² × 3 = 12
• **Long Division Method**: For larger numbers

**Between consecutive squares:** Between n² and (n+1)², there are 2n non-perfect-square numbers.
• Between 12² (144) and 13² (169): 2 × 12 = 24 numbers`,
    keyFormulas: ["√(a×b) = √a × √b", "Between n² and (n+1)²: 2n numbers", "If n ends in 5, n² ends in 25"],
    tips: ["Memorize squares from 1 to 20", "A number ending in 2, 3, 7, or 8 is NEVER a perfect square"]
  },

  "8_cubes_cube_roots": {
    title: "Cubes and Cube Roots",
    classs: 8,
    explanation: `**Perfect Cube**: A number that is the cube of an integer.
• 1, 8, 27, 64, 125, 216, 343, 512, 729, 1000

**Finding Cube Roots by Prime Factorisation:**
• 216 = 2³ × 3³ → ∛216 = 2 × 3 = 6

**Key Differences from Squares:**
• Cube of negative number is negative: (-3)³ = -27
• Cube root of negative number is negative: ∛(-27) = -3

**Making a Perfect Cube:**
• Find prime factors. Group in threes. Missing factors tell you what to multiply by.
• 72 = 2³ × 3² → need one more 3 → multiply by 3 to get 216`,
    keyFormulas: ["∛(a³) = a", "(-a)³ = -(a³)", "∛(-a³) = -a"],
    tips: ["Unlike square roots, cube roots of negative numbers exist", "Group prime factors in threes for cube roots (vs pairs for square roots)"]
  },

  "8_data_handling": {
    title: "Data Handling — Graphs and Probability",
    classs: 8,
    explanation: `**Organising Data:**
• **Frequency Table**: Count occurrences of each value
• **Grouped Frequency**: Use class intervals (10-20, 20-30, etc.)
• **Class Mark** = (lower limit + upper limit) / 2

**Types of Graphs:**
• **Bar Graph**: Rectangular bars with gaps (discrete data)
• **Histogram**: Rectangular bars with NO gaps (continuous data)
• **Pie Chart**: Circle divided into sectors; total = 360°

**Probability (Introduction):**
• Probability = Number of favourable outcomes / Total outcomes
• 0 ≤ P(event) ≤ 1
• Die: P(getting < 3) = 2/6 = 1/3
• Coin tossed twice: 4 outcomes (HH, HT, TH, TT)`,
    keyFormulas: ["P(E) = favourable outcomes / total outcomes", "Pie chart: angle = (value/total) × 360°", "Class mark = (lower + upper)/2"],
    tips: ["Probability of 0 = impossible event, probability of 1 = certain event", "Histogram is for continuous data, bar graph for discrete data"]
  },

  "8_graphs": {
    title: "Introduction to Graphs",
    classs: 8,
    explanation: `**Cartesian Plane**: Two perpendicular number lines (axes) crossing at origin (0,0).

**Coordinates**: (x, y) — x is horizontal, y is vertical

**Quadrants:**
• I: (+, +) | II: (-, +) | III: (-, -) | IV: (+, -)

**Plotting Points**: Start at origin, move x units right/left, then y units up/down.

**Linear Graphs**: Points forming a straight line show a linear relationship.
• (1,2), (2,4), (3,6) → y = 2x → straight line through origin

**Reading Graphs**: Distance-time, temperature-time, etc.
• Straight line in distance-time → constant speed
• Horizontal line → object at rest`,
    keyFormulas: ["Origin = (0, 0)", "x-axis = horizontal, y-axis = vertical", "Quadrant I: (+,+), II: (-,+), III: (-,-), IV: (+,-)"],
    tips: ["Remember: x comes first, y comes second in (x, y)", "A straight-line graph means the relationship is linear (constant rate of change)"]
  },
};

export default learningContent;

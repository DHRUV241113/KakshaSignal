// Prerequisite Knowledge Graph for CBSE Mathematics Classes 6-8
// Based on NCERT textbook chapter structure and CBSE Competency Framework
// Each node = one competency/topic. Edges = "requires" prerequisite relationships.

const knowledgeGraph = {
  nodes: [
    // ===== CLASS 6 =====
    {
      id: "6_whole_numbers",
      label: "Whole Numbers",
      class: 6,
      subject: "math",
      chapter: 2,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 2: Whole Numbers",
      description: "Natural numbers, whole numbers, number line, properties of whole numbers (closure, commutativity, associativity, distributivity)"
    },
    {
      id: "6_integers",
      label: "Integers",
      class: 6,
      subject: "math",
      chapter: 6,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 6: Integers",
      description: "Positive and negative integers, representation on number line, ordering of integers, addition and subtraction of integers"
    },
    {
      id: "6_fractions",
      label: "Fractions",
      class: 6,
      subject: "math",
      chapter: 7,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 7: Fractions",
      description: "Types of fractions (proper, improper, mixed), equivalent fractions, comparing fractions, addition and subtraction of fractions"
    },
    {
      id: "6_decimals",
      label: "Decimals",
      class: 6,
      subject: "math",
      chapter: 8,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 8: Decimals",
      description: "Place value in decimals, comparing decimals, addition and subtraction of decimals, conversion between fractions and decimals"
    },
    {
      id: "6_basic_geometry",
      label: "Basic Geometrical Ideas",
      class: 6,
      subject: "math",
      chapter: 4,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 4: Basic Geometrical Ideas",
      description: "Points, lines, rays, line segments, angles, triangles, quadrilaterals, circles"
    },
    {
      id: "6_algebra_intro",
      label: "Introduction to Algebra",
      class: 6,
      subject: "math",
      chapter: 11,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 11: Algebra",
      description: "Variables, constants, algebraic expressions, using variables in patterns and rules"
    },
    {
      id: "6_ratio_proportion",
      label: "Ratio and Proportion",
      class: 6,
      subject: "math",
      chapter: 12,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 12: Ratio and Proportion",
      description: "Ratio, proportion, unitary method"
    },
    {
      id: "6_mensuration_perimeter_area",
      label: "Perimeter and Area",
      class: 6,
      subject: "math",
      chapter: 10,
      ncertBook: "NCERT Mathematics Class VI",
      ncertChapter: "Chapter 10: Mensuration",
      description: "Perimeter of rectangles, squares, triangles; area of rectangles and squares"
    },

    // ===== CLASS 7 =====
    {
      id: "7_integers_ops",
      label: "Integers (Operations)",
      class: 7,
      subject: "math",
      chapter: 1,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 1: Integers",
      description: "Multiplication and division of integers, properties of integer operations, word problems"
    },
    {
      id: "7_fractions_decimals",
      label: "Fractions and Decimals",
      class: 7,
      subject: "math",
      chapter: 2,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 2: Fractions and Decimals",
      description: "Multiplication and division of fractions and decimals"
    },
    {
      id: "7_rational_numbers",
      label: "Rational Numbers",
      class: 7,
      subject: "math",
      chapter: 9,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 9: Rational Numbers",
      description: "Definition, equivalence, operations (add, subtract, multiply, divide) on rational numbers, representation on number line"
    },
    {
      id: "7_simple_equations",
      label: "Simple Equations",
      class: 7,
      subject: "math",
      chapter: 4,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 4: Simple Equations",
      description: "Setting up equations, solving equations with one variable, transposition"
    },
    {
      id: "7_lines_angles",
      label: "Lines and Angles",
      class: 7,
      subject: "math",
      chapter: 5,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 5: Lines and Angles",
      description: "Complementary, supplementary, adjacent, vertically opposite angles; parallel lines and transversal"
    },
    {
      id: "7_triangles",
      label: "Triangles and Properties",
      class: 7,
      subject: "math",
      chapter: 6,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 6: The Triangle and its Properties",
      description: "Angle sum property, exterior angle property, triangle inequality, congruence of triangles (SSS, SAS, ASA, RHS)"
    },
    {
      id: "7_algebraic_expressions",
      label: "Algebraic Expressions",
      class: 7,
      subject: "math",
      chapter: 12,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 12: Algebraic Expressions",
      description: "Terms, coefficients, like terms, addition and subtraction of algebraic expressions"
    },
    {
      id: "7_exponents_powers",
      label: "Exponents and Powers",
      class: 7,
      subject: "math",
      chapter: 13,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 13: Exponents and Powers",
      description: "Exponents, laws of exponents, expressing large numbers in standard form"
    },
    {
      id: "7_ratio_proportion_adv",
      label: "Comparing Quantities",
      class: 7,
      subject: "math",
      chapter: 8,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 8: Comparing Quantities",
      description: "Percentage, profit and loss, simple interest, ratio and proportion applications"
    },
    {
      id: "7_perimeter_area",
      label: "Perimeter and Area (Advanced)",
      class: 7,
      subject: "math",
      chapter: 11,
      ncertBook: "NCERT Mathematics Class VII",
      ncertChapter: "Chapter 11: Perimeter and Area",
      description: "Area of parallelogram, triangle, circle; circumference of circle"
    },

    // ===== CLASS 8 =====
    {
      id: "8_rational_numbers_adv",
      label: "Rational Numbers (Advanced)",
      class: 8,
      subject: "math",
      chapter: 1,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 1: Rational Numbers",
      description: "Properties of rational numbers (closure, commutativity, associativity, distributivity), representation on number line, finding rationals between two rationals"
    },
    {
      id: "8_linear_equations",
      label: "Linear Equations in One Variable",
      class: 8,
      subject: "math",
      chapter: 2,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 2: Linear Equations in One Variable",
      description: "Solving equations with variable on both sides, reducing complex equations to linear form, word problems"
    },
    {
      id: "8_algebraic_expressions",
      label: "Algebraic Expressions and Identities",
      class: 8,
      subject: "math",
      chapter: 9,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 9: Algebraic Expressions and Identities",
      description: "Multiplication of algebraic expressions, standard identities: (a+b)², (a-b)², (a+b)(a-b), (x+a)(x+b)"
    },
    {
      id: "8_exponents_powers",
      label: "Exponents and Powers (Advanced)",
      class: 8,
      subject: "math",
      chapter: 12,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 12: Exponents and Powers",
      description: "Negative exponents, laws of exponents with integral powers, expressing very small numbers in standard form"
    },
    {
      id: "8_direct_inverse_proportion",
      label: "Direct and Inverse Proportions",
      class: 8,
      subject: "math",
      chapter: 13,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 13: Direct and Inverse Proportions",
      description: "Direct proportion, inverse proportion, compound proportion, real-life applications"
    },
    {
      id: "8_comparing_quantities",
      label: "Comparing Quantities (Advanced)",
      class: 8,
      subject: "math",
      chapter: 8,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 8: Comparing Quantities",
      description: "Compound interest, discount, tax (VAT), finding cost price/selling price, successive percentage changes"
    },
    {
      id: "8_quadrilaterals",
      label: "Understanding Quadrilaterals",
      class: 8,
      subject: "math",
      chapter: 3,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 3: Understanding Quadrilaterals",
      description: "Types of quadrilaterals, angle sum property, properties of parallelogram, rhombus, rectangle, square, trapezium"
    },
    {
      id: "8_mensuration",
      label: "Mensuration (3D Introduction)",
      class: 8,
      subject: "math",
      chapter: 11,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 11: Mensuration",
      description: "Surface area and volume of cube, cuboid, cylinder"
    },
    {
      id: "8_factorisation",
      label: "Factorisation",
      class: 8,
      subject: "math",
      chapter: 14,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 14: Factorisation",
      description: "Factors of algebraic expressions, factorisation using identities, division of algebraic expressions"
    },
    {
      id: "8_graphs",
      label: "Introduction to Graphs",
      class: 8,
      subject: "math",
      chapter: 15,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 15: Introduction to Graphs",
      description: "Cartesian plane, plotting points, reading linear graphs, distance-time and other real-life graphs"
    },
    {
      id: "8_squares_square_roots",
      label: "Squares and Square Roots",
      class: 8,
      subject: "math",
      chapter: 6,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 6: Squares and Square Roots",
      description: "Perfect squares, properties of square numbers, finding square roots by prime factorisation and division method"
    },
    {
      id: "8_cubes_cube_roots",
      label: "Cubes and Cube Roots",
      class: 8,
      subject: "math",
      chapter: 7,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 7: Cubes and Cube Roots",
      description: "Perfect cubes, finding cube roots by prime factorisation"
    },
    {
      id: "8_data_handling",
      label: "Data Handling",
      class: 8,
      subject: "math",
      chapter: 5,
      ncertBook: "NCERT Mathematics Class VIII",
      ncertChapter: "Chapter 5: Data Handling",
      description: "Organising data, grouping data, bar graphs, histograms, pie charts, probability introduction"
    },
  ],

  // Directed edges: [prerequisite, dependent]
  // Meaning: you need to master 'prerequisite' before learning 'dependent'
  edges: [
    // Class 6 → Class 7 prerequisites
    ["6_whole_numbers", "6_integers"],
    ["6_whole_numbers", "6_fractions"],
    ["6_whole_numbers", "6_decimals"],
    ["6_whole_numbers", "6_algebra_intro"],
    ["6_whole_numbers", "6_ratio_proportion"],
    ["6_integers", "7_integers_ops"],
    ["6_fractions", "7_fractions_decimals"],
    ["6_decimals", "7_fractions_decimals"],
    ["6_fractions", "7_rational_numbers"],
    ["6_integers", "7_rational_numbers"],
    ["6_algebra_intro", "7_simple_equations"],
    ["6_algebra_intro", "7_algebraic_expressions"],
    ["6_basic_geometry", "7_lines_angles"],
    ["6_basic_geometry", "7_triangles"],
    ["6_ratio_proportion", "7_ratio_proportion_adv"],
    ["6_mensuration_perimeter_area", "7_perimeter_area"],
    ["6_basic_geometry", "7_perimeter_area"],
    ["6_whole_numbers", "7_exponents_powers"],

    // Class 7 → Class 8 prerequisites
    ["7_rational_numbers", "8_rational_numbers_adv"],
    ["7_integers_ops", "8_rational_numbers_adv"],
    ["7_simple_equations", "8_linear_equations"],
    ["7_rational_numbers", "8_linear_equations"],
    ["7_algebraic_expressions", "8_algebraic_expressions"],
    ["7_simple_equations", "8_algebraic_expressions"],
    ["7_exponents_powers", "8_exponents_powers"],
    ["7_ratio_proportion_adv", "8_direct_inverse_proportion"],
    ["7_ratio_proportion_adv", "8_comparing_quantities"],
    ["7_lines_angles", "8_quadrilaterals"],
    ["7_triangles", "8_quadrilaterals"],
    ["7_perimeter_area", "8_mensuration"],
    ["8_algebraic_expressions", "8_factorisation"],
    ["7_integers_ops", "8_squares_square_roots"],
    ["7_exponents_powers", "8_squares_square_roots"],
    ["8_squares_square_roots", "8_cubes_cube_roots"],
    ["7_fractions_decimals", "8_comparing_quantities"],
    ["8_linear_equations", "8_graphs"],
    ["7_ratio_proportion_adv", "8_data_handling"],
  ],

  // Comprehensive NCERT Edge Mapping with explicit classification:
  // - direct_ncert_dependency: Mathematical prerequisite strictly required by concept definitions
  // - pedagogical_assumption: Thematic / curricular grouping where concepts are co-taught but not mathematically irreducible
  edgeMetadata: {
    "6_whole_numbers->6_integers": {
      type: "direct_ncert_dependency",
      rationale: "Negative numbers are introduced as an extension of whole numbers to solve equations like 3 - 5 on the number line.",
      ncertSource: "NCERT Class 6 Ch 2 -> Ch 6"
    },
    "6_whole_numbers->6_fractions": {
      type: "direct_ncert_dependency",
      rationale: "Fractions represent parts of a whole; understanding whole numbers is required before dividing them into fractional units.",
      ncertSource: "NCERT Class 6 Ch 2 -> Ch 7"
    },
    "6_whole_numbers->6_decimals": {
      type: "direct_ncert_dependency",
      rationale: "Decimal place values (tenths, hundredths) extend the base-10 positional notation of whole numbers.",
      ncertSource: "NCERT Class 6 Ch 2 -> Ch 8"
    },
    "6_whole_numbers->6_algebra_intro": {
      type: "direct_ncert_dependency",
      rationale: "Algebraic patterns and rules generalize arithmetic operations on whole numbers using letter symbols.",
      ncertSource: "NCERT Class 6 Ch 2 -> Ch 11"
    },
    "6_whole_numbers->6_ratio_proportion": {
      type: "direct_ncert_dependency",
      rationale: "Ratio comparisons by division require whole number counting and multiplication tables.",
      ncertSource: "NCERT Class 6 Ch 2 -> Ch 12"
    },
    "6_integers->7_integers_ops": {
      type: "direct_ncert_dependency",
      rationale: "Multiplication and division of signed integers build directly on Grade 6 integer signs and addition rules.",
      ncertSource: "NCERT Class 6 Ch 6 -> Class 7 Ch 1"
    },
    "6_fractions->7_fractions_decimals": {
      type: "direct_ncert_dependency",
      rationale: "Multiplying and dividing fractions requires fluent knowledge of proper/improper fractions and reciprocals.",
      ncertSource: "NCERT Class 6 Ch 7 -> Class 7 Ch 2"
    },
    "6_decimals->7_fractions_decimals": {
      type: "direct_ncert_dependency",
      rationale: "Multiplying decimals requires understanding place value shifting and decimal-to-fraction conversions.",
      ncertSource: "NCERT Class 6 Ch 8 -> Class 7 Ch 2"
    },
    "6_fractions->7_rational_numbers": {
      type: "direct_ncert_dependency",
      rationale: "Rational numbers are defined as p/q where q != 0; positive rational numbers are identical to fractions.",
      ncertSource: "NCERT Class 6 Ch 7 -> Class 7 Ch 9"
    },
    "6_integers->7_rational_numbers": {
      type: "direct_ncert_dependency",
      rationale: "Numerator and denominator p, q in rational numbers must be integers.",
      ncertSource: "NCERT Class 6 Ch 6 -> Class 7 Ch 9"
    },
    "6_algebra_intro->7_simple_equations": {
      type: "direct_ncert_dependency",
      rationale: "Solving linear equations in one variable requires understanding expressions, variables, and balancing equality.",
      ncertSource: "NCERT Class 6 Ch 11 -> Class 7 Ch 4"
    },
    "6_algebra_intro->7_algebraic_expressions": {
      type: "direct_ncert_dependency",
      rationale: "Adding and subtracting like terms extends basic variable representation to multi-term expressions.",
      ncertSource: "NCERT Class 6 Ch 11 -> Class 7 Ch 12"
    },
    "6_basic_geometry->7_lines_angles": {
      type: "direct_ncert_dependency",
      rationale: "Lines, rays, and line segments form the definition of complementary, supplementary, and adjacent angles.",
      ncertSource: "NCERT Class 6 Ch 4 -> Class 7 Ch 5"
    },
    "6_basic_geometry->7_triangles": {
      type: "direct_ncert_dependency",
      rationale: "Understanding triangles as 3-sided closed polygons is prerequisite to angle sum and exterior angle properties.",
      ncertSource: "NCERT Class 6 Ch 4 -> Class 7 Ch 6"
    },
    "6_ratio_proportion->7_ratio_proportion_adv": {
      type: "direct_ncert_dependency",
      rationale: "Percentage, profit & loss, and simple interest apply ratio comparisons scaled to 100.",
      ncertSource: "NCERT Class 6 Ch 12 -> Class 7 Ch 8"
    },
    "6_mensuration_perimeter_area->7_perimeter_area": {
      type: "direct_ncert_dependency",
      rationale: "Rectangle and square area formulas are foundational for deriving triangle and parallelogram areas.",
      ncertSource: "NCERT Class 6 Ch 10 -> Class 7 Ch 11"
    },
    "6_basic_geometry->7_perimeter_area": {
      type: "direct_ncert_dependency",
      rationale: "Circumference and circle area require foundational understanding of circle radius, diameter, and boundary.",
      ncertSource: "NCERT Class 6 Ch 4 -> Class 7 Ch 11"
    },
    "6_whole_numbers->7_exponents_powers": {
      type: "direct_ncert_dependency",
      rationale: "Exponential notation represents repeated multiplication of whole numbers.",
      ncertSource: "NCERT Class 6 Ch 2 -> Class 7 Ch 13"
    },
    "7_rational_numbers->8_rational_numbers_adv": {
      type: "direct_ncert_dependency",
      rationale: "Abstract closure, associative, and distributive properties require mastery of rational number arithmetic.",
      ncertSource: "NCERT Class 7 Ch 9 -> Class 8 Ch 1"
    },
    "7_integers_ops->8_rational_numbers_adv": {
      type: "direct_ncert_dependency",
      rationale: "Distributive property across signed numerators requires fluent multiplication of positive and negative integers.",
      ncertSource: "NCERT Class 7 Ch 1 -> Class 8 Ch 1"
    },
    "7_simple_equations->8_linear_equations": {
      type: "direct_ncert_dependency",
      rationale: "Solving equations with variables on both sides extends the transposition balance method of Class 7.",
      ncertSource: "NCERT Class 7 Ch 4 -> Class 8 Ch 2"
    },
    "7_rational_numbers->8_linear_equations": {
      type: "direct_ncert_dependency",
      rationale: "Linear equations with fractional coefficients require rational number operations during cross-multiplication.",
      ncertSource: "NCERT Class 7 Ch 9 -> Class 8 Ch 2"
    },
    "7_algebraic_expressions->8_algebraic_expressions": {
      type: "direct_ncert_dependency",
      rationale: "Polynomial multiplication and standard algebraic identities build upon binomial addition and like terms.",
      ncertSource: "NCERT Class 7 Ch 12 -> Class 8 Ch 9"
    },
    "7_simple_equations->8_algebraic_expressions": {
      type: "pedagogical_assumption",
      rationale: "NCERT sequences simple equations before polynomial identities; algebraic fluency in equations aids expression manipulation, though identities are mathematically demonstrable through geometry.",
      ncertSource: "NCERT Class 7 Ch 4 -> Class 8 Ch 9 (Curricular Sequence)"
    },
    "7_exponents_powers->8_exponents_powers": {
      type: "direct_ncert_dependency",
      rationale: "Negative exponents and integral powers extend the positive exponent product/quotient laws of Grade 7.",
      ncertSource: "NCERT Class 7 Ch 13 -> Class 8 Ch 12"
    },
    "7_ratio_proportion_adv->8_direct_inverse_proportion": {
      type: "direct_ncert_dependency",
      rationale: "Direct and inverse proportions formulate ratio equality as constant ratios (x/y = k) and products (x*y = k).",
      ncertSource: "NCERT Class 7 Ch 8 -> Class 8 Ch 13"
    },
    "7_ratio_proportion_adv->8_comparing_quantities": {
      type: "direct_ncert_dependency",
      rationale: "Compound interest formulas derive from repeated application of simple interest and successive percentage increase.",
      ncertSource: "NCERT Class 7 Ch 8 -> Class 8 Ch 8"
    },
    "7_lines_angles->8_quadrilaterals": {
      type: "direct_ncert_dependency",
      rationale: "Parallelogram angle properties (opposite angles equal, consecutive angles supplementary) rely on parallel lines cut by transversals.",
      ncertSource: "NCERT Class 7 Ch 5 -> Class 8 Ch 3"
    },
    "7_triangles->8_quadrilaterals": {
      type: "direct_ncert_dependency",
      rationale: "Quadrilateral angle sum (360 degrees) is proven by dividing the quadrilateral into two triangles (2 x 180).",
      ncertSource: "NCERT Class 7 Ch 6 -> Class 8 Ch 3"
    },
    "7_perimeter_area->8_mensuration": {
      type: "direct_ncert_dependency",
      rationale: "Surface area and volume of 3D prisms/cylinders combine 2D rectangle and circle area calculations.",
      ncertSource: "NCERT Class 7 Ch 11 -> Class 8 Ch 11"
    },
    "8_algebraic_expressions->8_factorisation": {
      type: "direct_ncert_dependency",
      rationale: "Factorisation is the inverse operation of expanding algebraic products using standard identities.",
      ncertSource: "NCERT Class 8 Ch 9 -> Class 8 Ch 14"
    },
    "7_integers_ops->8_squares_square_roots": {
      type: "direct_ncert_dependency",
      rationale: "Understanding that square of negative integer is positive ((-a)^2 = a^2) relies on integer multiplication rules.",
      ncertSource: "NCERT Class 7 Ch 1 -> Class 8 Ch 6"
    },
    "7_exponents_powers->8_squares_square_roots": {
      type: "direct_ncert_dependency",
      rationale: "Square numbers are powers with exponent 2 (x^2); prime factorisation exponent grouping derives square roots.",
      ncertSource: "NCERT Class 7 Ch 13 -> Class 8 Ch 6"
    },
    "8_squares_square_roots->8_cubes_cube_roots": {
      type: "direct_ncert_dependency",
      rationale: "Cubes (x^3) extend square logic from groups of 2 prime factors to triplets of prime factors.",
      ncertSource: "NCERT Class 8 Ch 6 -> Class 8 Ch 7"
    },
    "7_fractions_decimals->8_comparing_quantities": {
      type: "direct_ncert_dependency",
      rationale: "Calculating percentage discount, VAT, and compounded fractions requires multiplying fractional rates.",
      ncertSource: "NCERT Class 7 Ch 2 -> Class 8 Ch 8"
    },
    "8_linear_equations->8_graphs": {
      type: "direct_ncert_dependency",
      rationale: "Plotting linear relationships on Cartesian coordinates directly visualizes two-variable linear equations (y = mx + c).",
      ncertSource: "NCERT Class 8 Ch 2 -> Class 8 Ch 15"
    },
    "7_ratio_proportion_adv->8_data_handling": {
      type: "pedagogical_assumption",
      rationale: "Pie charts use proportional parts of 360 degrees (component/total * 360), though histograms and bar graphs can be introduced independently.",
      ncertSource: "NCERT Class 7 Ch 8 -> Class 8 Ch 5 (Curricular Context)"
    }
  }
};

// Helper: Get all prerequisites for a given node (direct parents)
export function getPrerequisites(nodeId) {
  return knowledgeGraph.edges
    .filter(([_, dep]) => dep === nodeId)
    .map(([prereq, _]) => prereq);
}

// Helper: Get all dependents for a given node (direct children)
export function getDependents(nodeId) {
  return knowledgeGraph.edges
    .filter(([prereq, _]) => prereq === nodeId)
    .map(([_, dep]) => dep);
}

// Helper: Get node by ID
export function getNode(nodeId) {
  return knowledgeGraph.nodes.find(n => n.id === nodeId) || null;
}

// Helper: Get all nodes for a class
export function getNodesByClass(classNum) {
  return knowledgeGraph.nodes.filter(n => n.class === classNum);
}

// Helper: Get all nodes
export function getAllNodes() {
  return knowledgeGraph.nodes;
}

// Helper: Get all edges
export function getAllEdges() {
  return knowledgeGraph.edges;
}

// Helper: Get edge metadata (rationale, type, NCERT source)
export function getEdgeMetadata(prereq, dep) {
  const key = `${prereq}->${dep}`;
  return knowledgeGraph.edgeMetadata[key] || {
    type: "direct_ncert_dependency",
    rationale: `Mastery of ${prereq} is required for ${dep}.`,
    ncertSource: "NCERT Syllabus"
  };
}

export default knowledgeGraph;

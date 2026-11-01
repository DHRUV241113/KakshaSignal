from PIL import Image, ImageDraw, ImageFont
import os

SCREEN_DIR = "video_assets/screens"
os.makedirs(SCREEN_DIR, exist_ok=True)

# Helper to find a standard font
def get_font(size, bold=False):
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size)
            except:
                pass
    return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

# -------------------------------------------------------------
# 1. SCENE 1: THE CLASSROOM PROBLEM (0:00 - 0:21)
# -------------------------------------------------------------
def make_scene1_hook():
    W, H = 1920, 1080
    img = Image.new('RGB', (W, H), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    # Subtle grid background
    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(30, 41, 59), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(30, 41, 59), width=1)

    # Gradient highlight / header pill
    f_tag = get_font(20, bold=True)
    draw_rounded_rect(draw, [140, 90, 680, 140], radius=12, fill=(30, 41, 59), outline=(79, 70, 229), width=2)
    draw.text((160, 102), "CODE KERNEL ’26  •  GRIET × X-KERNEL", font=f_tag, fill=(165, 180, 252))

    # Big Headline
    f_title = get_font(56, bold=True)
    draw.text((140, 180), "One classroom. Different learning speeds.", font=f_title, fill=(255, 255, 255))
    draw.text((140, 255), "One missing foundation can change everything.", font=f_title, fill=(56, 189, 248))

    # Narrative explanation subtitle
    f_sub = get_font(26, bold=False)
    draw.text((140, 360), 
              "When middle-school students struggle with abstract concepts like Class 8 Rational Numbers,\n"
              "the breakdown rarely starts today—it traces back to unmastered foundations in Class 6 and 7.",
              font=f_sub, fill=(148, 163, 184))

    # Visual Prerequisite Breakdown Diagram
    # Box 1: Class 6 Fractions (Unmastered Gap)
    draw_rounded_rect(draw, [140, 520, 560, 800], radius=24, fill=(30, 41, 59), outline=(244, 63, 94), width=3)
    draw.text((170, 550), "CLASS 6 • CHAPTER 7", font=get_font(18, bold=True), fill=(251, 113, 133))
    draw.text((170, 585), "Fractions", font=get_font(36, bold=True), fill=(255, 255, 255))
    draw.text((170, 645), "• Equivalent denominators\n• Proper / improper forms\n• Reciprocals & scaling", font=get_font(22), fill=(203, 213, 225))
    draw_rounded_rect(draw, [170, 735, 430, 775], radius=8, fill=(225, 29, 72))
    draw.text((185, 745), "⚠️ ROOT CAUSE GAP (35%)", font=get_font(16, bold=True), fill=(255, 255, 255))

    # Arrow 1
    draw.line([(570, 660), (670, 660)], fill=(244, 63, 94), width=4)
    draw.polygon([(670, 660), (650, 645), (650, 675)], fill=(244, 63, 94))
    draw.text((580, 620), "Prerequisite", font=get_font(16, bold=True), fill=(244, 63, 94))

    # Box 2: Class 7 Rational Numbers (Compounding Gap)
    draw_rounded_rect(draw, [690, 520, 1110, 800], radius=24, fill=(30, 41, 59), outline=(245, 158, 11), width=2)
    draw.text((720, 550), "CLASS 7 • CHAPTER 9", font=get_font(18, bold=True), fill=(251, 191, 36))
    draw.text((720, 585), "Rational Numbers", font=get_font(36, bold=True), fill=(255, 255, 255))
    draw.text((720, 645), "• Signed fraction balance\n• Arithmetic operations\n• Number line position", font=get_font(22), fill=(203, 213, 225))
    draw_rounded_rect(draw, [720, 735, 960, 775], radius=8, fill=(217, 119, 6))
    draw.text((735, 745), "⚠️ BRIDGE DEFICIT (25%)", font=get_font(16, bold=True), fill=(255, 255, 255))

    # Arrow 2
    draw.line([(1120, 660), (1220, 660)], fill=(245, 158, 11), width=4)
    draw.polygon([(1220, 660), (1200, 645), (1200, 675)], fill=(245, 158, 11))
    draw.text((1130, 620), "Prerequisite", font=get_font(16, bold=True), fill=(245, 158, 11))

    # Box 3: Class 8 Rational Numbers (Advanced) (Current Breakdown)
    draw_rounded_rect(draw, [1240, 520, 1660, 800], radius=24, fill=(30, 41, 59), outline=(99, 102, 241), width=2)
    draw.text((1270, 550), "CLASS 8 • CHAPTER 1", font=get_font(18, bold=True), fill=(165, 180, 252))
    draw.text((1270, 585), "Rational Numbers (Adv)", font=get_font(32, bold=True), fill=(255, 255, 255))
    draw.text((1270, 645), "• Distributive property\n• Multiplicative inverse\n• Complex algebraic terms", font=get_font(22), fill=(203, 213, 225))
    draw_rounded_rect(draw, [1270, 735, 1560, 775], radius=8, fill=(225, 29, 72))
    draw.text((1285, 745), "❌ FAILED BENCHMARK (20%)", font=get_font(16, bold=True), fill=(255, 255, 255))

    # Bottom Callout Card
    draw_rounded_rect(draw, [140, 870, 1780, 970], radius=16, fill=(17, 24, 39), outline=(51, 65, 85), width=2)
    draw.text((180, 895), "💡 THE CURRICULUM CONTINUITY PASS (CCP) ENGINE", font=get_font(20, bold=True), fill=(56, 189, 248))
    draw.text((180, 930), "Traces deficits backward to uncover the true root cause before unhelpful drilling can cause student discouragement.", font=get_font(20), fill=(226, 232, 240))

    img.save(os.path.join(SCREEN_DIR, "scene1_classroom_problem.png"))
    print("Generated scene1_classroom_problem.png")

# -------------------------------------------------------------
# 2. SCENE 3: SNEHA RAO PREREQUISITE TRACE OVERLAY
# -------------------------------------------------------------
def make_scene3_trace_diagram():
    W, H = 1920, 1080
    img = Image.new('RGB', (W, H), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(30, 41, 59), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(30, 41, 59), width=1)

    # Header
    draw_rounded_rect(draw, [140, 70, 520, 120], radius=12, fill=(30, 41, 59), outline=(244, 63, 94), width=2)
    draw.text((160, 82), "EMPIRICAL DIAGNOSTIC EVIDENCE", font=get_font(20, bold=True), fill=(251, 113, 133))

    f_title = get_font(48, bold=True)
    draw.text((140, 150), "Sneha Rao (Class 8-B) — Backward Gap Trace", font=f_title, fill=(255, 255, 255))

    f_sub = get_font(24)
    draw.text((140, 220), 
              "Diagnostic Result: Failed Class 8 Rational Numbers (20% score • 1/5 correct).\n"
              "The CCP BFS algorithm traced backward through verified NCERT prerequisite dependencies:",
              font=f_sub, fill=(148, 163, 184))

    # Prerequisite Chain Card
    draw_rounded_rect(draw, [140, 310, 1780, 780], radius=24, fill=(30, 41, 59), outline=(79, 70, 229), width=2)

    # Step 1: Root Deficit
    draw_rounded_rect(draw, [180, 350, 620, 740], radius=16, fill=(15, 23, 42), outline=(244, 63, 94), width=3)
    draw.text((210, 380), "STEP 1 • ROOT DEFICIT", font=get_font(18, bold=True), fill=(251, 113, 133))
    draw.text((210, 415), "Class 6: Fractions", font=get_font(32, bold=True), fill=(255, 255, 255))
    draw.text((210, 465), "NCERT Mathematics Class VI • Ch 7", font=get_font(18), fill=(56, 189, 248))
    draw.text((210, 510), 
              "Diagnostic Score: 35% (Gap Found)\n\n"
              "Pedagogical Rationale:\n"
              "Mastering basic fractions, equivalent\n"
              "fractions, and common denominators is\n"
              "essential before performing signed\n"
              "rational operations.", font=get_font(18), fill=(203, 213, 225))
    draw_rounded_rect(draw, [210, 680, 520, 715], radius=6, fill=(225, 29, 72))
    draw.text((225, 690), "ACTION: TARGET REMEDIATION", font=get_font(14, bold=True), fill=(255, 255, 255))

    # Arrow 1
    draw.line([(630, 540), (740, 540)], fill=(56, 189, 248), width=4)
    draw.polygon([(740, 540), (720, 525), (720, 555)], fill=(56, 189, 248))
    draw.text((645, 500), "Prerequisite", font=get_font(16, bold=True), fill=(56, 189, 248))

    # Step 2: Bridge Concept
    draw_rounded_rect(draw, [750, 350, 1190, 740], radius=16, fill=(15, 23, 42), outline=(245, 158, 11), width=2)
    draw.text((780, 380), "STEP 2 • BRIDGE CONCEPT", font=get_font(18, bold=True), fill=(251, 191, 36))
    draw.text((780, 415), "Class 7: Rational Numbers", font=get_font(30, bold=True), fill=(255, 255, 255))
    draw.text((780, 465), "NCERT Mathematics Class VII • Ch 9", font=get_font(18), fill=(56, 189, 248))
    draw.text((780, 510), 
              "Diagnostic Score: 25% (Gap Found)\n\n"
              "NCERT Dependency Link:\n"
              "NCERT Class 6 Ch 7 -> Class 7 Ch 9\n\n"
              "Rational numbers are defined as p/q\n"
              "where q ≠ 0; positive rational\n"
              "numbers are identical to fractions.", font=get_font(18), fill=(203, 213, 225))

    # Arrow 2
    draw.line([(1200, 540), (1310, 540)], fill=(56, 189, 248), width=4)
    draw.polygon([(1310, 540), (1290, 525), (1290, 555)], fill=(56, 189, 248))
    draw.text((1215, 500), "Prerequisite", font=get_font(16, bold=True), fill=(56, 189, 248))

    # Step 3: Current Target Competency
    draw_rounded_rect(draw, [1320, 350, 1740, 740], radius=16, fill=(15, 23, 42), outline=(99, 102, 241), width=2)
    draw.text((1350, 380), "STEP 3 • CURRENT TARGET", font=get_font(18, bold=True), fill=(165, 180, 252))
    draw.text((1350, 415), "Class 8: Rational Numbers", font=get_font(28, bold=True), fill=(255, 255, 255))
    draw.text((1350, 465), "NCERT Mathematics Class VIII • Ch 1", font=get_font(18), fill=(56, 189, 248))
    draw.text((1350, 510), 
              "Diagnostic Score: 20% (Gap Found)\n\n"
              "NCERT Dependency Link:\n"
              "NCERT Class 7 Ch 9 -> Class 8 Ch 1\n\n"
              "Abstract closure, associative, and\n"
              "distributive properties require mastery\n"
              "of rational arithmetic.", font=get_font(18), fill=(203, 213, 225))

    # Footer banner
    draw_rounded_rect(draw, [140, 820, 1780, 940], radius=16, fill=(17, 24, 39), outline=(51, 65, 85), width=2)
    draw.text((180, 845), "🎯 SYSTEM RECOMMENDATION", font=get_font(20, bold=True), fill=(52, 211, 153))
    draw.text((180, 880), "Do not re-drill Class 8 formulas. Launch Sneha into the 3-Stage Remedial Loop for Class 6 Fractions.", font=get_font(22), fill=(241, 245, 249))

    img.save(os.path.join(SCREEN_DIR, "scene3_path_trace_diagram.png"))
    print("Generated scene3_path_trace_diagram.png")

# -------------------------------------------------------------
# 3. SCENE 7: CLOSING & CREDIBILITY CARD
# -------------------------------------------------------------
def make_scene7_closing_card():
    W, H = 1920, 1080
    img = Image.new('RGB', (W, H), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(30, 41, 59), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(30, 41, 59), width=1)

    # Big Brand Emblem
    draw_rounded_rect(draw, [140, 100, 240, 200], radius=24, fill=(79, 70, 229))
    draw.text((165, 120), "🎓", font=get_font(56), fill=(255, 255, 255))

    draw.text((270, 105), "KakshaSignal", font=get_font(60, bold=True), fill=(255, 255, 255))
    draw.text((275, 175), "Curriculum Continuity Pass (CCP) Engine", font=get_font(24, bold=True), fill=(165, 180, 252))

    # Core product motto
    draw.text((140, 260), "Diagnose the gap. Adapt the next step. Keep the teacher in control.", font=get_font(34, bold=True), fill=(56, 189, 248))

    # 4 Pillar Proof Cards
    cards = [
        ("31 Competency Nodes", "Classes 6, 7 & 8 mapped directly to NCERT chapters.", (56, 189, 248)),
        ("37 Prerequisite Edges", "Acyclic DAG verified cycle-free with pedagogical rationales.", (165, 180, 252)),
        ("3-Stage Adaptive Loop", "Learn → Solve → Test with Form B parallel reassessment.", (52, 211, 153)),
        ("Teacher in Control", "Classroom heatmap, explainable evidence & intervention actions.", (251, 191, 36)),
    ]

    for idx, (title, desc, color) in enumerate(cards):
        cx = 140 + idx * 420
        draw_rounded_rect(draw, [cx, 360, cx + 380, 540], radius=20, fill=(30, 41, 59), outline=color, width=2)
        draw.text((cx + 25, 390), title, font=get_font(24, bold=True), fill=color)
        draw.text((cx + 25, 440), desc, font=get_font(18), fill=(203, 213, 225))

    # Verification stats banner
    draw_rounded_rect(draw, [140, 590, 1780, 730], radius=20, fill=(17, 24, 39), outline=(52, 211, 153), width=2)
    draw.text((180, 620), "✅ VERIFIED ON AUTOMATED PROOF SUITES (2026-10-24)", font=get_font(20, bold=True), fill=(52, 211, 153))
    draw.text((180, 660), 
              "• 144 / 144 Automated Checks Passed (100%) across Unit, Workflow, Security & Regression Suites\n"
              "• Cryptographic HMAC Tokens • Strict CORS Allowlist • IDOR Cross-Class Isolation • Rate Limiting Immune to Spoofing",
              font=get_font(18), fill=(226, 232, 240))

    # Event badge & Hackathon Credits
    draw_rounded_rect(draw, [140, 780, 1780, 960], radius=24, fill=(30, 41, 59), outline=(79, 70, 229), width=2)
    draw.text((180, 815), "NATIONAL ENGINEERING HACKATHON: CODE KERNEL ’26", font=get_font(28, bold=True), fill=(255, 255, 255))
    draw.text((180, 860), "Organized by Gokaraju Rangaraju Institute of Engineering and Technology (GRIET) × X-Kernel", font=get_font(20), fill=(165, 180, 252))
    draw.text((180, 905), "Project Repository: https://github.com/dhruv241113/kakshasignal", font=get_font(22, bold=True), fill=(56, 189, 248))

    img.save(os.path.join(SCREEN_DIR, "scene7_closing_card.png"))
    print("Generated scene7_closing_card.png")

if __name__ == "__main__":
    make_scene1_hook()
    make_scene3_trace_diagram()
    make_scene7_closing_card()

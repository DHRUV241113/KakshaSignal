from PIL import Image, ImageDraw, ImageFont
import os

SCREEN_DIR = "video_assets/screens"
os.makedirs(SCREEN_DIR, exist_ok=True)

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

def make_security_verification_card():
    W, H = 1920, 1080
    img = Image.new('RGB', (W, H), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    # 80px background grid
    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(30, 41, 59), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(30, 41, 59), width=1)

    # Top pill tag
    f_tag = get_font(20, bold=True)
    draw_rounded_rect(draw, [140, 75, 620, 125], radius=12, fill=(30, 41, 59), outline=(14, 165, 233), width=2)
    draw.text((160, 87), "SECURITY & VERIFICATION", font=f_tag, fill=(56, 189, 248))
    draw.text((450, 87), "•  CODE KERNEL ’26", font=f_tag, fill=(148, 163, 184))

    # Main Headline
    f_title = get_font(52, bold=True)
    draw.text((140, 150), "Security Hardening & Protocol Verification", font=f_title, fill=(255, 255, 255))

    # Subtitle
    f_sub = get_font(24, bold=False)
    draw.text((140, 225), 
              "Signed sessions, classroom-level authorization checks, and bounded requests safeguard student data.", 
              font=f_sub, fill=(148, 163, 184))

    # 4 Feature Cards (2x2 Grid)
    # Card 1: Signed Teacher & Student Sessions
    draw_rounded_rect(draw, [140, 290, 920, 475], radius=20, fill=(30, 41, 59), outline=(99, 102, 241), width=2)
    draw.text((175, 315), "1. Signed Sessions & Cryptographic Tokens", font=get_font(24, bold=True), fill=(165, 180, 252))
    draw.text((175, 360), 
              "• HMAC-SHA256 signed sessions for both teachers and students\n"
              "• Signature verification rejects tampered authorization tokens\n"
              "• Instant key rotation mechanism invalidates stale sessions", 
              font=get_font(19), fill=(226, 232, 240))

    # Card 2: Classroom-Level Access Checks (IDOR Isolation)
    draw_rounded_rect(draw, [960, 290, 1780, 475], radius=20, fill=(30, 41, 59), outline=(14, 165, 233), width=2)
    draw.text((995, 315), "2. Classroom-Level Access Checks (IDOR Guard)", font=get_font(24, bold=True), fill=(56, 189, 248))
    draw.text((995, 360), 
              "• Enforces strict student-to-classroom tenancy boundaries\n"
              "• Prevents Student A from querying or modifying Student B records\n"
              "• Teachers can only inspect and assign students in their own classes", 
              font=get_font(19), fill=(226, 232, 240))

    # Card 3: Protected Endpoints & Request-Size Limits
    draw_rounded_rect(draw, [140, 505, 920, 690], radius=20, fill=(30, 41, 59), outline=(52, 211, 153), width=2)
    draw.text((175, 530), "3. Protected Endpoints & Request-Size Limits", font=get_font(24, bold=True), fill=(52, 211, 153))
    draw.text((175, 575), 
              "• All student progress & topic routes require active authorization\n"
              "• Strict 64 KB JSON payload boundaries reject oversized inputs\n"
              "• Connection-based rate limiting prevents IP-spoofing abuses", 
              font=get_font(19), fill=(226, 232, 240))

    # Card 4: Security Regression Tests & Audit Suite
    draw_rounded_rect(draw, [960, 505, 1780, 690], radius=20, fill=(30, 41, 59), outline=(245, 158, 11), width=2)
    draw.text((995, 530), "4. Security Regression Test Suite", font=get_font(24, bold=True), fill=(251, 191, 36))
    draw.text((995, 575), 
              "• Dedicated automated security suite (test-security.js)\n"
              "• 26 automated security assertions validating auth & isolation\n"
              "• Verifies question option text directly (shuffling-immune)", 
              font=get_font(19), fill=(226, 232, 240))

    # Bottom Banner: 144 Verification Checks & Honest Dependency Vulnerability Disclosure
    draw_rounded_rect(draw, [140, 725, 1780, 940], radius=20, fill=(17, 24, 39), outline=(52, 211, 153), width=2)
    draw.text((180, 750), "VERIFIED: 144 AUTOMATED CHECKS RECORDED ON LOCAL REPORT", font=get_font(22, bold=True), fill=(52, 211, 153))
    draw.text((180, 790), 
              "• Local test report records 144 verification checks passing across security, API, workflow, and regression suites.\n"
              "• Protocol Conformance: Passing test suites verify implemented API rules, without implying the app is vulnerability-free.\n"
              "• Transparent Disclosure: Seven client dependency advisories were reported by npm audit and remain documented.",
              font=get_font(19), fill=(226, 232, 240))

    out_path = os.path.join(SCREEN_DIR, "scene7_security_verification.png")
    img.save(out_path)
    print(f"Generated {out_path}")

if __name__ == "__main__":
    make_security_verification_card()

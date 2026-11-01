from PIL import Image, ImageDraw, ImageFont
import os
import subprocess

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

def generate_qr_images():
    qr1_path = os.path.join(SCREEN_DIR, "qr_project_info.png")
    qr2_path = os.path.join(SCREEN_DIR, "qr_source_code.png")

    cmd1 = [
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "qrencodesrc=text='https\\://dhruv241113.github.io/KakshaSignal/':q=220:Q=240:level=H",
        "-vframes", "1", qr1_path
    ]
    cmd2 = [
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "qrencodesrc=text='https\\://github.com/DHRUV241113/KakshaSignal':q=220:Q=240:level=H",
        "-vframes", "1", qr2_path
    ]
    subprocess.run(cmd1, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(cmd2, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return qr1_path, qr2_path

def make_scene7_closing_card():
    qr1_path, qr2_path = generate_qr_images()

    W, H = 1920, 1080
    img = Image.new('RGB', (W, H), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(30, 41, 59), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(30, 41, 59), width=1)

    # Top Brand Header
    draw_rounded_rect(draw, [120, 60, 220, 160], radius=22, fill=(79, 70, 229))
    draw.text((142, 78), "KS", font=get_font(48, bold=True), fill=(255, 255, 255))

    draw.text((250, 65), "KakshaSignal", font=get_font(52, bold=True), fill=(255, 255, 255))
    draw.text((255, 125), "Curriculum Continuity Pass (CCP) Engine  •  Code Kernel ’26 (GRIET × X-Kernel)", font=get_font(20, bold=True), fill=(165, 180, 252))

    # Motto
    draw.text((120, 185), "Diagnose the gap. Adapt the next step. Keep the teacher in control.", font=get_font(28, bold=True), fill=(56, 189, 248))

    # 4 Pillar Proof Cards across top
    cards = [
        ("31 Competency Nodes", "Classes 6, 7 & 8 mapped directly to NCERT chapters.", (56, 189, 248)),
        ("37 Prerequisite Edges", "Acyclic DAG verified cycle-free with pedagogical rationales.", (165, 180, 252)),
        ("3-Stage Adaptive Loop", "Learn → Solve → Test with Form B parallel reassessment.", (52, 211, 153)),
        ("Teacher in Control", "Classroom heatmap, explainable evidence & intervention actions.", (251, 191, 36)),
    ]

    for idx, (title, desc, color) in enumerate(cards):
        cx = 120 + idx * 425
        draw_rounded_rect(draw, [cx, 245, cx + 400, 395], radius=16, fill=(30, 41, 59), outline=color, width=2)
        draw.text((cx + 20, 265), title, font=get_font(22, bold=True), fill=color)
        draw.text((cx + 20, 310), desc, font=get_font(16), fill=(203, 213, 225))

    # Left Column: Hackathon Credentials & Verified Proof Stats
    draw_rounded_rect(draw, [120, 425, 1020, 715], radius=20, fill=(17, 24, 39), outline=(52, 211, 153), width=2)
    draw.text((155, 450), "VERIFIED: 144 AUTOMATED CHECKS ON LOCAL REPORT", font=get_font(22, bold=True), fill=(52, 211, 153))
    draw.text((155, 495), 
              "• 144 / 144 automated checks passing across unit, workflow, security & regression suites\n"
              "• HMAC-SHA256 session tokens • IDOR cross-classroom isolation • Strict 64 KB payload limits\n"
              "• Grounded prototype scope: middle-school mathematics across Classes 6, 7, and 8\n"
              "• Truthful boundaries: active backend required for assessment; 7 client advisories tracked in npm audit",
              font=get_font(17), fill=(226, 232, 240))

    # Hackathon Banner
    draw_rounded_rect(draw, [120, 745, 1020, 980], radius=20, fill=(30, 41, 59), outline=(79, 70, 229), width=2)
    draw.text((155, 775), "NATIONAL ENGINEERING HACKATHON: CODE KERNEL ’26", font=get_font(24, bold=True), fill=(255, 255, 255))
    draw.text((155, 820), "Organized by Gokaraju Rangaraju Institute of Engineering and Technology (GRIET) × X-Kernel", font=get_font(18), fill=(165, 180, 252))
    draw.text((155, 865), "Track: Adaptive Learning Systems & Classroom AI / EdTech", font=get_font(18, bold=True), fill=(251, 191, 36))
    draw.text((155, 910), "Demonstration Model: Teacher-Led Curriculum Continuity Pass (CCP)", font=get_font(18), fill=(203, 213, 225))

    # Right Column: Two Scannable QR Codes Side-by-Side
    # Load QR images
    qr1_img = Image.open(qr1_path).convert('RGB')
    qr2_img = Image.open(qr2_path).convert('RGB')

    # Card 1: Project Information QR Code
    draw_rounded_rect(draw, [1050, 425, 1430, 980], radius=20, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
    draw_rounded_rect(draw, [1080, 450, 1400, 495], radius=10, fill=(14, 165, 233))
    draw.text((1115, 460), "PROJECT INFORMATION", font=get_font(18, bold=True), fill=(255, 255, 255))

    # Paste QR Code 1
    qr1_w, qr1_h = qr1_img.size
    # Place on clean white rounded card inside
    draw_rounded_rect(draw, [1115, 525, 1115 + qr1_w + 30, 525 + qr1_h + 30], radius=16, fill=(255, 255, 255))
    img.paste(qr1_img, (1130, 540))

    draw.text((1080, 830), "Live Project Site & Demo:", font=get_font(18, bold=True), fill=(56, 189, 248))
    draw.text((1080, 865), "dhruv241113.github.io/\nKakshaSignal/", font=get_font(18), fill=(241, 245, 249))
    draw.text((1080, 930), "[Scan with phone camera]", font=get_font(14, bold=True), fill=(148, 163, 184))

    # Card 2: Source Code QR Code
    draw_rounded_rect(draw, [1460, 425, 1840, 980], radius=20, fill=(30, 41, 59), outline=(165, 180, 252), width=2)
    draw_rounded_rect(draw, [1490, 450, 1810, 495], radius=10, fill=(99, 102, 241))
    draw.text((1535, 460), "SOURCE CODE REPO", font=get_font(18, bold=True), fill=(255, 255, 255))

    # Paste QR Code 2
    qr2_w, qr2_h = qr2_img.size
    draw_rounded_rect(draw, [1525, 525, 1525 + qr2_w + 30, 525 + qr2_h + 30], radius=16, fill=(255, 255, 255))
    img.paste(qr2_img, (1540, 540))

    draw.text((1490, 830), "GitHub Source Code:", font=get_font(18, bold=True), fill=(165, 180, 252))
    draw.text((1490, 865), "github.com/\nDHRUV241113/KakshaSignal", font=get_font(18), fill=(241, 245, 249))
    draw.text((1490, 930), "[Scan to inspect repository]", font=get_font(14, bold=True), fill=(148, 163, 184))

    out_file = os.path.join(SCREEN_DIR, "scene7_closing_card.png")
    img.save(out_file)
    print(f"Generated {out_file} with dual scannable QR codes")

if __name__ == "__main__":
    make_scene7_closing_card()

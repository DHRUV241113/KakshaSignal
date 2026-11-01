import os

timeline = [
    # Scene 1: The Classroom Problem (0:00 - 0:21, 21s)
    ("video_assets/screens/scene1_classroom_problem.png", 21.0),

    # Scene 2: Introduce KakshaSignal (0:21 - 0:39, 18s)
    ("video_assets/screens/scene2_landing_hero.png", 9.0),
    ("video_assets/screens/scene2_personas_grid.png", 9.0),

    # Scene 3: Discover Learning Gap (0:39 - 1:07, 28s)
    ("video_assets/screens/scene3_sneha_dash.png", 10.0),
    ("video_assets/screens/scene3_gap_banner_focus.png", 9.0),
    ("video_assets/screens/scene3_path_trace_diagram.png", 9.0),

    # Scene 4: Adaptive Learning Loop (1:07 - 1:45, 38s)
    ("video_assets/screens/scene4_stage1_learn.png", 5.0),
    ("video_assets/screens/scene4_stage1_learn_details.png", 5.0),
    ("video_assets/screens/scene4_stage2_solve_question.png", 5.0),
    ("video_assets/screens/scene4_stage2_solve_feedback.png", 5.0),
    ("video_assets/screens/scene4_stage3_test_formB.png", 9.0),
    ("video_assets/screens/scene4_score_progression.png", 9.0),

    # Scene 5: Empower the Teacher (1:45 - 2:09, 24s)
    ("video_assets/screens/scene5_teacher_7a.png", 8.0),
    ("video_assets/screens/scene5_teacher_8b.png", 8.0),
    ("video_assets/screens/scene5_teacher_control_modal.png", 8.0),

    # Scene 6: Designed for Indian Classrooms (2:09 - 2:30, 21s)
    ("video_assets/screens/scene6_hindi_ui.png", 10.0),
    ("video_assets/screens/scene6_low_bw_ui.png", 11.0),

    # Scene 7: Technical Credibility, Security & Verification, Closing (2:30 - 2:58, 28s)
    ("video_assets/screens/scene7_knowledge_ladder.png", 10.0),
    ("video_assets/screens/scene7_security_verification.png", 8.0),
    ("video_assets/screens/scene7_closing_card.png", 10.0),
]

total_dur = sum(d for _, d in timeline)
print(f"Total video duration: {total_dur} seconds ({int(total_dur//60)}m {int(total_dur%60)}s)")

with open("video_timeline.txt", "w", encoding="utf-8") as f:
    f.write("ffconcat version 1.0\n")
    for img_path, dur in timeline:
        # Forward slashes for FFmpeg
        clean_path = img_path.replace("\\", "/")
        f.write(f"file '{clean_path}'\n")
        f.write(f"duration {dur}\n")
    # Repeat the last image once without duration as required by ffconcat
    clean_last = timeline[-1][0].replace("\\", "/")
    f.write(f"file '{clean_last}'\n")

print("Created video_timeline.txt")

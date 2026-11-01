import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREEN_DIR = path.resolve('video_assets/screens');
if (!fs.existsSync(SCREEN_DIR)) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
}

async function captureAll() {
  console.log('1. Starting KakshaSignal Express Server...');
  const server = spawn('node', ['server/index.js'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('2. Starting Chrome in 1080p...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    '--force-device-scale-factor=1',
    'http://localhost:3001'
  ]);
  await new Promise(r => setTimeout(r, 3000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const listData = await listRes.json();
    const target = listData.find(t => t.type === 'page');
    console.log('Found page target WS:', target.webSocketDebuggerUrl);

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const resp = JSON.parse(event.data);
          if (resp.id === id) {
            ws.removeEventListener('message', handler);
            resolve(resp.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res?.result?.value;
    }

    async function saveScreenshot(filename) {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const outPath = path.join(SCREEN_DIR, filename);
      fs.writeFileSync(outPath, buf);
      console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    // ----------------------------------------------------
    // SCENE 2: LANDING PAGE & PERSONAS
    // ----------------------------------------------------
    console.log('--- Capturing Scene 2: Landing Page ---');
    await evaluate(`window.location.href = 'http://localhost:3001/'`);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene2_landing_full.png');

    // Scroll to personas
    await evaluate(`window.scrollTo({ top: 380, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot('scene2_landing_personas.png');

    // ----------------------------------------------------
    // SCENE 3: SNEHA RAO - STUDENT DASHBOARD & GAP TRACE
    // ----------------------------------------------------
    console.log('--- Capturing Scene 3: Sneha Rao Dashboard & Gap Trace ---');
    // Click Sneha Rao launcher
    await evaluate(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const snehaBtn = buttons.find(b => b.innerText.includes('Sneha Rao'));
      if (snehaBtn) snehaBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot('scene3_sneha_dashboard.png');

    // Scroll to gap trace button and click it
    await evaluate(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const traceBtn = buttons.find(b => b.innerText.includes('View Prerequisite Root Cause') || b.innerText.includes('Inspect Prerequisite Trace'));
      if (traceBtn) traceBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene3_sneha_gap_modal.png');

    // ----------------------------------------------------
    // SCENE 4: LEARN -> SOLVE -> TEST LOOP (6_fractions)
    // ----------------------------------------------------
    console.log('--- Capturing Scene 4: Learn-Solve-Test Loop ---');
    // Navigate directly to learn-solve-test for 6_fractions as Sneha
    await evaluate(`window.location.href = 'http://localhost:3001/learn-solve-test/6_fractions?tab=learn'`);
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot('scene4_stage1_learn.png');

    // Scroll down in Learn to show concept details
    await evaluate(`window.scrollTo({ top: 400, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot('scene4_stage1_learn_details.png');

    // Click 'Solve' (Practice) tab
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const solveTab = tabs.find(t => t.innerText.includes('Stage 2: Solve') || t.innerText.includes('Solve'));
      if (solveTab) solveTab.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene4_stage2_solve_initial.png');

    // Select the first practice option (Improper fraction)
    await evaluate(`
      const optButtons = Array.from(document.querySelectorAll('button'));
      const improperBtn = optButtons.find(b => b.innerText.includes('Improper fraction') || b.innerText.includes('Improper'));
      if (improperBtn) improperBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene4_stage2_solve_feedback.png');

    // Click 'Test' tab
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const testTab = tabs.find(t => t.innerText.includes('Stage 3: Test') || t.innerText.includes('Test'));
      if (testTab) testTab.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene4_stage3_test_formB.png');

    // Answer the test questions to achieve mastery
    await evaluate(`
      // Answer options sequentially
      const qContainers = document.querySelectorAll('.space-y-3, .space-y-4, .border');
      const allButtons = Array.from(document.querySelectorAll('button'));
      // Pick first or correct option for each question
      const radioOpts = allButtons.filter(b => b.className.includes('text-left') || b.className.includes('rounded-lg'));
      if (radioOpts.length > 0) {
        radioOpts[0].click();
      }
    `);
    await new Promise(r => setTimeout(r, 1000));

    // Submit test or trigger score progression
    await evaluate(`
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.includes('Submit') || b.innerText.includes('Verify Mastery') || b.innerText.includes('Next')
      );
      if (submitBtn) submitBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene4_stage3_test_progression.png');

    // ----------------------------------------------------
    // SCENE 5: TEACHER COMMAND CENTER (MRS. SHARMA)
    // ----------------------------------------------------
    console.log('--- Capturing Scene 5: Teacher Dashboard ---');
    await evaluate(`window.location.href = 'http://localhost:3001/'`);
    await new Promise(r => setTimeout(r, 2000));

    // Click Mrs. Sharma demo launcher
    await evaluate(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const teacherBtn = buttons.find(b => b.innerText.includes('Mrs. Sharma'));
      if (teacherBtn) teacherBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot('scene5_teacher_heatmap_7a.png');

    // Switch to Class 8-B
    await evaluate(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const class8Btn = buttons.find(b => b.innerText.includes('Class 8-B') || b.innerText.includes('8-B'));
      if (class8Btn) class8Btn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene5_teacher_heatmap_8b.png');

    // Click a red gap cell to open Teacher Gap Trace Modal
    await evaluate(`
      const redCells = Array.from(document.querySelectorAll('button, td, div')).filter(el => 
        el.className && (el.className.includes('bg-red') || el.className.includes('border-red') || el.className.includes('rose'))
      );
      if (redCells.length > 0) redCells[0].click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene5_teacher_modal.png');

    // ----------------------------------------------------
    // SCENE 6: HINDI TOGGLE & LOW-BANDWIDTH MODE
    // ----------------------------------------------------
    console.log('--- Capturing Scene 6: Hindi & Low-Bandwidth Mode ---');
    // Close modal if open or navigate back to student/teacher
    await evaluate(`
      const closeBtn = document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Close') || b.innerText.includes('×'));
      if (closeBtn) closeBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    // Click Hindi toggle in Navbar
    await evaluate(`
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const hindiBtn = navBtns.find(b => b.innerText.includes('हिन्दी'));
      if (hindiBtn) hindiBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene6_hindi_mode.png');

    // Click Low-BW Mode toggle in Navbar
    await evaluate(`
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const lowBwBtn = navBtns.find(b => b.innerText.includes('Low-BW') || b.innerText.includes('कम बैंडविड्थ'));
      if (lowBwBtn) lowBwBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene6_low_bandwidth_mode.png');

    ws.close();
    console.log('--- All live browser captures completed successfully! ---');
  } catch (err) {
    console.error('Error during screen captures:', err);
  } finally {
    chrome.kill();
    server.kill();
  }
}

captureAll();

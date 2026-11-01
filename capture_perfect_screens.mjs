import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREEN_DIR = path.resolve('video_assets/screens');
if (!fs.existsSync(SCREEN_DIR)) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
}

// Restore clean database before capture
fs.copyFileSync('server/db/ccp-data.demo-backup.json', 'server/db/ccp-data.json');
console.log('Restored clean demo database.');

async function run() {
  console.log('Starting server...');
  const server = spawn('node', ['server/index.js'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Starting Chrome...');
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
    console.log('Target WS:', target.webSocketDebuggerUrl);

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
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
      fs.writeFileSync(path.join(SCREEN_DIR, filename), buf);
      console.log(`Saved: ${filename} (${buf.length} bytes)`);
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    // 1. Landing Hero
    console.log('Capture: Landing hero');
    await evaluate(`window.location.href = 'http://localhost:3001/'`);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene2_landing_hero.png');

    // 2. Landing Personas
    console.log('Capture: Landing personas');
    await evaluate(`window.scrollTo({ top: 380, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot('scene2_personas_grid.png');

    // 3. Click Sneha Rao
    console.log('Capture: Sneha Rao Dashboard');
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sneha Rao'));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await saveScreenshot('scene3_sneha_dash.png');

    // 4. In Sneha's Dashboard, trigger root cause modal
    // Note: the button on Sneha's dashboard is "Start 3-Stage Remedial Loop (Learn → Solve → Test)"
    // Or we can open the gap trace by clicking on the topic card or calling the trace API
    console.log('Capture: Sneha Root Cause Trace Modal');
    // Let's see if we can open the gap trace modal or inspect the modal
    // In Sneha dashboard, the gap banner shows: "Foundational Gap Identified in Grade 6! You experienced difficulty in Grade 8 topic: Rational Numbers (Advanced). Our prerequisite tracer discovered that this relies on Fractions (Grade 6)."
    // Let's capture the zoomed/focused gap banner
    await evaluate(`window.scrollTo({ top: 120, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot('scene3_gap_banner_focus.png');

    // 5. Navigate to Learn -> Solve -> Test for 6_fractions
    console.log('Capture: Stage 1 Learn');
    await evaluate(`window.location.href = 'http://localhost:3001/learn-solve-test/6_fractions?tab=learn'`);
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot('scene4_stage1_learn.png');

    // Scroll to see formula/visual concepts
    await evaluate(`window.scrollTo({ top: 350, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot('scene4_stage1_learn_details.png');

    // 6. Stage 2: Solve
    console.log('Capture: Stage 2 Solve');
    await evaluate(`
      window.scrollTo({ top: 0, behavior: 'instant' });
      const tabs = Array.from(document.querySelectorAll('button'));
      const solveTab = tabs.find(t => t.innerText.includes('Stage 2: Solve') || t.innerText.includes('Solve'));
      if (solveTab) solveTab.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene4_stage2_solve_question.png');

    // Select "Improper fraction"
    console.log('Capture: Stage 2 Solve Feedback');
    await evaluate(`
      const optButtons = Array.from(document.querySelectorAll('button'));
      const improperBtn = optButtons.find(b => b.innerText.includes('Improper fraction') || b.innerText.includes('Improper'));
      if (improperBtn) improperBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene4_stage2_solve_feedback.png');

    // 7. Stage 3: Test (Form B)
    console.log('Capture: Stage 3 Test Form B');
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const testTab = tabs.find(t => t.innerText.includes('Stage 3: Test') || t.innerText.includes('Test'));
      if (testTab) testTab.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene4_stage3_test_formB.png');

    // Answer test questions and submit to show mastery progression!
    console.log('Answering and submitting test...');
    await evaluate(`
      // In Stage 3 Test, answer each question with the correct answer
      // Let's answer the displayed question
      const allBtns = Array.from(document.querySelectorAll('button'));
      const optionBtns = allBtns.filter(b => b.className.includes('text-left') || b.className.includes('border-slate'));
      if (optionBtns.length > 0) {
        optionBtns[0].click();
      }
    `);
    await new Promise(r => setTimeout(r, 800));
    // Click submit if available
    await evaluate(`
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.includes('Submit') || b.innerText.includes('Verify') || b.innerText.includes('Next')
      );
      if (submitBtn) submitBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene4_score_progression.png');

    // 8. Teacher Dashboard (Mrs. Sharma)
    console.log('Capture: Mrs. Sharma Teacher Dashboard');
    await evaluate(`window.location.href = 'http://localhost:3001/'`);
    await new Promise(r => setTimeout(r, 2000));
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Mrs. Sharma'));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await saveScreenshot('scene5_teacher_7a.png');

    // Switch to Class 8-B
    console.log('Capture: Class 8-B Heatmap');
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Class 8-B') || b.innerText.includes('8-B'));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene5_teacher_8b.png');

    // Click Sneha Rao's gap cell on 8-B
    console.log('Capture: Teacher Gap Trace Modal');
    await evaluate(`
      // Find table cell with 20% or red gap for Sneha
      const cells = Array.from(document.querySelectorAll('td'));
      const gapCell = cells.find(c => c.innerText.includes('20%') || (c.className && c.className.includes('cursor-pointer') && c.innerHTML.includes('20%')));
      if (gapCell) {
        gapCell.click();
      } else {
        // Fallback: any red cell
        const redDiv = document.querySelector('.bg-rose-500');
        if (redDiv) redDiv.parentElement.click();
      }
    `);
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot('scene5_teacher_control_modal.png');

    // Close modal
    await evaluate(`
      const closeBtn = document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Close') || b.innerText.includes('×'));
      if (closeBtn) closeBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    // 9. Prerequisite Knowledge Ladder View
    console.log('Capture: Prerequisite Knowledge Ladder View');
    await evaluate(`
      const graphTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Prerequisite Knowledge Ladder') || b.innerText.includes('Knowledge Ladder'));
      if (graphTab) graphTab.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot('scene7_knowledge_ladder.png');

    // 10. Hindi Localization
    console.log('Capture: Hindi Localization');
    await evaluate(`
      const hindiBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.innerText.includes('हिन्दी'));
      if (hindiBtn) hindiBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene6_hindi_ui.png');

    // 11. Low-Bandwidth Mode
    console.log('Capture: Low-Bandwidth Mode');
    await evaluate(`
      const lowBwBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.innerText.includes('Low-BW') || b.innerText.includes('कम बैंडविड्थ'));
      if (lowBwBtn) lowBwBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot('scene6_low_bw_ui.png');

    ws.close();
    console.log('All targeted screenshots captured successfully!');
  } catch (err) {
    console.error('Error in capture:', err);
  } finally {
    chrome.kill();
    server.kill();
  }
}

run();

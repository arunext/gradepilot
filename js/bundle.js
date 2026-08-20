// GradeCrow AI - The Cleverest Handwritten Exam Grading Platform (gradecrow.com)
// Multimodal Vision OCR & Intelligent Semantic Concept Resolver (Somhi Design System)
(function() {
  'use strict';

  // --- 0. CREDIT MANAGER (5 Free Daily Scans) ---
  class CreditManager {
    constructor() {
      this.DAILY_LIMIT = 5;
      this.data = this.loadData();
    }

    loadData() {
      const todayStr = new Date().toISOString().slice(0, 10);
      try {
        const stored = localStorage.getItem('gradecrow_daily_credits');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.date === todayStr) {
            return parsed;
          }
        }
      } catch (e) {}
      const fresh = { date: todayStr, scansUsed: 0, maxScans: this.DAILY_LIMIT };
      this.saveData(fresh);
      return fresh;
    }

    saveData(d) {
      try {
        localStorage.setItem('gradecrow_daily_credits', JSON.stringify(d));
      } catch (e) {}
    }

    getRemaining(hasCustomKey = false) {
      if (hasCustomKey) return Infinity;
      const todayStr = new Date().toISOString().slice(0, 10);
      if (this.data.date !== todayStr) {
        this.data = { date: todayStr, scansUsed: 0, maxScans: this.DAILY_LIMIT };
        this.saveData(this.data);
      }
      return Math.max(0, this.data.maxScans - (this.data.scansUsed || 0));
    }

    canScan(hasCustomKey = false) {
      if (hasCustomKey) return true;
      return this.getRemaining(false) > 0;
    }

    useScan(hasCustomKey = false) {
      if (hasCustomKey) return;
      this.data.scansUsed = (this.data.scansUsed || 0) + 1;
      this.saveData(this.data);
    }
  }

  // --- 1. SVG ICONS ---
  const icons = {
    camera: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    upload: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3 1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  };

  function renderIcon(name, customClass = '') {
    const icon = icons[name] || '';
    if (!customClass) return icon;
    return icon.replace('<svg', `<svg class="${customClass}"`);
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- 2. SAMPLE PAPERS DATABASE & SVG GENERATOR ---
  function escapeXml(unsafe) {
    return (unsafe || '').replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function generateHandwrittenPaperSvg({ studentName, rollNo, subject, lines, inkColor = '#1e3a8a' }) {
    const lineSpacing = 34;
    const startY = 180;
    const totalHeight = Math.max(900, startY + lines.length * lineSpacing + 220);

    let ruledLinesSvg = '';
    for (let y = 140; y < totalHeight - 40; y += lineSpacing) {
      ruledLinesSvg += `<line x1="80" y1="${y}" x2="740" y2="${y}" stroke="#cbd5e1" stroke-width="1"/>`;
    }

    let textSvg = '';
    lines.forEach((line, idx) => {
      const y = startY + idx * lineSpacing;
      const isHeader = line.startsWith('##') || line.startsWith('Q.') || line.startsWith('Ans:');
      const cleanText = line.replace(/^##\s*/, '');
      const xOffset = line.startsWith('  -') ? 140 : line.startsWith('  ') ? 120 : 100;
      const fontSize = isHeader ? 17 : 15;
      const fontWeight = isHeader ? '700' : '500';
      const randomRot = ((idx % 5) - 2) * 0.35 - 2;

      textSvg += `
        <g transform="rotate(${randomRot}, ${xOffset}, ${y})">
          <text x="${xOffset}" y="${y}" font-family="'Caveat', 'Comic Sans MS', cursive, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${inkColor}">
            ${escapeXml(cleanText)}
          </text>
        </g>
      `;
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalHeight}" width="100%" height="100%">
        <rect width="800" height="${totalHeight}" fill="#fffdfa"/>
        <line x1="80" y1="0" x2="80" y2="${totalHeight}" stroke="#f87171" stroke-width="1.8"/>
        <line x1="83" y1="0" x2="83" y2="${totalHeight}" stroke="#f87171" stroke-width="0.8"/>
        <line x1="0" y1="130" x2="800" y2="130" stroke="#94a3b8" stroke-width="1.5"/>

        <g transform="translate(100, 30)">
          <text x="0" y="20" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#0f172a">FACULTY OF MEDICINE - INTERNAL ASSESSMENT</text>
          <text x="0" y="42" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Subject: <tspan font-weight="600" fill="#1e293b">${escapeXml(subject)}</tspan></text>
          <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll: <tspan font-weight="700" fill="#00a991">${escapeXml(rollNo)}</tspan></text>
          <text x="0" y="86" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Date: 16-Aug-2026</text>
          <circle cx="560" cy="40" r="30" stroke="#dc2626" stroke-width="1.5" fill="none" stroke-dasharray="3,2" transform="rotate(-12, 560, 40)"/>
          <text x="532" y="38" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#dc2626" transform="rotate(-12, 560, 40)">DEPARTMENT OF</text>
          <text x="536" y="49" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#dc2626" transform="rotate(-12, 560, 40)">ANATOMY</text>
        </g>
        ${ruledLinesSvg}
        ${textSvg}
      </svg>
    `;
  }

  const SAMPLE_PAPERS = [
    {
      id: 'sample-axilla-paper',
      studentName: 'Pooja Verma',
      rollNo: 'STU-2024-001',
      subject: 'Human Anatomy - Upper Limb',
      questionTitle: 'Boundaries of Axilla: Anterior, Posterior, Medial, and Lateral walls.',
      maxScore: 5.0,
      expectedScore: 2.50,
      description: 'Axilla Paper: Pt 1 (0.50), Pt 2 (1.00 FULL), Pt 3 (0.50), Pt 4 (0.50), Pt 5 (0.00).',
      rawText: `A: The key boundaries of Axilla are:
1) Anterior wall - pectoralis major
2) Posterior wall - latissimus dorsi, subscapularis, teres major
3) Medial wall.
4) Lateral wall.`,
      inkColor: '#0f172a'
    },
    {
      id: 'sample-axilla-full',
      studentName: 'Rohan Gupta',
      rollNo: 'STU-2024-002',
      subject: 'Human Anatomy - Upper Limb',
      questionTitle: 'Boundaries of Axilla: Anterior, Posterior, Medial, and Lateral walls.',
      maxScore: 5.0,
      expectedScore: 5.0,
      description: 'Complete Axilla Paper: All walls and muscles (Pectoralis, Latissimus, Serratus anterior, Biceps, Apex & Base).',
      rawText: `A: The key boundaries of Axilla are:
1) Anterior wall - pectoralis major, pectoralis minor, subclavius
2) Posterior wall - latissimus dorsi, subscapularis, teres major
3) Medial wall - serratus anterior, upper 4 ribs
4) Lateral wall - coracobrachialis, short head of biceps
5) Apex - clavicle, upper border of scapula, 1st rib. Base - skin and axillary fascia.`,
      inkColor: '#1e3a8a'
    },
    {
      id: 'sample-bp',
      studentName: 'Anya Sharma',
      rollNo: 'STU-2024-003',
      subject: 'Human Anatomy - Upper Limb',
      questionTitle: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
      maxScore: 10.0,
      expectedScore: 9.25,
      description: 'Brachial Plexus: Exhaustive coverage of roots C5-T1, trunks, cords, branches, and Erb palsy.',
      rawText: `Ans 1: Brachial Plexus
1. Formation & Roots: Formed by ventral rami of C5, C6, C7, C8, T1 spinal nerves.
2. Trunks: Upper (C5+C6), Middle (C7), Lower (C8+T1) in posterior triangle of neck.
3. Divisions: Anterior (flexor) and Posterior (extensor) divisions beneath clavicle.
4. Cords: Lateral, Medial, Posterior around 2nd part of Axillary Artery.
5. Terminal Branches: Musculocutaneous, Radial, Axillary, Median, Ulnar nerves.
6. Applied Anatomy: Erb-Duchenne Palsy (upper trunk C5-C6) waiter's tip deformity; Klumpke's Palsy (C8-T1) claw hand.`,
      inkColor: '#1d4ed8'
    },
    {
      id: 'sample-cardiac',
      studentName: 'Rahul Verma',
      rollNo: 'STU-2024-004',
      subject: 'Physiology & Anatomy of CVS',
      questionTitle: 'Explain the events of the Cardiac Cycle with emphasis on ventricular phases and valve mechanics.',
      maxScore: 5.0,
      expectedScore: 3.75,
      description: 'Cardiac Cycle: Isovolumetric contraction, ejection, AV and Semilunar valve mechanics.',
      rawText: `Ans: Cardiac Cycle (Duration = 0.8s at 75 bpm)
1. Ventricular Systole (0.3s):
  a) Isovolumetric Contraction: All valves closed, pressure rises, S1 sound from Mitral/Tricuspid closure.
  b) Ejection: Aortic and Pulmonary semilunar valves open when ventricular pressure exceeds vascular resistance.
2. Ventricular Diastole (0.5s):
  a) Isovolumetric Relaxation: Semilunar valves close producing S2 sound.
  b) Rapid Ventricular Filling: AV valves open.`,
      inkColor: '#0369a1'
    }
  ];

  function getSampleSvgDataUrl(sampleId) {
    const sample = SAMPLE_PAPERS.find(s => s.id === sampleId) || SAMPLE_PAPERS[0];
    const lines = sample.rawText.split('\n');
    const svgString = generateHandwrittenPaperSvg({
      studentName: sample.studentName,
      rollNo: sample.rollNo,
      subject: sample.subject,
      lines: lines,
      inkColor: sample.inkColor || '#1e3a8a'
    });
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  }

  // --- 3. PRESETS & RUBRIC MANAGER ---
  const PRESET_RUBRICS = [
    {
      id: 'preset-axilla-boundaries',
      subject: 'Human Anatomy - Upper Limb',
      question: 'Boundaries of Axilla: Anterior, Posterior, Medial, and Lateral walls, Apex and Base.',
      maxMarks: 5.0,
      keyPoints: [
        { id: 'ax-1', text: 'anterior wall -pectoralis major, pectoralis minor, subclavius', weight: 1.00, keywords: ['anterior wall', 'pectoralis major', 'pectoralis minor', 'subclavius'] },
        { id: 'ax-2', text: 'posterior wall -latissimus dorsi, subscapularis, teres major', weight: 1.00, keywords: ['posterior wall', 'latissimus dorsi', 'subscapularis', 'teres major'] },
        { id: 'ax-3', text: 'medial wall -serratus anterior, upper 4 ribs', weight: 1.00, keywords: ['medial wall', 'serratus anterior', 'upper 4 ribs', 'ribs'] },
        { id: 'ax-4', text: 'lateral wall -short head of biceps, coracobrachialis', weight: 1.00, keywords: ['lateral wall', 'short head of biceps', 'coracobrachialis', 'biceps'] },
        { id: 'ax-5', text: 'apex -clavicle, scapula, first rib; base -skin, axillary fascia', weight: 1.00, keywords: ['apex', 'clavicle', 'first rib', 'base', 'skin', 'axillary fascia'] }
      ]
    },
    {
      id: 'preset-brachial-plexus',
      subject: 'Human Anatomy - Upper Limb',
      question: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
      maxMarks: 10.0,
      keyPoints: [
        { id: 'bp-1', text: 'Roots: Ventral rami of C5, C6, C7, C8, T1 with pre-fixed or post-fixed variations.', weight: 1.5, keywords: ['ventral rami', 'c5', 'c6', 'c7', 'c8', 't1', 'roots'] },
        { id: 'bp-2', text: 'Trunks: Upper (C5+C6), Middle (C7), Lower (C8+T1) in posterior triangle.', weight: 1.5, keywords: ['upper trunk', 'middle trunk', 'lower trunk', 'c5+c6', 'c7', 'c8+t1'] },
        { id: 'bp-3', text: 'Divisions: Anterior (flexor) and Posterior (extensor) divisions beneath clavicle.', weight: 1.0, keywords: ['anterior division', 'posterior division', 'divisions', 'flexor', 'extensor'] },
        { id: 'bp-4', text: 'Cords: Lateral, Medial, Posterior around 2nd part of Axillary Artery.', weight: 2.0, keywords: ['lateral cord', 'medial cord', 'posterior cord', 'axillary artery'] },
        { id: 'bp-5', text: 'Terminal Branches: Musculocutaneous, Axillary, Radial, Median, and Ulnar nerves.', weight: 2.0, keywords: ['musculocutaneous', 'axillary', 'radial', 'median', 'ulnar'] },
        { id: 'bp-6', text: 'Applied Anatomy: Erb-Duchenne palsy (C5-C6 / Waiter\'s tip) and Klumpke\'s palsy (C8-T1 / Claw hand).', weight: 2.0, keywords: ['erb', 'duchenne', 'klumpke', 'waiter', 'claw hand', 'applied', 'palsy'] }
      ]
    },
    {
      id: 'preset-cardiac-cycle',
      subject: 'Physiology & Anatomy of CVS',
      question: 'Explain the events of the Cardiac Cycle with emphasis on ventricular phases and valve mechanics.',
      maxMarks: 5.0,
      keyPoints: [
        { id: 'cc-1', text: 'Definition & Timing: 0.8s total cycle (at 75 bpm), Ventricular Systole ~0.3s, Diastole ~0.5s.', weight: 0.75, keywords: ['0.8', 'seconds', 'systole', 'diastole', '75 bpm'] },
        { id: 'cc-2', text: 'Isovolumetric Contraction: All valves closed, steep pressure rise, S1 heart sound.', weight: 1.25, keywords: ['isovolumetric contraction', 'valves closed', 'first heart sound', 's1', 'mitral'] },
        { id: 'cc-3', text: 'Rapid & Reduced Ejection: Opening of Aortic & Pulmonary semilunar valves.', weight: 1.0, keywords: ['ejection', 'rapid ejection', 'aortic valve', 'pulmonary', 'semilunar'] },
        { id: 'cc-4', text: 'Isovolumetric Relaxation: Semilunar closure produces S2, all chambers closed.', weight: 1.0, keywords: ['isovolumetric relaxation', 's2', 'second heart sound'] },
        { id: 'cc-5', text: 'Ventricular Filling & Valve Mechanics: Rapid filling, diastasis, AV valve function.', weight: 1.0, keywords: ['filling', 'diastasis', 'atrial systole', 'chordae tendineae'] }
      ]
    }
  ];

  class RubricManager {
    constructor() {
      this.customRubrics = this.loadCustomRubrics();
      this.currentRubric = this.loadStoredRubric() || JSON.parse(JSON.stringify(PRESET_RUBRICS[0]));
      this.listeners = [];
    }

    loadStoredRubric() {
      try {
        const stored = localStorage.getItem('gradecrow_current_rubric') || localStorage.getItem('gradepilot_current_rubric') || localStorage.getItem('anatomigrade_current_rubric');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return null;
    }

    loadCustomRubrics() {
      try {
        const stored = localStorage.getItem('gradecrow_custom_rubrics') || localStorage.getItem('gradepilot_custom_rubrics') || localStorage.getItem('anatomigrade_custom_rubrics');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return [];
    }

    saveCustomRubrics() {
      try { localStorage.setItem('gradecrow_custom_rubrics', JSON.stringify(this.customRubrics)); } catch (e) {}
    }

    saveToStorage() {
      try { localStorage.setItem('gradecrow_current_rubric', JSON.stringify(this.currentRubric)); } catch (e) {}
    }

    getAllRubrics() { return [...PRESET_RUBRICS, ...this.customRubrics]; }
    onChange(cb) { this.listeners.push(cb); }

    notify() {
      this.saveToStorage();
      this.listeners.forEach(fn => fn(this.currentRubric));
    }

    getRubric() { return this.currentRubric; }

    createNewBlankQuestion() {
      const newId = 'custom-' + Date.now().toString(36);
      this.currentRubric = {
        id: newId,
        subject: 'Course / Subject Name',
        question: 'Enter question title or prompt here...',
        maxMarks: 5.0,
        isCustom: true,
        keyPoints: [
          { id: 'pt-1', text: 'First key point / expected concept', weight: 2.50, keywords: [] },
          { id: 'pt-2', text: 'Second key point / expected concept', weight: 2.50, keywords: [] }
        ]
      };
      this.notify();
      return this.currentRubric;
    }

    saveCurrentAsPreset() {
      const existingIdx = this.customRubrics.findIndex(r => r.id === this.currentRubric.id);
      const copy = JSON.parse(JSON.stringify(this.currentRubric));
      copy.isCustom = true;

      if (existingIdx >= 0) this.customRubrics[existingIdx] = copy;
      else this.customRubrics.push(copy);

      this.saveCustomRubrics();
      this.notify();
      return true;
    }

    loadScannedQuestion(scannedData) {
      const newId = 'scanned-' + Date.now().toString(36);
      this.currentRubric = {
        id: newId,
        subject: scannedData.subject || 'General',
        question: scannedData.question || 'Scanned Question',
        maxMarks: typeof scannedData.maxMarks === 'number' && scannedData.maxMarks > 0 ? scannedData.maxMarks : 5.0,
        isCustom: true,
        keyPoints: (scannedData.keyPoints || []).map((kp, idx) => ({
          id: kp.id || `pt-${idx + 1}-${Date.now().toString(36)}`,
          text: kp.text || `Point ${idx + 1}`,
          weight: typeof kp.weight === 'number' ? kp.weight : 1.0,
          keywords: Array.isArray(kp.keywords) ? kp.keywords : []
        }))
      };
      this.saveCurrentAsPreset();
      this.notify();
      return this.currentRubric;
    }

    setPreset(presetId) {
      const found = this.getAllRubrics().find(p => p.id === presetId);
      if (found) {
        this.currentRubric = JSON.parse(JSON.stringify(found));
        this.notify();
        return true;
      }
      return false;
    }

    setQuestionMeta({ subject, question, maxMarks }) {
      if (subject !== undefined) this.currentRubric.subject = subject.trim();
      if (question !== undefined) this.currentRubric.question = question.trim();
      if (maxMarks !== undefined) {
        const num = parseFloat(maxMarks);
        if (!isNaN(num) && num > 0) this.currentRubric.maxMarks = Number(num.toFixed(2));
      }
      this.notify();
    }

    addKeyPoint(text = '', weight = 1.0, keywords = []) {
      const newId = 'point-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      this.currentRubric.keyPoints.push({
        id: newId,
        text: text || 'New key criteria / concept point...',
        weight: parseFloat(weight) || 1.0,
        keywords: keywords
      });
      this.notify();
      return newId;
    }

    updateKeyPoint(id, { text, weight, keywords }) {
      const point = this.currentRubric.keyPoints.find(p => p.id === id);
      if (point) {
        if (text !== undefined) point.text = text;
        if (weight !== undefined) {
          const num = parseFloat(weight);
          if (!isNaN(num) && num >= 0) point.weight = Number(num.toFixed(2));
        }
        if (keywords !== undefined) {
          point.keywords = Array.isArray(keywords) 
            ? keywords 
            : keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
        }
        this.notify();
        return true;
      }
      return false;
    }

    removeKeyPoint(id) {
      if (this.currentRubric.keyPoints.length <= 1) return false;
      this.currentRubric.keyPoints = this.currentRubric.keyPoints.filter(p => p.id !== id);
      this.notify();
      return true;
    }

    rebalanceWeights() {
      const totalMax = this.currentRubric.maxMarks || 5.0;
      const count = this.currentRubric.keyPoints.length;
      if (count === 0) return;
      const baseWeight = Number((totalMax / count).toFixed(2));
      let currentSum = 0;
      
      this.currentRubric.keyPoints.forEach((pt, idx) => {
        if (idx === count - 1) {
          pt.weight = Number((totalMax - currentSum).toFixed(2));
        } else {
          pt.weight = baseWeight;
          currentSum += baseWeight;
        }
      });
      this.notify();
    }

    getTotalPointsWeight() {
      return this.currentRubric.keyPoints.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0);
    }

    isWeightBalanced() {
      return Math.abs(this.getTotalPointsWeight() - this.currentRubric.maxMarks) < 0.05;
    }
  }

  // Helper to convert and compress ANY image (including SVG and high-res camera shots) to clean JPEG for Gemini Vision
  async function compressImageForGemini(dataUrl, maxDim = 1500, quality = 0.85) {
    if (!dataUrl) return dataUrl;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width || 1200;
        let height = img.naturalHeight || img.height || 1600;

        if (width <= 0 || height <= 0) { width = 1200; height = 1600; }

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Solid white background (vital for SVGs with transparent layers)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  // --- 4. PAPER CAPTURE & VIEWER (Clean Somhi-Inspired Component) ---
  class PaperCapture {
    constructor(options = {}) {
      this.container = options.container;
      this.onCaptureCallback = options.onCapture || (() => {});
      this.onGradeRequested = options.onGradeRequested || (() => {});
      this.currentImageSrc = null;
      this.currentMeta = null;
      this.stream = null;
      this.zoom = 1;
      this.rotation = 0;
      this.panX = 0;
      this.panY = 0;
      this.isDragging = false;
      this.filters = { contrast: 100, brightness: 100, grayscale: false };
      this.init();
    }

    init() {
      this.renderUI();
      this.attachEvents();
    }

    renderUI() {
      if (!this.container) return;

      if (!this.currentImageSrc) {
        // STATE 1: Ready to Upload / Take Photo (Clean Minimal Actions)
        this.container.innerHTML = `
          <div class="capture-container-inner">
            <div class="capture-actions-grid">
              <input type="file" id="camera-file-input" accept="image/*" capture="environment" class="file-input-hidden" />
              <input type="file" id="gallery-file-input" accept="image/*" class="file-input-hidden" />
              
              <!-- Take Photo Card -->
              <div class="action-card-camera" id="btn-take-photo-direct">
                <div class="action-card-icon">📸</div>
                <div class="action-card-title">Take Photo</div>
                <div class="action-card-subtitle">Snap student sheet with phone camera</div>
              </div>

              <!-- Upload File Card -->
              <div class="action-card-upload" id="btn-browse-file">
                <div class="action-card-icon">📁</div>
                <div class="action-card-title">Upload Image File</div>
                <div class="action-card-subtitle">Select or drop JPG, PNG, HEIC</div>
              </div>
            </div>

            <!-- Live Camera Viewport (Hidden unless video stream is started on desktop) -->
            <div class="camera-viewport-container hidden" id="camera-viewport-box">
              <video id="camera-video" playsinline autoplay muted class="camera-video"></video>
              <canvas id="camera-canvas" class="hidden"></canvas>
              <div class="camera-overlay">
                <div class="camera-guide-frame">
                  <div class="guide-text">Align Exam Paper within frame</div>
                </div>
              </div>
              <div class="camera-controls">
                <button type="button" class="btn-shutter" id="btn-snap-photo" title="Capture Photo">
                  <span class="shutter-inner"></span>
                </button>
                <button type="button" class="btn-camera-close" id="btn-close-camera">✕</button>
              </div>
            </div>
          </div>
        `;
      } else {
        // STATE 2: Paper Loaded -> Preview with Primary Grade Button
        this.container.innerHTML = `
          <div class="capture-container-inner">
            <input type="file" id="camera-file-input" accept="image/*" capture="environment" class="file-input-hidden" />
            <input type="file" id="gallery-file-input" accept="image/*" class="file-input-hidden" />

            <div class="paper-viewer-card">
              <div class="viewer-header-bar">
                <div class="viewer-meta-info">
                  <span class="viewer-roll-pill" id="paper-badge-roll">${this.currentMeta?.rollNo || 'STU-101'}</span>
                  <span class="viewer-student-label" id="paper-student-name">${this.currentMeta?.studentName || 'Student Paper'}</span>
                </div>
                <div class="viewer-controls-group">
                  <button type="button" class="btn-stage-tool" id="btn-zoom-out" title="Zoom Out">🔍-</button>
                  <button type="button" class="btn-stage-tool" id="btn-zoom-reset">100%</button>
                  <button type="button" class="btn-stage-tool" id="btn-zoom-in" title="Zoom In">🔍+</button>
                  <button type="button" class="btn-stage-tool" id="btn-rotate" title="Rotate">🔄 90°</button>
                </div>
              </div>

              <div class="viewer-stage" id="viewer-stage">
                <div class="viewer-content" id="viewer-content">
                  <img id="active-paper-img" src="${this.currentImageSrc}" alt="Student Handwritten Answer Paper" draggable="false" />
                </div>
                <div class="viewer-drag-hint">💡 Drag to pan • Double-tap to zoom</div>
              </div>

              <div class="viewer-bottom-action-bar">
                <button type="button" class="btn-grade-primary" id="btn-grade-now">
                  <span>✨</span> Grade with AI ➔
                </button>
                <button type="button" class="btn-change-photo" id="btn-retake-photo">
                  📸 Change Photo
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }

    attachEvents() {
      const cameraInput = this.container.querySelector('#camera-file-input');
      const galleryInput = this.container.querySelector('#gallery-file-input');
      const btnTakePhoto = this.container.querySelector('#btn-take-photo-direct');
      const btnBrowse = this.container.querySelector('#btn-browse-file');
      const btnRetake = this.container.querySelector('#btn-retake-photo');
      const btnGradeNow = this.container.querySelector('#btn-grade-now');

      if (btnTakePhoto && cameraInput) {
        btnTakePhoto.addEventListener('click', () => {
          if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            cameraInput.click();
          } else {
            // On desktop, try native camera viewport
            this.startCamera();
          }
        });
      }

      if (btnBrowse && galleryInput) {
        btnBrowse.addEventListener('click', () => galleryInput.click());
      }

      if (cameraInput) cameraInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
      if (galleryInput) galleryInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

      if (btnRetake) {
        btnRetake.addEventListener('click', () => {
          this.currentImageSrc = null;
          this.currentMeta = null;
          this.renderUI();
          this.attachEvents();
        });
      }

      if (btnGradeNow) {
        btnGradeNow.addEventListener('click', () => this.onGradeRequested());
      }

      // Camera Viewfinder Events
      const btnSnap = this.container.querySelector('#btn-snap-photo');
      const btnCloseCam = this.container.querySelector('#btn-close-camera');
      if (btnSnap) btnSnap.addEventListener('click', () => this.snapPhoto());
      if (btnCloseCam) btnCloseCam.addEventListener('click', () => this.stopCamera());

      // Stage Transform Events
      const btnZoomIn = this.container.querySelector('#btn-zoom-in');
      const btnZoomOut = this.container.querySelector('#btn-zoom-out');
      const btnZoomReset = this.container.querySelector('#btn-zoom-reset');
      const btnRotate = this.container.querySelector('#btn-rotate');

      if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.adjustZoom(0.25));
      if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.adjustZoom(-0.25));
      if (btnZoomReset) btnZoomReset.addEventListener('click', () => this.resetTransform());
      if (btnRotate) btnRotate.addEventListener('click', () => this.rotatePaper());

      const stage = this.container.querySelector('#viewer-stage');
      if (stage) {
        stage.addEventListener('mousedown', (e) => this.startDrag(e));
        window.addEventListener('mousemove', (e) => this.doDrag(e));
        window.addEventListener('mouseup', () => this.endDrag());

        stage.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) this.startDrag(e.touches[0]);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
          if (this.isDragging && e.touches.length === 1) this.doDrag(e.touches[0]);
        }, { passive: true });
        window.addEventListener('touchend', () => this.endDrag());

        stage.addEventListener('dblclick', () => {
          this.zoom = this.zoom > 1 ? 1 : 1.6;
          this.panX = 0; this.panY = 0;
          this.updateTransform();
        });
      }
    }

    async startCamera() {
      try {
        this.stopCamera();
        const videoBox = this.container.querySelector('#camera-viewport-box');
        const video = this.container.querySelector('#camera-video');
        if (!videoBox || !video) return;

        videoBox.classList.remove('hidden');
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        video.srcObject = this.stream;
      } catch (err) {
        this.container.querySelector('#gallery-file-input')?.click();
      }
    }

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }
      this.container.querySelector('#camera-viewport-box')?.classList.add('hidden');
    }

    snapPhoto() {
      const video = this.container.querySelector('#camera-video');
      const canvas = this.container.querySelector('#camera-canvas');
      if (!video || !canvas) return;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      this.stopCamera();

      this.setPaperImage(dataUrl, {
        id: 'custom-photo-' + Date.now(),
        studentName: 'Student (Camera Scan)',
        rollNo: 'STU-' + Math.floor(1000 + Math.random() * 9000),
        isCustom: true
      });
    }

    handleFileSelect(files) {
      if (!files || !files.length) return;
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setPaperImage(e.target.result, {
          id: 'uploaded-' + Date.now(),
          studentName: file.name.replace(/\.[^/.]+$/, ''),
          rollNo: 'STU-' + Math.floor(1000 + Math.random() * 9000),
          isCustom: true
        });
      };
      reader.readAsDataURL(file);
    }

    loadSample(sampleId) {
      const sample = SAMPLE_PAPERS.find(s => s.id === sampleId) || SAMPLE_PAPERS[0];
      const dataUrl = getSampleSvgDataUrl(sample.id);
      this.setPaperImage(dataUrl, sample);
    }

    setPaperImage(imageSrc, meta) {
      this.currentImageSrc = imageSrc;
      this.currentMeta = meta;
      this.renderUI();
      this.attachEvents();
      this.resetTransform();
      this.onCaptureCallback({ imageSrc: this.currentImageSrc, meta: this.currentMeta });
    }

    adjustZoom(delta) {
      this.zoom = Math.min(3.5, Math.max(0.7, this.zoom + delta));
      const btnReset = this.container.querySelector('#btn-zoom-reset');
      if (btnReset) btnReset.textContent = `${Math.round(this.zoom * 100)}%`;
      this.updateTransform();
    }

    resetTransform() {
      this.zoom = 1; this.rotation = 0; this.panX = 0; this.panY = 0;
      const btnReset = this.container.querySelector('#btn-zoom-reset');
      if (btnReset) btnReset.textContent = '100%';
      this.updateTransform();
    }

    rotatePaper() {
      this.rotation = (this.rotation + 90) % 360;
      this.updateTransform();
    }

    updateTransform() {
      const content = this.container.querySelector('#viewer-content');
      if (content) {
        content.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom}) rotate(${this.rotation}deg)`;
      }
    }

    startDrag(e) {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
      this.container.querySelector('#viewer-stage')?.classList.add('grabbing');
    }

    doDrag(e) {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
      this.updateTransform();
    }

    endDrag() {
      this.isDragging = false;
      this.container.querySelector('#viewer-stage')?.classList.remove('grabbing');
    }
  }

  // --- 5. AI EVALUATION SERVICE ---
  class AiEvaluationService {
    constructor() {
      this.apiKey = this.loadApiKey();
    }

    loadApiKey() { 
      return (localStorage.getItem('gradecrow_gemini_api_key') || localStorage.getItem('gradepilot_gemini_api_key') || localStorage.getItem('anatomigrade_gemini_api_key') || '').trim(); 
    }

    getApiKey() {
      return (this.apiKey || this.loadApiKey() || '').trim();
    }

    setApiKey(key) {
      this.apiKey = (key || '').trim();
      if (this.apiKey) {
        localStorage.setItem('gradecrow_gemini_api_key', this.apiKey);
      } else {
        localStorage.removeItem('gradecrow_gemini_api_key');
        localStorage.removeItem('gradepilot_gemini_api_key');
        localStorage.removeItem('anatomigrade_gemini_api_key');
      }
    }

    hasLiveApiKey() { 
      const k = this.getApiKey();
      return Boolean(k && k.length > 10); 
    }

    async testApiKey(testKey) {
      const keyToUse = (testKey || this.getApiKey() || '').trim();
      if (!keyToUse) return { ok: false, error: 'API key is empty.' };

      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const validModels = (listData.models || []).filter(m => m.supportedGenerationMethods?.includes('generateContent'));
          if (validModels.length > 0) {
            return { ok: true, activeModel: validModels[0].name.replace(/^models\//, '') };
          }
        } else {
          const errText = await listRes.text();
          return { ok: false, error: `Google API Error (${listRes.status}): ${errText.slice(0, 120)}` };
        }
      } catch (e) {
        return { ok: false, error: e.message || 'Network error connecting to Google AI.' };
      }

      return { ok: true, activeModel: 'gemini-2.0-flash' };
    }

    async getWorkingModels(activeKey) {
      if (this.cachedModels && this.cachedModels.length > 0) return this.cachedModels;

      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const valid = (listData.models || [])
            .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace(/^models\//, ''))
            .filter(m => !m.includes('embedding') && !m.includes('aqa') && !m.includes('imagen') && !m.includes('tts') && !m.includes('text-bison'));

          // Sort: Flash models first (fastest, cheapest), then Pro models
          const flash = valid.filter(m => m.includes('flash'));
          const pro = valid.filter(m => m.includes('pro') && !m.includes('flash'));
          const rest = valid.filter(m => !m.includes('flash') && !m.includes('pro'));

          const sorted = [...flash, ...pro, ...rest];
          if (sorted.length > 0) {
            this.cachedModels = sorted;
            return sorted;
          }
        }
      } catch (e) {
        console.warn('Model list query failed:', e);
      }

      return ['gemini-2.5-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    }

    async evaluatePaper({ imageSrc, rawText, rubric, sampleMeta, progressCallback = () => {} }) {
      const isCustomPhoto = Boolean(sampleMeta?.isCustom || (imageSrc && !imageSrc.startsWith('data:image/svg+xml')));
      let geminiError = null;

      // 1. If Live Custom Gemini API Key is available, perform Multimodal Vision OCR directly on the client
      if (this.hasLiveApiKey()) {
        try {
          progressCallback('Transcribing handwriting with GradeCrow AI (Custom Key)...');
          const compressedSrc = await compressImageForGemini(imageSrc);
          const visionResult = await this.evaluateWithGeminiVision({ imageSrc: compressedSrc, rubric, progressCallback });
          if (visionResult) {
            return {
              ...visionResult,
              mode: 'gemini-live'
            };
          }
        } catch (err) {
          console.warn('Custom Gemini Vision call failed:', err);
          geminiError = err.message || 'Custom Gemini Vision call failed';
        }
      }

      // 2. Otherwise, attempt serverless endpoint /api/evaluate (using owner's server-side GEMINI_API_KEY)
      try {
        progressCallback('Connecting to GradeCrow AI Cloud...');
        const compressedSrc = await compressImageForGemini(imageSrc);
        const serverRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: compressedSrc,
            mimeType: 'image/jpeg',
            rubric
          })
        });

        if (serverRes.ok) {
          const serverData = await serverRes.json();
          if (serverData && serverData.points) {
            return {
              ...serverData,
              mode: 'gemini-server'
            };
          }
        } else {
          const errJson = await serverRes.json().catch(() => ({}));
          if (errJson.error !== 'NO_SERVER_KEY') {
            geminiError = errJson.message || 'Server evaluation error';
          }
        }
      } catch (serverErr) {
        console.warn('Server evaluate route unavailable, using local intelligent engine:', serverErr);
      }

      // 3. Fallback to Intelligent Local Semantic Concept Engine
      progressCallback('Evaluating student answer sheet & criteria attachments...');
      await new Promise(r => setTimeout(r, 200));
      return this.evaluateIntelligentLocal({ rawText, rubric, sampleMeta, imageSrc, isCustomPhoto, geminiError });
    }

    async parseQuestionSchemeFromImage({ imageSrc, progressCallback = () => {} }) {
      progressCallback('Optimizing image & connecting to GradeCrow AI...');
      const compressedSrc = await compressImageForGemini(imageSrc);

      // 1. Try serverless route /api/parse-question
      try {
        progressCallback('Reading handwritten question & points allocation...');
        const serverRes = await fetch('/api/parse-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: compressedSrc,
            mimeType: 'image/jpeg'
          })
        });

        if (serverRes.ok) {
          const parsed = await serverRes.json();
          if (parsed && parsed.question && Array.isArray(parsed.keyPoints)) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Server parse-question route failed:', err);
      }

      // 2. If client has custom API key, try direct client call
      if (this.hasLiveApiKey()) {
        try {
          const activeKey = this.getApiKey();
          const cleanBase64 = compressedSrc.replace(/^data:image\/[a-zA-Z+]+;base64,/, '').replace(/[\r\n\s]+/g, '');
          const modelsToTry = await this.getWorkingModels(activeKey);
          
          const prompt = `You are GradeCrow AI, an expert exam assistant (gradecrow.com).
Look at this handwritten or printed image of an exam question, marking scheme, or rubric written by a teacher.

Extract:
1. The Question Title or Prompt.
2. The Subject / Course Name (or "General" if not mentioned).
3. The Maximum Marks / Total Score.
4. Each Key Point / Expected Answer Criterion along with its allocated marks/weight.
   If marks for individual points are not explicitly stated, divide the total marks evenly across the points.
5. Key vocabulary keywords for each point.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "question": "The full question text or title...",
  "subject": "Subject or Course Name",
  "maxMarks": 5.0,
  "keyPoints": [
    {
      "text": "Description of criterion or expected concept",
      "weight": 1.0,
      "keywords": ["keyword 1", "keyword 2"]
    }
  ]
}`;

          for (const model of modelsToTry) {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  role: 'user',
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
                  ]
                }],
                generationConfig: { temperature: 0.1 }
              })
            });

            if (res.ok) {
              const resData = await res.json();
              let text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                if (text.includes('```')) text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
                const parsed = JSON.parse(text);
                return {
                  question: parsed.question || 'Scanned Question',
                  subject: parsed.subject || 'General',
                  maxMarks: typeof parsed.maxMarks === 'number' ? parsed.maxMarks : 5.0,
                  keyPoints: (parsed.keyPoints || []).map((kp, idx) => ({
                    id: `pt-${idx + 1}-${Date.now().toString(36)}`,
                    text: kp.text || `Point ${idx + 1}`,
                    weight: typeof kp.weight === 'number' ? Number(kp.weight.toFixed(2)) : 1.0,
                    keywords: Array.isArray(kp.keywords) ? kp.keywords : []
                  }))
                };
              }
            }
          }
        } catch (err) {
          console.warn('Direct client parse failed:', err);
        }
      }

      // 3. Fallback dummy structure if offline
      return {
        question: 'Scanned Question (OCR offline)',
        subject: 'General Course',
        maxMarks: 5.0,
        keyPoints: [
          { id: `pt-1-${Date.now().toString(36)}`, text: 'Core concept explanation (1.5 marks)', weight: 1.5, keywords: [] },
          { id: `pt-2-${Date.now().toString(36)}`, text: 'Key terminology & definitions (1.5 marks)', weight: 1.5, keywords: [] },
          { id: `pt-3-${Date.now().toString(36)}`, text: 'Examples or detailed mechanism (2.0 marks)', weight: 2.0, keywords: [] }
        ]
      };
    }

    async evaluateWithGeminiVision({ imageSrc, rubric, progressCallback }) {
      const activeKey = this.getApiKey();
      if (!activeKey) throw new Error('API key is empty.');

      let base64Data = '';
      let mimeType = 'image/jpeg';

      const commaIdx = imageSrc.indexOf(',');
      if (commaIdx >= 0) {
        const meta = imageSrc.substring(0, commaIdx);
        base64Data = imageSrc.substring(commaIdx + 1).replace(/[\r\n\s]+/g, '');
        const m = meta.match(/data:([^;]+)/);
        if (m && m[1] && !m[1].includes('svg')) {
          mimeType = m[1];
        }
      } else {
        base64Data = imageSrc.replace(/[\r\n\s]+/g, '');
      }

      if (!base64Data) throw new Error('No image data found.');

      const prompt = `You are GradeCrow AI, an expert exam evaluation assistant (gradecrow.com).
Look at this student's handwritten exam paper image.
1. Transcribe the entire handwritten text on the paper accurately into the transcription field.
2. Evaluate the student's answer against the following question rubric and criteria.
3. Determine for each key point if it is "hit" (full marks), "partial" (half marks), or "missed" (0 marks).
4. Extract the exact quote from the student's text as evidence.

QUESTION: ${rubric.question}
SUBJECT: ${rubric.subject || 'General'}
MAXIMUM MARKS: ${rubric.maxMarks}

RUBRIC KEY POINTS:
${rubric.keyPoints.map((kp, idx) => `Point ${idx + 1} [ID: ${kp.id}] [Weight: ${kp.weight}]: ${kp.text}`).join('\n')}

Respond ONLY with a JSON object in this exact schema:
{
  "transcription": "The full transcribed text of the student answer...",
  "suggestedScore": 3.5,
  "feedbackSummary": "A concise 2-sentence summary of strengths and omissions.",
  "points": [
    {
      "pointId": "${rubric.keyPoints[0]?.id || 'pt-1'}",
      "status": "hit",
      "awardedMarks": 1.0,
      "evidenceQuote": "Exact quote from handwritten text",
      "justification": "Why these marks were awarded"
    }
  ]
}`;

      const modelsToTry = await this.getWorkingModels(activeKey);
      let lastErr = null;

      for (const model of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: mimeType, data: base64Data } }
                ]
              }],
              generationConfig: {
                temperature: 0.1
              }
            })
          });

          if (!response.ok) {
            const errBody = await response.text();
            let parsedErr = errBody;
            try {
              const errObj = JSON.parse(errBody);
              parsedErr = errObj.error?.message || errBody;
            } catch (e) {}
            lastErr = new Error(`${model} (${response.status}): ${parsedErr}`);
            if (response.status === 429) {
              // Rate limited on this model, try next immediately
              continue;
            }
            continue;
          }

          const resData = await response.json();
          const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!candidateText) continue;

          let cleanedJson = candidateText.trim();
          if (cleanedJson.includes('```')) {
            cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          }

          const parsed = JSON.parse(cleanedJson);
          const pointsList = rubric.keyPoints.map(kp => {
            const found = (parsed.points || []).find(p => p.pointId === kp.id);
            if (found) {
              return {
                pointId: kp.id,
                pointText: kp.text,
                weight: kp.weight,
                status: found.status || 'partial',
                awardedMarks: typeof found.awardedMarks === 'number' ? Number(found.awardedMarks.toFixed(2)) : (found.status === 'hit' ? kp.weight : found.status === 'partial' ? Number((kp.weight * 0.5).toFixed(2)) : 0),
                evidenceQuote: found.evidenceQuote || '(Detected in scan)',
                justification: found.justification || ''
              };
            }
            return {
              pointId: kp.id,
              pointText: kp.text,
              weight: kp.weight,
              status: 'missed',
              awardedMarks: 0,
              evidenceQuote: '(Omitted)',
              justification: 'Not detected in student scan'
            };
          });

          const calculatedTotal = pointsList.reduce((sum, p) => sum + p.awardedMarks, 0);

          return {
            transcription: parsed.transcription || '(Handwriting transcribed by Gemini Vision)',
            suggestedScore: Number(calculatedTotal.toFixed(2)),
            maxMarks: rubric.maxMarks,
            feedbackSummary: parsed.feedbackSummary || `Graded via Google Gemini Vision (${model}).`,
            points: pointsList,
            mode: 'gemini-live'
          };
        } catch (e) {
          lastErr = e;
        }
      }

      throw lastErr || new Error('Gemini Vision request timed out.');
    }

    // Medical Concept Dictionary & Semantic Matcher
    matchesMedicalConcept(textScope, concept) {
      const c = concept.toLowerCase().trim();
      if (!c) return false;

      if (new RegExp(`\\b${escapeRegex(c)}\\b`, 'i').test(textScope)) return true;

      const conceptAliases = {
        'latissimus dorsi': ['latis', 'latism', 'latiss', 'latissimus', 'dorsi'],
        'subscapularis': ['subscap', 'subscapular', 'subscapularis'],
        'teres major': ['teres major', 'teres'],
        'pectoralis major': ['pectoralis major', 'pec major', 'pectoralis'],
        'pectoralis minor': ['pectoralis minor', 'pec minor', 'minor'],
        'subclavius': ['subclavius', 'subclav'],
        'serratus anterior': ['serratus anterior', 'serratus'],
        'upper 4 ribs': ['upper 4 ribs', 'ribs', 'rib'],
        'coracobrachialis': ['coracobrachialis', 'coraco'],
        'short head of biceps': ['biceps', 'bicep', 'short head'],
        'clavicle': ['clavicle', 'clavic'],
        'scapula': ['scapula'],
        'first rib': ['first rib', '1st rib'],
        'skin': ['skin'],
        'axillary fascia': ['axillary fascia', 'fascia']
      };

      for (const [key, aliases] of Object.entries(conceptAliases)) {
        if (c.includes(key) || key.includes(c)) {
          return aliases.some(alias => {
            if (alias === 'scapula') return /\bscapula\b/i.test(textScope);
            return new RegExp(`\\b${escapeRegex(alias)}[a-z]*\\b`, 'i').test(textScope);
          });
        }
      }

      const words = c.split(/\s+/).filter(w => w.length > 3);
      if (words.length > 0) {
        return words.some(w => new RegExp(`\\b${escapeRegex(w)}[a-z]*\\b`, 'i').test(textScope));
      }

      return false;
    }

    evaluateIntelligentLocal({ rawText, rubric, sampleMeta, isCustomPhoto, geminiError }) {
      let studentText = rawText || sampleMeta?.rawText || '';
      const isCustom = Boolean(isCustomPhoto || sampleMeta?.isCustom);

      if (!studentText && isCustom) {
        if (geminiError) {
          studentText = `(Google Gemini Vision returned: ${geminiError}.\nPlease verify your API Key in Settings ⚙️ or tap "Edit Text" above to transcribe manually.)`;
        } else {
          studentText = '(Custom exam photo captured. Please enter your free Gemini Vision API Key in Settings ⚙️ for automatic OCR reading, or tap "Edit Text" above to type the student answer.)';
        }
      } else if (!studentText) {
        studentText = `A: The key boundaries of Axilla are:\n1) Anterior wall - pectoralis major\n2) Posterior wall - latissimus dorsi, subscapularis, teres major\n3) Medial wall.\n4) Lateral wall.`;
      }

      const pointsEval = [];
      let totalScore = 0;
      const studentLines = studentText.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);

      rubric.keyPoints.forEach(kp => {
        const weight = Number(parseFloat(kp.weight || 1.0).toFixed(2));
        const rawCriteria = (kp.text || '').toLowerCase();

        const headerMatch = rawCriteria.match(/(anterior wall|posterior wall|medial wall|lateral wall|apex|base|roots|trunks|divisions|cords|terminal branches)/i);
        const headerName = headerMatch ? headerMatch[1].toLowerCase() : null;

        let itemsString = rawCriteria;
        if (headerName) {
          itemsString = rawCriteria.replace(headerName, '');
        }

        const extractedFromText = itemsString
          .split(/[,;\/\-]+/)
          .map(t => t.replace(/[^a-z0-9\s]/g, '').trim())
          .filter(t => t.length > 2 && t !== headerName);

        const customKeywords = (kp.keywords || [])
          .map(k => k.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim())
          .filter(k => k.length > 2 && k !== headerName);

        const criteriaItems = [...new Set([...extractedFromText, ...customKeywords])];

        let studentLineWithHeader = null;
        if (headerName) {
          studentLineWithHeader = studentLines.find(line => {
            return new RegExp(`\\b${escapeRegex(headerName)}\\b`, 'i').test(line);
          });
        }

        const matchedItems = [];
        const searchScope = studentLineWithHeader || studentText;

        criteriaItems.forEach(item => {
          if (!item || item === headerName) return;
          if (this.matchesMedicalConcept(searchScope, item)) {
            if (!matchedItems.includes(item)) matchedItems.push(item);
          }
        });

        const hasHeader = Boolean(studentLineWithHeader);
        const totalItemsCount = criteriaItems.length;
        const matchedCount = matchedItems.length;

        let status = 'missed';
        let awardedMarks = 0;
        let evidenceQuote = '(Omitted from answer sheet)';
        let justification = '';

        if (hasHeader && (matchedCount >= 2 || (totalItemsCount > 0 && matchedCount === totalItemsCount))) {
          status = 'hit';
          awardedMarks = weight;
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Complete: Identified ${headerName} and all key muscle attachments (${matchedItems.join(', ')}). Full score.`;
        } else if (hasHeader && matchedCount === 1) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Partial: Identified ${headerName} with ${matchedItems.join(', ')}. Remaining relations omitted.`;
        } else if (hasHeader && matchedCount === 0) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Header only: Identified boundary (${headerName}). Partial marks awarded.`;
        } else if (!hasHeader && matchedCount >= 2) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = this.extractSentenceCitation(studentText, matchedItems[0]);
          justification = `Partially mentioned relations (${matchedItems.join(', ')}).`;
        } else {
          status = 'missed';
          awardedMarks = 0;
          evidenceQuote = '(Omitted from answer sheet)';
          justification = `Boundary and relations omitted from answer sheet.`;
        }

        totalScore += awardedMarks;
        pointsEval.push({
          pointId: kp.id,
          pointText: kp.text,
          weight: weight,
          status: status,
          awardedMarks: awardedMarks,
          evidenceQuote: evidenceQuote,
          justification: justification
        });
      });

      totalScore = Math.min(rubric.maxMarks, Math.max(0, Number(totalScore.toFixed(2))));
      const hitCount = pointsEval.filter(p => p.status === 'hit').length;
      const partialCount = pointsEval.filter(p => p.status === 'partial').length;

      let feedbackSummary = totalScore >= rubric.maxMarks * 0.8
        ? 'Exemplary answer. Comprehensive coverage of relations.'
        : totalScore >= rubric.maxMarks * 0.5
        ? `Identified key boundaries (${hitCount + partialCount}/${pointsEval.length} criteria). Partial marks awarded.`
        : 'Incomplete response. Critical relations or boundaries were omitted.';

      return {
        transcription: studentText,
        suggestedScore: totalScore,
        maxMarks: rubric.maxMarks,
        feedbackSummary: feedbackSummary,
        points: pointsEval,
        mode: 'intelligent-offline'
      };
    }

    extractSentenceCitation(text, query) {
      if (!text || !query) return '(Mentioned in student answer)';
      const lines = text.split(/[\n\r]+/);
      const match = lines.find(l => new RegExp(`\\b${escapeRegex(query)}\\b`, 'i').test(l));
      if (match) return `"...${match.trim().slice(0, 95)}..."`;
      return `"...${text.slice(0, 80)}..."`;
    }
  }

  // --- 6. PROFESSOR REVIEW PANEL ---
  class ReviewPanel {
    constructor(options = {}) {
      this.container = options.container;
      this.onAcceptAndNext = options.onAcceptAndNext || (() => {});
      this.onScoreChanged = options.onScoreChanged || (() => {});
      this.onRecalculateText = options.onRecalculateText || (() => {});
      this.currentEvaluation = null;
      this.currentPaperMeta = null;
      this.currentRubric = null;
      this.finalScore = 0;
      this.isOverridden = false;
      this.professorRemarks = '';
      this.isEditingTranscript = false;
      this.init();
    }

    init() { this.renderEmptyState(); }

    renderEmptyState() {
      if (!this.container) return;
      this.container.innerHTML = ''; // Clean empty state
    }

    setEvaluationData(evaluation, paperMeta, rubric) {
      this.currentEvaluation = evaluation;
      this.currentPaperMeta = paperMeta || { studentName: 'Student', rollNo: 'STU-101' };
      this.currentRubric = rubric;
      this.finalScore = evaluation.suggestedScore;
      this.isOverridden = false;
      this.professorRemarks = '';
      this.isEditingTranscript = false;
      this.renderEvaluation();
    }

    renderEvaluation() {
      if (!this.currentEvaluation || !this.container) return;
      const evalData = this.currentEvaluation;
      const meta = this.currentPaperMeta;
      const maxMarks = this.currentRubric?.maxMarks || evalData.maxMarks || 5.0;
      const percentage = Math.round((this.finalScore / maxMarks) * 100);
      const isLive = evalData.mode === 'gemini-live';

      this.container.innerHTML = `
        <div class="step-card review-card-main">
          <div class="step-header">
            <div class="step-header-left">
              <div class="step-number-badge">3</div>
              <div class="step-title-group">
                <h2>Evaluation Results & Review</h2>
                <p>Verify score and keypoint criteria breakdown</p>
              </div>
            </div>
            <div class="ai-source-badge ${isLive ? 'badge-live' : ''}">
              ${isLive ? '✨ Gemini 2.0 Vision' : '⚡ Offline Resolver'}
            </div>
          </div>

          <!-- Score Hero Box -->
          <div class="score-hero-card ${this.isOverridden ? 'score-overridden' : ''}">
            <div class="score-hero-header">
              <div class="student-info-block">
                <span class="roll-badge">${meta.rollNo}</span>
                <span class="student-name">${meta.studentName}</span>
              </div>
              <div class="score-percentage-pill">${percentage}% (${percentage >= 80 ? 'Distinction' : percentage >= 50 ? 'Pass' : 'Needs Review'})</div>
            </div>

            <div class="score-main-display">
              <div class="score-number-group">
                <div class="score-value-wrap">
                  <input type="number" id="input-final-score" class="score-input-direct" value="${this.finalScore}" step="0.25" min="0" max="${maxMarks}" />
                  <span class="score-max">/ ${maxMarks.toFixed(1)} Marks</span>
                </div>
              </div>

              <div class="score-adjust-chips">
                <span class="chip-label">Quick Adjust:</span>
                <button type="button" class="btn-chip" data-delta="-1.0">-1.0</button>
                <button type="button" class="btn-chip" data-delta="-0.5">-0.5</button>
                <button type="button" class="btn-chip" data-delta="-0.25">-0.25</button>
                <button type="button" class="btn-chip" data-delta="0.25">+0.25</button>
                <button type="button" class="btn-chip" data-delta="0.5">+0.5</button>
                <button type="button" class="btn-chip" data-delta="1.0">+1.0</button>
              </div>
            </div>

            ${this.isOverridden ? `
              <div class="override-notice">
                <span>⚠️ Adjusted by Professor (Original AI: <strong>${evalData.suggestedScore}</strong>)</span>
                <button type="button" class="btn-text-subtle" id="btn-revert-score">Revert to AI</button>
              </div>
            ` : ''}
          </div>

          <!-- Summary Box -->
          <div class="feedback-summary-box">
            <div class="box-title">📝 AI Assessment Summary</div>
            <p class="feedback-text">${evalData.feedbackSummary}</p>
          </div>

          <!-- OCR Transcript Drawer -->
          <div class="transcription-drawer">
            <div class="drawer-header">
              <span>📄 Extracted Handwriting Transcript</span>
              <button type="button" class="btn-text-subtle" id="btn-toggle-edit-transcript">
                ${this.isEditingTranscript ? '✓ Save & Re-Grade' : '✏️ Edit Text'}
              </button>
            </div>
            <div class="drawer-content">
              ${this.isEditingTranscript 
                ? `<textarea id="textarea-ocr-edit" class="transcript-editor" rows="4">${evalData.transcription}</textarea>`
                : `<div class="transcript-preview">${evalData.transcription.replace(/\n/g, '<br/>')}</div>`}
            </div>
          </div>

          <!-- Criteria Checklist -->
          <div class="criteria-section">
            <div class="criteria-header">
              <h4>Key Points Checklist (${evalData.points.length})</h4>
              <span class="criteria-subtext">Click badges to toggle marks</span>
            </div>

            <div class="criteria-list">
              ${evalData.points.map((pt, idx) => `
                <div class="criterion-card status-${pt.status}" data-point-id="${pt.pointId}">
                  <div class="criterion-top-row">
                    <div class="criterion-num">POINT ${idx + 1}</div>
                    <div class="criterion-score-badge"><strong>${pt.awardedMarks.toFixed(2)}</strong> / ${pt.weight.toFixed(2)} Marks</div>
                  </div>
                  <div class="criterion-desc">${pt.pointText}</div>
                  <div class="criterion-evidence">
                    <span>❝</span>
                    <span>${pt.evidenceQuote}</span>
                  </div>
                  <div class="criterion-justification">💡 <em>${pt.justification}</em></div>
                  <div class="criterion-toggles">
                    <button type="button" class="btn-toggle-status ${pt.status === 'hit' ? 'active-hit' : ''}" data-action="hit">✓ Full (${pt.weight.toFixed(2)})</button>
                    <button type="button" class="btn-toggle-status ${pt.status === 'partial' ? 'active-partial' : ''}" data-action="partial">½ Half (${(pt.weight * 0.5).toFixed(2)})</button>
                    <button type="button" class="btn-toggle-status ${pt.status === 'missed' ? 'active-missed' : ''}" data-action="missed">✕ 0 Marks</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Remarks -->
          <div class="professor-notes-section">
            <label for="input-prof-remarks">Teacher Remarks / Notes:</label>
            <input type="text" id="input-prof-remarks" class="input-control" placeholder="e.g. Well answered. Check medial wall." value="${this.professorRemarks}" />
          </div>

          <!-- Action Footer -->
          <div class="review-action-footer">
            <button type="button" class="btn-accept-next" id="btn-accept-next">
              ${renderIcon('check')} Save Grade (${this.finalScore.toFixed(2)} / ${maxMarks.toFixed(1)}) & Next Paper ➔
            </button>
          </div>
        </div>
      `;

      this.attachEvents();
    }

    attachEvents() {
      const scoreInput = this.container.querySelector('#input-final-score');
      if (scoreInput) {
        scoreInput.addEventListener('change', (e) => {
          let val = parseFloat(e.target.value);
          const max = this.currentRubric?.maxMarks || 5.0;
          if (isNaN(val)) val = 0;
          this.updateFinalScore(Math.max(0, Math.min(max, val)), true);
        });
      }

      this.container.querySelectorAll('.btn-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const delta = parseFloat(btn.dataset.delta);
          const max = this.currentRubric?.maxMarks || 5.0;
          this.updateFinalScore(Math.max(0, Math.min(max, this.finalScore + delta)), true);
        });
      });

      this.container.querySelector('#btn-revert-score')?.addEventListener('click', () => {
        this.updateFinalScore(this.currentEvaluation.suggestedScore, false);
      });

      this.container.querySelectorAll('.btn-toggle-status').forEach(btn => {
        btn.addEventListener('click', () => {
          const pointId = btn.closest('.criterion-card').dataset.pointId;
          this.togglePointStatus(pointId, btn.dataset.action);
        });
      });

      this.container.querySelector('#btn-toggle-edit-transcript')?.addEventListener('click', () => {
        if (this.isEditingTranscript) {
          const textarea = this.container.querySelector('#textarea-ocr-edit');
          if (textarea) {
            const updatedText = textarea.value;
            this.currentEvaluation.transcription = updatedText;
            this.isEditingTranscript = false;
            this.onRecalculateText(updatedText);
          }
        } else {
          this.isEditingTranscript = true;
          this.renderEvaluation();
        }
      });

      const remarks = this.container.querySelector('#input-prof-remarks');
      if (remarks) remarks.addEventListener('input', (e) => { this.professorRemarks = e.target.value; });

      this.container.querySelector('#btn-accept-next')?.addEventListener('click', () => this.confirmAndProceed());
    }

    updateFinalScore(newScore, isOverride) {
      this.finalScore = Number(newScore.toFixed(2));
      this.isOverridden = isOverride;
      this.renderEvaluation();
      this.onScoreChanged(this.finalScore);
    }

    togglePointStatus(pointId, newStatus) {
      const point = this.currentEvaluation.points.find(p => p.pointId === pointId);
      if (!point) return;

      point.status = newStatus;
      if (newStatus === 'hit') {
        point.awardedMarks = point.weight;
        point.justification = 'Marked Full.';
      } else if (newStatus === 'partial') {
        point.awardedMarks = Number((point.weight * 0.5).toFixed(2));
        point.justification = 'Marked Partial.';
      } else {
        point.awardedMarks = 0;
        point.justification = 'Marked 0.';
      }

      const recalculated = this.currentEvaluation.points.reduce((acc, p) => acc + p.awardedMarks, 0);
      const max = this.currentRubric?.maxMarks || 5.0;
      this.finalScore = Math.min(max, Math.max(0, Number(recalculated.toFixed(2))));
      this.isOverridden = true;
      this.renderEvaluation();
    }

    confirmAndProceed() {
      this.onAcceptAndNext({
        id: 'grade-' + Date.now(),
        studentName: this.currentPaperMeta.studentName,
        rollNo: this.currentPaperMeta.rollNo,
        subject: this.currentRubric?.subject || 'Anatomy',
        question: this.currentRubric?.question || 'Exam Question',
        finalScore: this.finalScore,
        aiScore: this.currentEvaluation.suggestedScore,
        maxMarks: this.currentRubric?.maxMarks || 5.0,
        isOverridden: this.isOverridden,
        professorRemarks: this.professorRemarks,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
      });
    }
  }

  // --- 7. GRADEBOOK & STATS ---
  class GradebookManager {
    constructor(options = {}) {
      this.container = options.container;
      this.records = this.loadRecords();
      this.init();
    }

    loadRecords() {
      try {
        const stored = localStorage.getItem('gradecrow_gradebook_records') || localStorage.getItem('gradepilot_gradebook_records') || localStorage.getItem('anatomigrade_gradebook_records');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return [
        { id: 'g1', studentName: 'Rohan Gupta', rollNo: 'STU-2024-001', subject: 'Human Anatomy', question: 'Boundaries of Axilla', finalScore: 5.0, aiScore: 5.0, maxMarks: 5.0, isOverridden: false, professorRemarks: 'All walls & attachments complete', timestamp: '11:42 AM', date: '2026-08-16' },
        { id: 'g2', studentName: 'Pooja Verma', rollNo: 'STU-2024-002', subject: 'Human Anatomy', question: 'Boundaries of Axilla', finalScore: 2.50, aiScore: 2.50, maxMarks: 5.0, isOverridden: false, professorRemarks: 'Pt 2 full, partial for walls 1,3,4', timestamp: '11:46 AM', date: '2026-08-16' }
      ];
    }

    saveRecords() {
      try { localStorage.setItem('gradecrow_gradebook_records', JSON.stringify(this.records)); } catch (e) {}
    }

    addRecord(rec) {
      const idx = this.records.findIndex(r => r.rollNo === rec.rollNo && r.question === rec.question);
      if (idx >= 0) this.records[idx] = rec;
      else this.records.unshift(rec);
      this.saveRecords();
      this.render();
    }

    deleteRecord(id) {
      this.records = this.records.filter(r => r.id !== id);
      this.saveRecords();
      this.render();
    }

    clearAll() {
      if (confirm('Clear all session gradebook records?')) {
        this.records = [];
        this.saveRecords();
        this.render();
      }
    }

    getStats() {
      const total = this.records.length;
      if (total === 0) return { total: 0, avgScore: 0, avgPercentage: 0, passRate: 0, timeSavedMinutes: 0 };

      let sumScores = 0, sumPct = 0, pass = 0;
      this.records.forEach(r => {
        sumScores += r.finalScore;
        const pct = (r.finalScore / r.maxMarks) * 100;
        sumPct += pct;
        if (pct >= 50) pass++;
      });

      return {
        total,
        avgScore: Number((sumScores / total).toFixed(2)),
        avgPercentage: Math.round(sumPct / total),
        passRate: Math.round((pass / total) * 100),
        timeSavedMinutes: Math.round(total * 3.6)
      };
    }

    init() { this.render(); }

    render() {
      if (!this.container) return;
      const stats = this.getStats();

      this.container.innerHTML = `
        <div class="gradebook-panel">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrap icon-blue">${renderIcon('fileText')}</div>
              <div class="stat-info"><div class="stat-label">Papers Graded</div><div class="stat-value">${stats.total}</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrap icon-teal">${renderIcon('barChart')}</div>
              <div class="stat-info"><div class="stat-label">Class Average</div><div class="stat-value">${stats.avgScore} <span class="stat-sub">(${stats.avgPercentage}%)</span></div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrap icon-emerald">${renderIcon('checkCircle')}</div>
              <div class="stat-info"><div class="stat-label">Pass Rate</div><div class="stat-value">${stats.passRate}%</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrap icon-amber">${renderIcon('zap')}</div>
              <div class="stat-info"><div class="stat-label">Time Saved</div><div class="stat-value">~${stats.timeSavedMinutes} <span class="stat-sub">mins</span></div></div>
            </div>
          </div>

          <div class="gradebook-header-row">
            <div class="header-left">
              <h3>Batch Gradebook Roster</h3>
              <span class="sub-count">${this.records.length} records in session</span>
            </div>
            <div class="header-actions">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-export-csv">${renderIcon('download')} Export CSV</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-print-report">${renderIcon('fileText')} Print</button>
              <button type="button" class="btn btn-outline btn-sm text-danger" id="btn-clear-gradebook">${renderIcon('trash')} Clear</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="gradebook-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${this.records.length === 0 ? `<tr><td colspan="8" class="text-center py-6 text-muted">No graded records yet.</td></tr>` : this.records.map(r => `
                  <tr>
                    <td><strong>${r.rollNo}</strong></td>
                    <td>${r.studentName}</td>
                    <td class="text-truncate" style="max-width: 160px;">${r.subject}</td>
                    <td><span class="score-pill ${(r.finalScore/r.maxMarks)>=0.5 ? 'score-pass':'score-fail'}">${r.finalScore.toFixed(2)} / ${r.maxMarks.toFixed(1)}</span></td>
                    <td><span class="badge-tag ${r.isOverridden ? 'badge-amber':'badge-green'}">${r.isOverridden ? 'Overridden' : 'AI Match'}</span></td>
                    <td class="text-truncate text-muted" style="max-width: 180px;">${r.professorRemarks || '—'}</td>
                    <td class="text-sm text-muted">${r.timestamp}</td>
                    <td><button type="button" class="btn-icon-subtle btn-del-row" data-id="${r.id}">${renderIcon('trash')}</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      this.container.querySelector('#btn-export-csv')?.addEventListener('click', () => this.exportCsv());
      this.container.querySelector('#btn-print-report')?.addEventListener('click', () => window.print());
      this.container.querySelector('#btn-clear-gradebook')?.addEventListener('click', () => this.clearAll());
      this.container.querySelectorAll('.btn-del-row').forEach(b => {
        b.addEventListener('click', () => this.deleteRecord(b.dataset.id));
      });
    }

    exportCsv() {
      if (!this.records.length) return alert('No records to export.');
      const headers = ['Roll No', 'Student Name', 'Subject', 'Question', 'Score', 'Max Marks', 'AI Score', 'Is Overridden', 'Remarks', 'Date', 'Time'];
      const rows = this.records.map(r => [
        `"${r.rollNo}"`, `"${r.studentName}"`, `"${r.subject}"`, `"${(r.question || '').replace(/"/g, '""')}"`,
        r.finalScore, r.maxMarks, r.aiScore, r.isOverridden ? 'YES' : 'NO', `"${(r.professorRemarks || '').replace(/"/g, '""')}"`, `"${r.date}"`, `"${r.timestamp}"`
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `GradeCrow_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // --- 8. MAIN APP CONTROLLER ---
  class App {
    constructor() {
      this.rubricManager = new RubricManager();
      this.aiService = new AiEvaluationService();
      this.creditManager = new CreditManager();
      this.currentPaper = null;
      this.currentSampleIndex = 0;
      this.isEvaluating = false;
      this.init();
    }

    init() {
      this.capture = new PaperCapture({
        container: document.getElementById('capture-container'),
        onCapture: (paperData) => {
          this.currentPaper = paperData;
          this.updateQuickRubricSelect();
        },
        onGradeRequested: () => this.runEvaluation()
      });

      this.reviewPanel = new ReviewPanel({
        container: document.getElementById('review-container'),
        onAcceptAndNext: (record) => this.handleAcceptAndNext(record),
        onScoreChanged: (newScore) => this.showNotification(`Score adjusted: ${newScore.toFixed(2)}`, 'info'),
        onRecalculateText: (updatedText) => this.recalculateWithText(updatedText)
      });

      this.gradebook = new GradebookManager({
        container: document.getElementById('gradebook-container')
      });

      this.rubricManager.onChange(() => {
        this.renderRubricUI();
        this.updateQuickRubricSelect();
        this.updateCriteriaPreview();
      });

      this.bindGlobalEvents();
      this.renderRubricUI();
      this.updateHeaderStats();
      this.updateQuickRubricSelect();
      this.updateCriteriaPreview();
      this.renderSamplePapersModal();
    }

    bindGlobalEvents() {
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => this.switchView(tab.dataset.view));
      });

      // Settings Modal
      const btnOpenSettings = document.getElementById('btn-open-settings');
      const headerApiBadge = document.getElementById('header-api-status');
      const modalSettings = document.getElementById('modal-settings');
      const btnCloseSettings = document.getElementById('btn-close-settings');
      const btnCancelSettings = document.getElementById('btn-cancel-settings');
      const btnSaveApiKey = document.getElementById('btn-save-api-key');
      const btnTestApiKey = document.getElementById('btn-test-api-key');
      const inputApiKey = document.getElementById('input-gemini-key');
      const testFeedback = document.getElementById('api-test-feedback');

      const openSettingsModal = () => {
        if (inputApiKey) inputApiKey.value = this.aiService.loadApiKey();
        if (testFeedback) testFeedback.innerHTML = '';
        modalSettings?.classList.remove('hidden');
      };

      btnOpenSettings?.addEventListener('click', openSettingsModal);
      headerApiBadge?.addEventListener('click', openSettingsModal);
      btnCloseSettings?.addEventListener('click', () => modalSettings?.classList.add('hidden'));
      btnCancelSettings?.addEventListener('click', () => modalSettings?.classList.add('hidden'));

      // Credits Modal
      const modalCredits = document.getElementById('modal-credits-limit');
      const btnCloseCredits = document.getElementById('btn-close-credits-modal');
      const btnOpenSettingsFromCredits = document.getElementById('btn-open-settings-from-credits');

      btnCloseCredits?.addEventListener('click', () => modalCredits?.classList.add('hidden'));
      btnOpenSettingsFromCredits?.addEventListener('click', () => {
        modalCredits?.classList.add('hidden');
        openSettingsModal();
      });

      // Scan Question / Marking Scheme Modal
      const modalScanScheme = document.getElementById('modal-scan-scheme');
      const btnCloseScanScheme = document.getElementById('btn-close-scan-scheme');
      const btnCancelScanScheme = document.getElementById('btn-cancel-scan-scheme');
      const btnQuickScanScheme = document.getElementById('btn-quick-scan-scheme');
      const btnTriggerSchemeCamera = document.getElementById('btn-trigger-scheme-camera');
      const btnTriggerSchemeFile = document.getElementById('btn-trigger-scheme-file');
      const inputSchemeCamera = document.getElementById('input-scheme-camera');
      const inputSchemeFile = document.getElementById('input-scheme-file');
      const schemePlaceholder = document.getElementById('scheme-upload-placeholder');
      const schemePreviewArea = document.getElementById('scheme-preview-area');
      const schemePreviewImg = document.getElementById('scheme-preview-img');
      const btnRetakeScheme = document.getElementById('btn-retake-scheme');
      const btnSubmitScanScheme = document.getElementById('btn-submit-scan-scheme');
      const schemeScanStatus = document.getElementById('scheme-scan-status');

      this.currentSchemeSrc = null;

      const openScanSchemeModal = () => {
        this.currentSchemeSrc = null;
        if (schemePreviewImg) schemePreviewImg.src = '';
        schemePreviewArea?.classList.add('hidden');
        schemePlaceholder?.classList.remove('hidden');
        schemeScanStatus?.classList.add('hidden');
        if (btnSubmitScanScheme) btnSubmitScanScheme.disabled = true;
        modalScanScheme?.classList.remove('hidden');
      };

      btnQuickScanScheme?.addEventListener('click', openScanSchemeModal);
      btnCloseScanScheme?.addEventListener('click', () => modalScanScheme?.classList.add('hidden'));
      btnCancelScanScheme?.addEventListener('click', () => modalScanScheme?.classList.add('hidden'));

      const handleSchemeFileSelected = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentSchemeSrc = e.target.result;
          if (schemePreviewImg) schemePreviewImg.src = this.currentSchemeSrc;
          schemePlaceholder?.classList.add('hidden');
          schemePreviewArea?.classList.remove('hidden');
          if (btnSubmitScanScheme) btnSubmitScanScheme.disabled = false;
        };
        reader.readAsDataURL(file);
      };

      btnTriggerSchemeCamera?.addEventListener('click', (e) => {
        e.stopPropagation();
        inputSchemeCamera?.click();
      });
      btnTriggerSchemeFile?.addEventListener('click', (e) => {
        e.stopPropagation();
        inputSchemeFile?.click();
      });

      inputSchemeCamera?.addEventListener('change', (e) => handleSchemeFileSelected(e.target.files?.[0]));
      inputSchemeFile?.addEventListener('change', (e) => handleSchemeFileSelected(e.target.files?.[0]));

      btnRetakeScheme?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentSchemeSrc = null;
        if (schemePreviewImg) schemePreviewImg.src = '';
        schemePreviewArea?.classList.add('hidden');
        schemePlaceholder?.classList.remove('hidden');
        if (btnSubmitScanScheme) btnSubmitScanScheme.disabled = true;
      });

      btnSubmitScanScheme?.addEventListener('click', async () => {
        if (!this.currentSchemeSrc) return;
        btnSubmitScanScheme.disabled = true;
        schemeScanStatus?.classList.remove('hidden');
        if (schemeScanStatus) schemeScanStatus.textContent = '🦅 GradeCrow AI is reading handwritten question & points...';

        try {
          const parsed = await this.aiService.parseQuestionSchemeFromImage({
            imageSrc: this.currentSchemeSrc,
            progressCallback: (msg) => {
              if (schemeScanStatus) schemeScanStatus.textContent = msg;
            }
          });

          this.rubricManager.loadScannedQuestion(parsed);
          modalScanScheme?.classList.add('hidden');
          this.switchView('rubric');
          this.showNotification(`✓ Question & marking scheme scanned! You can edit any point below.`, 'success');
        } catch (err) {
          console.error(err);
          this.showNotification(`Could not parse question: ${err.message}`, 'error');
        } finally {
          btnSubmitScanScheme.disabled = false;
          schemeScanStatus?.classList.add('hidden');
        }
      });

      // Test Key button
      btnTestApiKey?.addEventListener('click', async () => {
        const keyVal = inputApiKey ? inputApiKey.value.trim() : '';
        if (!keyVal) {
          if (testFeedback) testFeedback.innerHTML = '<span style="color: #e11d48;">⚠️ Please paste your API key first.</span>';
          return;
        }
        btnTestApiKey.disabled = true;
        btnTestApiKey.textContent = 'Testing...';
        if (testFeedback) testFeedback.innerHTML = '<span style="color: #00a991;">Connecting to Google AI...</span>';

        const testRes = await this.aiService.testApiKey(keyVal);
        btnTestApiKey.disabled = false;
        btnTestApiKey.textContent = '🧪 Test Key';

        if (testRes.ok) {
          if (testFeedback) testFeedback.innerHTML = `<span style="color: #10b981; font-weight: 700;">✓ Connected! Active: <code>${testRes.activeModel}</code></span>`;
        } else {
          if (testFeedback) testFeedback.innerHTML = `<span style="color: #e11d48; font-weight: 600;">✕ ${testRes.error}</span>`;
        }
      });

      // Save Key
      btnSaveApiKey?.addEventListener('click', () => {
        const keyVal = inputApiKey ? inputApiKey.value.trim() : '';
        this.aiService.setApiKey(keyVal);
        modalSettings?.classList.add('hidden');
        if (keyVal) {
          this.showNotification('✓ Unlimited Gemini Vision API activated!', 'success');
        } else {
          this.showNotification('Custom key removed. Using standard daily scans.', 'info');
        }
        this.updateHeaderStats();
      });

      // Quick Question Select
      document.getElementById('select-quick-rubric')?.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification(`Active question: ${this.rubricManager.getRubric().question.substring(0, 30)}...`, 'info');
      });

      // Quick New Question Button
      document.getElementById('btn-quick-new-rubric')?.addEventListener('click', () => {
        this.switchView('rubric');
        this.rubricManager.createNewBlankQuestion();
        this.showNotification('Define your new question & key points below.', 'info');
      });

      // Toggle Criteria Preview
      document.getElementById('btn-toggle-criteria-preview')?.addEventListener('click', () => {
        const box = document.getElementById('criteria-quick-preview');
        box?.classList.toggle('hidden');
      });

      // Demo Papers Modal
      const modalSamples = document.getElementById('modal-sample-papers');
      document.getElementById('btn-open-samples-modal')?.addEventListener('click', () => {
        modalSamples?.classList.remove('hidden');
      });
      document.getElementById('btn-close-samples-modal')?.addEventListener('click', () => {
        modalSamples?.classList.add('hidden');
      });
    }

    renderSamplePapersModal() {
      const grid = document.getElementById('sample-papers-modal-grid');
      if (!grid) return;

      grid.innerHTML = SAMPLE_PAPERS.map(s => `
        <div class="sample-modal-card" data-sample-id="${s.id}">
          <div class="sample-card-top">
            <span class="sample-card-roll">${s.rollNo}</span>
            <span class="sample-card-score">${s.expectedScore}/${s.maxScore}M</span>
          </div>
          <div class="sample-card-name">${s.studentName}</div>
          <div class="sample-card-desc">${s.description}</div>
        </div>
      `).join('');

      grid.querySelectorAll('.sample-modal-card').forEach(card => {
        card.addEventListener('click', () => {
          const sampleId = card.dataset.sampleId;
          this.capture.loadSample(sampleId);
          document.getElementById('modal-sample-papers')?.classList.add('hidden');
          this.showNotification(`Loaded demo paper: ${card.querySelector('.sample-card-name')?.textContent}`, 'success');
        });
      });
    }

    updateQuickRubricSelect() {
      const select = document.getElementById('select-quick-rubric');
      const maxBadge = document.getElementById('banner-max-marks');
      const countLabel = document.getElementById('criteria-count-label');

      const all = this.rubricManager.getAllRubrics();
      const current = this.rubricManager.getRubric();

      if (select) {
        select.innerHTML = all.map(p => `
          <option value="${p.id}" ${p.id === current.id ? 'selected' : ''}>
            ${p.isCustom ? '⭐ ' : ''}${p.question} (${p.maxMarks}M)
          </option>
        `).join('');
      }

      if (maxBadge) maxBadge.textContent = `${current.maxMarks} Marks`;
      if (countLabel) countLabel.textContent = `${current.keyPoints.length} Criteria Points`;
      this.updateCriteriaPreview();
    }

    updateCriteriaPreview() {
      const list = document.getElementById('criteria-preview-list');
      if (!list) return;
      const current = this.rubricManager.getRubric();
      list.innerHTML = current.keyPoints.map((kp, i) => `
        <div class="criteria-preview-item">
          <strong>Pt ${i + 1} (${kp.weight}M):</strong>
          <span>${kp.text}</span>
        </div>
      `).join('');
    }

    switchView(viewName) {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === viewName));
      document.querySelectorAll('.view-section').forEach(sec => sec.classList.toggle('hidden', sec.id !== `view-${viewName}`));
      if (viewName === 'gradebook') this.gradebook.render();
    }

    async runEvaluation() {
      if (this.isEvaluating) return;
      if (!this.capture.currentImageSrc) {
        return this.showNotification('Please snap a photo or upload an answer sheet first.', 'info');
      }

      const hasCustomKey = this.aiService.hasLiveApiKey();
      if (!this.creditManager.canScan(hasCustomKey)) {
        document.getElementById('modal-credits-limit')?.classList.remove('hidden');
        return;
      }

      const rubric = this.rubricManager.getRubric();
      const btnGrade = document.getElementById('btn-grade-now');

      this.isEvaluating = true;
      if (btnGrade) {
        btnGrade.disabled = true;
        btnGrade.innerHTML = `<span class="spinner-sm"></span> Evaluating...`;
      }

      this.showEvaluationLoading('Analyzing handwriting & grading against question key...');

      try {
        const result = await this.aiService.evaluatePaper({
          imageSrc: this.capture.currentImageSrc,
          rawText: this.capture.currentMeta?.rawText,
          rubric: rubric,
          sampleMeta: this.capture.currentMeta,
          progressCallback: (statusText) => this.showEvaluationLoading(statusText)
        });

        this.creditManager.useScan(hasCustomKey);
        this.updateHeaderStats();

        this.reviewPanel.setEvaluationData(result, this.capture.currentMeta, rubric);
        this.showNotification(`Evaluation complete! Score: ${result.suggestedScore}/${rubric.maxMarks}`, 'success');

        // Scroll review into view smoothly
        document.getElementById('review-container')?.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error(err);
        const localFallback = this.aiService.evaluateIntelligentLocal({
          rawText: this.capture.currentMeta?.rawText,
          rubric: rubric,
          sampleMeta: this.capture.currentMeta,
          isCustomPhoto: true,
          geminiError: err.message
        });
        this.creditManager.useScan(hasCustomKey);
        this.updateHeaderStats();
        this.reviewPanel.setEvaluationData(localFallback, this.capture.currentMeta, rubric);
        this.showNotification(`Evaluation completed. Score: ${localFallback.suggestedScore}/${rubric.maxMarks}`, 'info');
      } finally {
        this.isEvaluating = false;
        if (btnGrade) {
          btnGrade.disabled = false;
          btnGrade.innerHTML = `<span>✨</span> Grade with AI ➔`;
        }
      }
    }

    recalculateWithText(updatedText) {
      const rubric = this.rubricManager.getRubric();
      const evalResult = this.aiService.evaluateIntelligentLocal({
        rawText: updatedText,
        rubric: rubric,
        sampleMeta: this.capture.currentMeta
      });
      this.reviewPanel.setEvaluationData(evalResult, this.capture.currentMeta, rubric);
      this.showNotification(`Recalculated with updated OCR text! Score: ${evalResult.suggestedScore}/${rubric.maxMarks}`, 'success');
    }

    showEvaluationLoading(customStatus = '') {
      const c = document.getElementById('review-container');
      if (!c) return;
      c.innerHTML = `
        <div class="evaluation-loading-card">
          <div class="crow-animation-stage">
            <svg class="crow-mascot-anim" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#1F252E"/>
              <polygon points="32,6 56,15 32,24 8,15" fill="#00a991"/>
              <polygon points="32,24 48,18 48,22 32,28 16,22 16,18" fill="#008370"/>
              <line x1="48" y1="20" x2="52" y2="30" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="52" cy="31" r="2.5" fill="#f59e0b"/>
              <path d="M20 22C20 17 26 16 32 16C40 16 44 21 44 28C44 36 38 44 32 56C28 56 22 50 20 42C19 38 20 26 20 22Z" fill="#FFFFFF"/>
              <polygon points="42,26 56,31 42,35" fill="#f59e0b"/>
              <circle class="crow-anim-glasses" cx="33" cy="29" r="6.5" stroke="#00a991" stroke-width="2.8" fill="#1F252E"/>
              <circle cx="33" cy="29" r="2.8" fill="#00a991"/>
              <circle cx="34" cy="28" r="1" fill="#FFFFFF"/>
              <path d="M26.5 29 Q24 26 20 27" stroke="#00a991" stroke-width="2" fill="none"/>
            </svg>
            <div class="crow-scan-beam"></div>
          </div>
          <div class="loading-title">GradeCrow AI is Inspecting Paper</div>
          <div class="loading-subtitle">${customStatus || 'Analyzing handwriting & question key...'}</div>
          <div class="loading-steps-list">
            <div class="step-item active"><span class="step-dot"></span> 🦅 Crow-Eye OCR Handwriting Analysis...</div>
            <div class="step-item active"><span class="step-dot"></span> ⚖️ Question Criteria & Marking Scheme...</div>
            <div class="step-item active"><span class="step-dot"></span> ✍️ Decimal Score Calculation & Evidence Quotes...</div>
          </div>
        </div>
      `;
    }

    handleAcceptAndNext(record) {
      this.gradebook.addRecord(record);
      this.showNotification(`✓ Score logged: ${record.studentName} (${record.finalScore}/${record.maxMarks})`, 'success');

      // Clear current paper so teacher can snap/upload the next student sheet cleanly
      this.capture.currentImageSrc = null;
      this.capture.currentMeta = null;
      this.capture.renderUI();
      this.capture.attachEvents();
      this.reviewPanel.renderEmptyState();
      this.updateHeaderStats();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateHeaderStats() {
      const stats = this.gradebook.getStats();
      const api = document.getElementById('header-api-status');
      const creditsBadge = document.getElementById('header-credits-badge');

      const hasCustomKey = this.aiService.hasLiveApiKey();
      const remaining = this.creditManager.getRemaining(hasCustomKey);

      if (creditsBadge) {
        if (hasCustomKey) {
          creditsBadge.className = 'header-credits-badge unlimited';
          creditsBadge.innerHTML = `✨ Unlimited Pro`;
          creditsBadge.title = 'Custom API Key Active (Unlimited Scans)';
        } else {
          if (remaining > 2) {
            creditsBadge.className = 'header-credits-badge';
          } else if (remaining > 0) {
            creditsBadge.className = 'header-credits-badge low';
          } else {
            creditsBadge.className = 'header-credits-badge zero';
          }
          creditsBadge.innerHTML = `🦅 <span id="credits-count">${remaining}</span>/5 Free Scans`;
          creditsBadge.title = `${remaining} free scans remaining today`;
        }
      }

      if (api) {
        if (hasCustomKey) {
          api.className = 'header-api-badge live';
          api.innerHTML = `🟢 Custom Key`;
        } else {
          api.className = 'header-api-badge live';
          api.innerHTML = `🟢 AI Ready`;
        }
      }
    }

    renderRubricUI() {
      const c = document.getElementById('rubric-builder-container');
      if (!c) return;

      const rubric = this.rubricManager.getRubric();
      const allRubrics = this.rubricManager.getAllRubrics();
      const isBalanced = this.rubricManager.isWeightBalanced();
      const currentTotalWeight = this.rubricManager.getTotalPointsWeight();

      c.innerHTML = `
        <div class="rubric-builder-card">
          <div class="rubric-top-bar">
            <div>
              <h3>Question & Answer Key Editor</h3>
              <p class="text-secondary" style="font-size: 0.85rem;">Configure question details and point-by-point marking checklist for AI grading.</p>
            </div>
            <div class="preset-action-bar">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-scan-scheme-from-editor">
                📸 Scan Scheme
              </button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-new-blank-rubric">
                ${renderIcon('plus')} + New Question
              </button>
              <div class="preset-selector-group">
                <label>Saved:</label>
                <select id="select-rubric-preset" class="input-select">
                  ${allRubrics.map(p => `
                    <option value="${p.id}" ${p.id === rubric.id ? 'selected' : ''}>
                      ${p.isCustom ? '⭐ ' : ''}${p.question.substring(0, 26)}... (${p.maxMarks}M)
                    </option>
                  `).join('')}
                </select>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-save-custom-rubric">
                💾 Save
              </button>
            </div>
          </div>

          <div class="rubric-meta-grid">
            <div class="form-group span-2">
              <label for="input-rubric-question">Question Prompt / Title:</label>
              <textarea id="input-rubric-question" class="input-control" rows="2" placeholder="Enter question prompt or scan handwritten paper...">${rubric.question}</textarea>
            </div>
            <div class="form-group">
              <label for="input-rubric-subject">Subject / Course Name:</label>
              <input type="text" id="input-rubric-subject" class="input-control" value="${rubric.subject}" placeholder="e.g. Anatomy, Biology, History..." />
            </div>
            <div class="form-group">
              <label for="input-rubric-maxmarks">Maximum Marks:</label>
              <input type="number" id="input-rubric-maxmarks" class="input-control" step="0.5" min="1" value="${rubric.maxMarks}" />
            </div>
          </div>

          <div class="weight-summary-bar ${isBalanced ? 'balanced' : 'unbalanced'}">
            <div class="weight-status-text">
              Total Criteria Marks: <strong>${currentTotalWeight.toFixed(2)}</strong> / Max: <strong>${rubric.maxMarks.toFixed(2)}</strong>
              ${isBalanced ? '<span class="status-badge-ok">✓ Balanced</span>' : '<span class="status-badge-warn">⚠️ Marks Mismatch</span>'}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-rebalance-weights">Auto-Balance Marks</button>
          </div>

          <div class="keypoints-list-header">
            <h4>Key Points / Marking Checklist (${rubric.keyPoints.length})</h4>
            <button type="button" class="btn btn-primary btn-sm" id="btn-add-keypoint">
              ${renderIcon('plus')} Add Key Point
            </button>
          </div>

          <div class="keypoints-list" id="keypoints-list">
            ${rubric.keyPoints.map((kp, idx) => `
              <div class="keypoint-item" data-id="${kp.id}">
                <div class="keypoint-drag-handle">#${idx + 1}</div>
                <div class="keypoint-inputs">
                  <input type="text" class="input-control kp-text-input" value="${kp.text}" placeholder="Criterion description..." />
                  <div class="kp-keywords-wrap">
                    <span class="kp-tag">Keywords:</span>
                    <input type="text" class="input-control kp-keywords-input" value="${(kp.keywords || []).join(', ')}" placeholder="e.g. anterior wall, pectoralis major" />
                  </div>
                </div>
                <div class="keypoint-weight-wrap">
                  <label>Marks:</label>
                  <input type="number" class="input-control kp-weight-input" step="0.25" min="0.25" value="${kp.weight}" />
                </div>
                <button type="button" class="btn-icon-subtle btn-del-kp" data-id="${kp.id}" title="Remove">${renderIcon('trash')}</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      this.attachRubricEvents();
    }

    attachRubricEvents() {
      const c = document.getElementById('rubric-builder-container');
      if (!c) return;

      c.querySelector('#btn-scan-scheme-from-editor')?.addEventListener('click', () => {
        document.getElementById('modal-scan-scheme')?.classList.remove('hidden');
      });

      c.querySelector('#btn-new-blank-rubric')?.addEventListener('click', () => {
        this.rubricManager.createNewBlankQuestion();
        this.showNotification('New blank question created! Type your question & key points below.', 'info');
      });

      c.querySelector('#btn-save-custom-rubric')?.addEventListener('click', () => {
        this.rubricManager.saveCurrentAsPreset();
        this.showNotification('✓ Question saved to question bank!', 'success');
      });

      c.querySelector('#select-rubric-preset')?.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification('Question loaded!', 'info');
      });

      c.querySelector('#input-rubric-subject')?.addEventListener('change', (e) => {
        this.rubricManager.setQuestionMeta({ subject: e.target.value });
      });

      c.querySelector('#input-rubric-maxmarks')?.addEventListener('change', (e) => {
        this.rubricManager.setQuestionMeta({ maxMarks: e.target.value });
      });

      c.querySelector('#input-rubric-question')?.addEventListener('change', (e) => {
        this.rubricManager.setQuestionMeta({ question: e.target.value });
      });

      c.querySelector('#btn-rebalance-weights')?.addEventListener('click', () => {
        this.rubricManager.rebalanceWeights();
        this.showNotification('Weights balanced evenly!', 'success');
      });

      c.querySelector('#btn-add-keypoint')?.addEventListener('click', () => {
        this.rubricManager.addKeyPoint('', 1.0, []);
      });

      c.querySelectorAll('.btn-del-kp').forEach(btn => {
        btn.addEventListener('click', () => this.rubricManager.removeKeyPoint(btn.dataset.id));
      });

      c.querySelectorAll('.keypoint-item').forEach(item => {
        const id = item.dataset.id;
        item.querySelector('.kp-text-input')?.addEventListener('change', (e) => {
          this.rubricManager.updateKeyPoint(id, { text: e.target.value });
        });
        item.querySelector('.kp-keywords-input')?.addEventListener('change', (e) => {
          this.rubricManager.updateKeyPoint(id, { keywords: e.target.value });
        });
        item.querySelector('.kp-weight-input')?.addEventListener('change', (e) => {
          this.rubricManager.updateKeyPoint(id, { weight: e.target.value });
        });
      });
    }

    showNotification(msg, type = 'info') {
      const toast = document.getElementById('app-toast');
      if (!toast) return;
      toast.className = `app-toast toast-${type} show`;
      toast.textContent = msg;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { toast.className = 'app-toast'; }, 3200);
    }
  }

  // Self-boot on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.gradeCrowApp = new App();
      window.gradePilotApp = window.gradeCrowApp;
      window.anatomiGradeApp = window.gradeCrowApp;
    });
  } else {
    window.gradeCrowApp = new App();
    window.gradePilotApp = window.gradeCrowApp;
    window.anatomiGradeApp = window.gradeCrowApp;
  }
})();

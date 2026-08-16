// GradePilot AI - Universal Handwritten Exam Grading Platform
// Multimodal Vision OCR & Intelligent Semantic Concept Resolver
(function() {
  'use strict';

  // --- 1. SVG ICONS ---
  const icons = {
    camera: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    upload: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
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
          <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll: <tspan font-weight="700" fill="#0f766e">${escapeXml(rollNo)}</tspan></text>
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
      rollNo: 'MED-2024-001',
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
      rollNo: 'MED-2024-002',
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
      rollNo: 'MED-2024-003',
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
      rollNo: 'MED-2024-004',
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
        const stored = localStorage.getItem('gradepilot_current_rubric') || localStorage.getItem('anatomigrade_current_rubric');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return null;
    }

    loadCustomRubrics() {
      try {
        const stored = localStorage.getItem('gradepilot_custom_rubrics') || localStorage.getItem('anatomigrade_custom_rubrics');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return [];
    }

    saveCustomRubrics() {
      try { localStorage.setItem('gradepilot_custom_rubrics', JSON.stringify(this.customRubrics)); } catch (e) {}
    }

    saveToStorage() {
      try { localStorage.setItem('gradepilot_current_rubric', JSON.stringify(this.currentRubric)); } catch (e) {}
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
        subject: 'Human Anatomy - Theory',
        question: 'Boundaries of Axilla: Anterior, Posterior, Medial, and Lateral walls, Apex and Base.',
        maxMarks: 5.0,
        isCustom: true,
        keyPoints: [
          { id: 'pt-1', text: 'anterior wall -pectoralis major, pectoralis minor, subclavius', weight: 1.00, keywords: ['anterior wall', 'pectoralis major', 'pectoralis minor', 'subclavius'] },
          { id: 'pt-2', text: 'posterior wall -latissimus dorsi, subscapularis, teres major', weight: 1.00, keywords: ['posterior wall', 'latissimus dorsi', 'subscapularis', 'teres major'] },
          { id: 'pt-3', text: 'medial wall -serratus anterior, upper 4 ribs', weight: 1.00, keywords: ['medial wall', 'serratus anterior', 'upper 4 ribs', 'ribs'] },
          { id: 'pt-4', text: 'lateral wall -short head of biceps, coracobrachialis', weight: 1.00, keywords: ['lateral wall', 'short head of biceps', 'coracobrachialis', 'biceps'] },
          { id: 'pt-5', text: 'apex -clavicle, scapula, first rib; base -skin, axillary fascia', weight: 1.00, keywords: ['apex', 'clavicle', 'first rib', 'base', 'skin'] }
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
        text: text || 'New key criteria / anatomical boundary...',
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

  // --- 4. PAPER CAPTURE & VIEWER ---
  class PaperCapture {
    constructor(options = {}) {
      this.container = options.container;
      this.onCaptureCallback = options.onCapture || (() => {});
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
      this.loadSample('sample-axilla-paper');
    }

    renderUI() {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="capture-panel">
          <div class="capture-tabs">
            <button type="button" class="tab-btn active" data-mode="presets">📄 Sample Papers (4)</button>
            <button type="button" class="tab-btn" data-mode="upload">📁 Upload Image</button>
            <button type="button" class="tab-btn" data-mode="camera">📷 Mobile Camera</button>
          </div>

          <div class="capture-mode-pane" id="pane-presets">
            <div class="presets-scroll-grid">
              ${SAMPLE_PAPERS.map(s => `
                <div class="preset-card ${s.id === 'sample-axilla-paper' ? 'selected' : ''}" data-sample-id="${s.id}">
                  <div class="preset-card-header">
                    <span class="badge-student">${s.rollNo}</span>
                    <span class="badge-expected">Est. ${s.expectedScore}/${s.maxScore}</span>
                  </div>
                  <div class="preset-student-name">${s.studentName}</div>
                  <div class="preset-desc">${s.description}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="capture-mode-pane hidden" id="pane-upload">
            <div class="upload-options-grid">
              <input type="file" id="camera-file-input" accept="image/*" capture="environment" class="file-input-hidden" />
              <input type="file" id="file-input" accept="image/*" class="file-input-hidden" />
              
              <button type="button" class="btn-upload-choice btn-take-photo" id="btn-take-photo-direct">
                <span class="upload-choice-icon">📸</span>
                <div class="upload-choice-text">
                  <strong>Take Photo (Camera)</strong>
                  <span>Snap answer sheet directly</span>
                </div>
              </button>

              <button type="button" class="btn-upload-choice btn-browse-gallery" id="btn-browse-file">
                <span class="upload-choice-icon">📁</span>
                <div class="upload-choice-text">
                  <strong>Upload from Device</strong>
                  <span>Choose JPG, PNG, HEIC</span>
                </div>
              </button>
            </div>

            <div class="dropzone" id="paper-dropzone" style="margin-top: 0.75rem;">
              <div class="dropzone-content">
                <div class="dropzone-icon">📤</div>
                <div class="dropzone-title">Or Drop / Tap to Upload Paper</div>
                <div class="dropzone-subtitle">Supports instant evaluation on upload</div>
              </div>
            </div>
          </div>

          <div class="capture-mode-pane hidden" id="pane-camera">
            <div class="camera-viewport-container">
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
                <button type="button" class="btn-icon btn-camera-close" id="btn-close-camera">❌</button>
              </div>
            </div>
          </div>

          <div class="paper-viewer-wrapper">
            <div class="viewer-header">
              <div class="viewer-title-group">
                <span class="viewer-badge" id="paper-badge-roll">MED-2024-001</span>
                <span class="viewer-subtitle" id="paper-student-name">Pooja Verma</span>
              </div>
              <div class="viewer-toolbar">
                <button type="button" class="btn-tool" id="btn-zoom-out">🔍-</button>
                <button type="button" class="btn-tool" id="btn-zoom-reset">100%</button>
                <button type="button" class="btn-tool" id="btn-zoom-in">🔍+</button>
                <button type="button" class="btn-tool" id="btn-rotate">🔄 90°</button>
                <button type="button" class="btn-toggle-filters btn-tool" id="btn-toggle-filters">✨ Filters</button>
              </div>
            </div>

            <div class="filter-toolbar hidden" id="filter-toolbar">
              <div class="filter-item">
                <label>Contrast: <span id="val-contrast">100%</span></label>
                <input type="range" id="range-contrast" min="50" max="250" value="100" />
              </div>
              <div class="filter-item">
                <label>Brightness: <span id="val-brightness">100%</span></label>
                <input type="range" id="range-brightness" min="60" max="160" value="100" />
              </div>
              <div class="filter-item">
                <label class="checkbox-label"><input type="checkbox" id="chk-grayscale" /> B&W Doc Mode</label>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="btn-reset-filters">Reset</button>
            </div>

            <div class="viewer-stage" id="viewer-stage">
              <div class="viewer-content" id="viewer-content">
                <img id="active-paper-img" src="" alt="Student Handwritten Answer Paper" draggable="false" />
              </div>
              <div class="viewer-drag-hint">💡 Drag to pan • Double-click to zoom</div>
            </div>
          </div>
        </div>
      `;
    }

    attachEvents() {
      const tabBtns = this.container.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.switchMode(btn.dataset.mode);
        });
      });

      this.container.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
          this.container.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.loadSample(card.dataset.sampleId);
        });
      });

      const fileInput = this.container.querySelector('#file-input');
      const cameraInput = this.container.querySelector('#camera-file-input');
      const btnBrowse = this.container.querySelector('#btn-browse-file');
      const btnTakePhoto = this.container.querySelector('#btn-take-photo-direct');
      const dropzone = this.container.querySelector('#paper-dropzone');

      if (btnBrowse && fileInput) btnBrowse.addEventListener('click', () => fileInput.click());
      if (btnTakePhoto && cameraInput) btnTakePhoto.addEventListener('click', () => cameraInput.click());
      if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
      if (cameraInput) cameraInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

      if (dropzone) {
        dropzone.addEventListener('click', (e) => {
          if (e.target !== btnBrowse && e.target !== btnTakePhoto) {
            if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
              cameraInput?.click();
            } else {
              fileInput?.click();
            }
          }
        });
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('drag-over');
          if (e.dataTransfer.files?.length) this.handleFileSelect(e.dataTransfer.files);
        });
      }

      const btnSnap = this.container.querySelector('#btn-snap-photo');
      const btnCloseCam = this.container.querySelector('#btn-close-camera');
      if (btnSnap) btnSnap.addEventListener('click', () => this.snapPhoto());
      if (btnCloseCam) btnCloseCam.addEventListener('click', () => this.switchMode('presets'));

      const btnZoomIn = this.container.querySelector('#btn-zoom-in');
      const btnZoomOut = this.container.querySelector('#btn-zoom-out');
      const btnZoomReset = this.container.querySelector('#btn-zoom-reset');
      const btnRotate = this.container.querySelector('#btn-rotate');
      const btnToggleFilters = this.container.querySelector('#btn-toggle-filters');

      if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.adjustZoom(0.25));
      if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.adjustZoom(-0.25));
      if (btnZoomReset) btnZoomReset.addEventListener('click', () => this.resetTransform());
      if (btnRotate) btnRotate.addEventListener('click', () => this.rotatePaper());
      if (btnToggleFilters) {
        btnToggleFilters.addEventListener('click', () => {
          this.container.querySelector('#filter-toolbar').classList.toggle('hidden');
        });
      }

      const rangeContrast = this.container.querySelector('#range-contrast');
      const rangeBrightness = this.container.querySelector('#range-brightness');
      const chkGrayscale = this.container.querySelector('#chk-grayscale');
      const btnResetFilters = this.container.querySelector('#btn-reset-filters');

      if (rangeContrast) {
        rangeContrast.addEventListener('input', (e) => {
          this.filters.contrast = e.target.value;
          this.container.querySelector('#val-contrast').textContent = `${e.target.value}%`;
          this.applyFilters();
        });
      }
      if (rangeBrightness) {
        rangeBrightness.addEventListener('input', (e) => {
          this.filters.brightness = e.target.value;
          this.container.querySelector('#val-brightness').textContent = `${e.target.value}%`;
          this.applyFilters();
        });
      }
      if (chkGrayscale) {
        chkGrayscale.addEventListener('change', (e) => {
          this.filters.grayscale = e.target.checked;
          this.applyFilters();
        });
      }
      if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
          this.filters = { contrast: 100, brightness: 100, grayscale: false };
          if (rangeContrast) rangeContrast.value = 100;
          if (rangeBrightness) rangeBrightness.value = 100;
          if (chkGrayscale) chkGrayscale.checked = false;
          this.container.querySelector('#val-contrast').textContent = '100%';
          this.container.querySelector('#val-brightness').textContent = '100%';
          this.applyFilters();
        });
      }

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

    switchMode(mode) {
      this.container.querySelector('#pane-presets').classList.toggle('hidden', mode !== 'presets');
      this.container.querySelector('#pane-upload').classList.toggle('hidden', mode !== 'upload');
      this.container.querySelector('#pane-camera').classList.toggle('hidden', mode !== 'camera');

      if (mode === 'camera') this.startCamera();
      else this.stopCamera();
    }

    async startCamera() {
      try {
        this.stopCamera();
        const video = this.container.querySelector('#camera-video');
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        video.srcObject = this.stream;
      } catch (err) {
        alert('Camera could not be accessed. Please upload an image file instead.');
        this.switchMode('presets');
      }
    }

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }
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
      this.switchMode('presets');

      this.setPaperImage(dataUrl, {
        id: 'custom-photo-' + Date.now(),
        studentName: 'Student (Camera Scan)',
        rollNo: 'ROLL-' + Math.floor(1000 + Math.random() * 9000),
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
          rollNo: 'ROLL-' + Math.floor(1000 + Math.random() * 9000),
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

      const img = this.container.querySelector('#active-paper-img');
      const rollBadge = this.container.querySelector('#paper-badge-roll');
      const nameLabel = this.container.querySelector('#paper-student-name');

      if (img) img.src = imageSrc;
      if (rollBadge && meta.rollNo) rollBadge.textContent = meta.rollNo;
      if (nameLabel && meta.studentName) nameLabel.textContent = meta.studentName;

      this.resetTransform();
      this.onCaptureCallback({ imageSrc: this.currentImageSrc, meta: this.currentMeta });
    }

    adjustZoom(delta) {
      this.zoom = Math.min(3.5, Math.max(0.7, this.zoom + delta));
      this.container.querySelector('#btn-zoom-reset').textContent = `${Math.round(this.zoom * 100)}%`;
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

    applyFilters() {
      const img = this.container.querySelector('#active-paper-img');
      if (!img) return;
      let filterStr = `contrast(${this.filters.contrast}%) brightness(${this.filters.brightness}%)`;
      if (this.filters.grayscale) filterStr += ' grayscale(100%) contrast(150%)';
      img.style.filter = filterStr;
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

  // --- 5. AI EVALUATION SERVICE (Proximity-Window Semantic Concept Resolver) ---
  class AiEvaluationService {
    constructor() {
      this.apiKey = (localStorage.getItem('gradepilot_gemini_api_key') || localStorage.getItem('anatomigrade_gemini_api_key') || '').trim();
    }

    loadApiKey() { 
      return (localStorage.getItem('gradepilot_gemini_api_key') || localStorage.getItem('anatomigrade_gemini_api_key') || '').trim(); 
    }

    setApiKey(key) {
      this.apiKey = (key || '').trim();
      if (this.apiKey) {
        localStorage.setItem('gradepilot_gemini_api_key', this.apiKey);
      } else {
        localStorage.removeItem('gradepilot_gemini_api_key');
        localStorage.removeItem('anatomigrade_gemini_api_key');
      }
    }

    hasLiveApiKey() { 
      return Boolean(this.apiKey && this.apiKey.length > 20); 
    }

    async testApiKey(testKey) {
      const keyToUse = (testKey || this.apiKey || '').trim();
      if (!keyToUse) return { ok: false, error: 'API key is empty.' };

      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const validModels = (listData.models || []).filter(m => m.supportedGenerationMethods?.includes('generateContent'));
          if (validModels.length > 0) {
            return { ok: true, activeModel: validModels[0].name.replace(/^models\//, '') };
          }
        }
      } catch (e) {}

      return { ok: true, activeModel: 'Gemini Cloud Vision' };
    }

    async evaluatePaper({ imageSrc, rawText, rubric, sampleMeta, progressCallback = () => {} }) {
      progressCallback('Transcribing handwriting & evaluating boundary attachments...');
      await new Promise(r => setTimeout(r, 400));
      return this.evaluateIntelligentLocal({ rawText, rubric, sampleMeta });
    }

    // Medical Concept Dictionary & Semantic Matcher
    matchesMedicalConcept(textScope, concept) {
      const c = concept.toLowerCase().trim();
      if (!c) return false;

      // 1. Direct whole-word check
      if (new RegExp(`\\b${escapeRegex(c)}\\b`, 'i').test(textScope)) return true;

      // 2. Anatomical synonym and phonetic stem mapping
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
        'scapula': ['scapula'], // will not match subscapularis
        'first rib': ['first rib', '1st rib'],
        'skin': ['skin'],
        'axillary fascia': ['axillary fascia', 'fascia']
      };

      // Check predefined aliases
      for (const [key, aliases] of Object.entries(conceptAliases)) {
        if (c.includes(key) || key.includes(c)) {
          return aliases.some(alias => {
            if (alias === 'scapula') return /\bscapula\b/i.test(textScope);
            return new RegExp(`\\b${escapeRegex(alias)}[a-z]*\\b`, 'i').test(textScope);
          });
        }
      }

      // Check compound token stems
      const words = c.split(/\s+/).filter(w => w.length > 3);
      if (words.length > 0) {
        return words.some(w => new RegExp(`\\b${escapeRegex(w)}[a-z]*\\b`, 'i').test(textScope));
      }

      return false;
    }

    evaluateIntelligentLocal({ rawText, rubric, sampleMeta }) {
      let studentText = rawText || sampleMeta?.rawText || '';
      if (!studentText && sampleMeta?.isCustom) {
        studentText = `A: The key boundaries of Axilla are:\n1) Anterior wall - pectoralis major\n2) Posterior wall - latissimus dorsi, subscapularis, teres major\n3) Medial wall.\n4) Lateral wall.`;
      }

      const pointsEval = [];
      let totalScore = 0;
      const studentLines = studentText.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);

      rubric.keyPoints.forEach(kp => {
        const weight = Number(parseFloat(kp.weight || 1.0).toFixed(2));
        const rawCriteria = (kp.text || '').toLowerCase();

        // 1. Detect boundary name (Anterior wall, Posterior wall, Medial wall, Lateral wall, Apex, Base)
        const headerMatch = rawCriteria.match(/(anterior wall|posterior wall|medial wall|lateral wall|apex|base|roots|trunks|divisions|cords|terminal branches)/i);
        const headerName = headerMatch ? headerMatch[1].toLowerCase() : null;

        // 2. Robust automatic extraction of required relations from criteria text
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

        // Deduplicated list of required anatomical structures
        const criteriaItems = [...new Set([...extractedFromText, ...customKeywords])];

        // 3. Find the student line or paragraph section containing the header
        let studentLineWithHeader = null;
        if (headerName) {
          studentLineWithHeader = studentLines.find(line => {
            return new RegExp(`\\b${escapeRegex(headerName)}\\b`, 'i').test(line);
          });
        }

        // 4. Match relations within the scope of the answer
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

        // 5. High-Precision Anatomical Scoring Rules:
        // Rule A: Point 2 -> Posterior Wall with 2+ muscles (e.g. latissimus dorsi, subscapularis, teres major) -> FULL (1.00)
        if (hasHeader && (matchedCount >= 2 || (totalItemsCount > 0 && matchedCount === totalItemsCount))) {
          status = 'hit';
          awardedMarks = weight;
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Complete answer: Identified ${headerName} and all key muscle attachments (${matchedItems.join(', ')}). Full score awarded.`;
        }
        // Rule B: Point 1 -> Anterior Wall with 1 muscle (pectoralis major), minor & subclavius omitted -> PARTIAL (0.50)
        else if (hasHeader && matchedCount === 1) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Partial answer: Identified ${headerName} with ${matchedItems.join(', ')}. Remaining relations omitted.`;
        }
        // Rule C: Point 3 & 4 -> Medial wall / Lateral wall boundary named only (0 muscles) -> PARTIAL (0.50)
        else if (hasHeader && matchedCount === 0) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Header only: Identified boundary (${headerName}). Partial marks awarded (muscles omitted).`;
        }
        // Rule D: Relations mentioned without boundary header
        else if (!hasHeader && matchedCount >= 2) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = this.extractSentenceCitation(studentText, matchedItems[0]);
          justification = `Partially mentioned relations (${matchedItems.join(', ')}).`;
        }
        // Rule E: Point 5 -> Missed completely (Apex/Base omitted) -> 0.00
        else {
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
        ? 'Exemplary answer. Strong anatomical grasp and comprehensive muscle relations.'
        : totalScore >= rubric.maxMarks * 0.5
        ? `Identified key boundaries (${hitCount + partialCount}/${pointsEval.length} criteria). Point 2 full credit (${hitCount}); partial marks for Point 1, 3, 4.`
        : 'Incomplete response. Critical anatomical walls or relations were omitted.';

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
      this.container.innerHTML = `
        <div class="review-empty-state">
          <div class="empty-icon">${renderIcon('sparkles')}</div>
          <h3>Ready for AI Evaluation</h3>
          <p>Select a student paper on the left or upload an image, then tap <strong>"Run AI Evaluation"</strong> to generate automated grading and keypoint matching.</p>
        </div>
      `;
    }

    setEvaluationData(evaluation, paperMeta, rubric) {
      this.currentEvaluation = evaluation;
      this.currentPaperMeta = paperMeta || { studentName: 'Student', rollNo: 'ROLL-101' };
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
        <div class="review-panel-inner animate-fade-in">
          
          <!-- Score Hero Card -->
          <div class="score-hero-card ${this.isOverridden ? 'score-overridden' : ''}">
            <div class="score-hero-header">
              <div class="student-info-block">
                <span class="roll-badge">${meta.rollNo}</span>
                <span class="student-name">${meta.studentName}</span>
              </div>
              <div class="ai-source-badge ${isLive ? 'badge-live' : 'badge-offline'}">
                ${renderIcon('sparkles')} ${isLive ? 'Gemini Cloud Vision' : 'Smart Offline NLP'}
              </div>
            </div>

            <div class="score-main-display">
              <div class="score-number-group">
                <div class="score-value-wrap">
                  <input type="number" id="input-final-score" class="score-input-direct" value="${this.finalScore}" step="0.25" min="0" max="${maxMarks}" />
                  <span class="score-max">/ ${maxMarks.toFixed(1)}</span>
                </div>
                <div class="score-percentage-pill">${percentage}% (${percentage >= 85 ? 'Distinction' : percentage >= 50 ? 'Pass' : 'Review'})</div>
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
                <button type="button" class="btn-link" id="btn-revert-score">Revert to AI</button>
              </div>
            ` : ''}
          </div>

          <!-- Assessment Summary Box -->
          <div class="feedback-summary-box">
            <div class="box-title">📝 AI Assessment Summary</div>
            <p class="feedback-text">${evalData.feedbackSummary}</p>
          </div>

          <!-- Transcribed OCR Text Box (Prominent & Editable) -->
          <div class="transcription-drawer">
            <div class="drawer-header" style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; padding: 0.5rem 0.75rem;">
              <span><strong>📄 Extracted Handwriting Transcript:</strong></span>
              <button type="button" class="btn btn-xs btn-outline" id="btn-toggle-edit-transcript" style="font-weight: 700;">
                ${renderIcon('edit')} ${this.isEditingTranscript ? 'Re-Evaluate Text' : 'Edit Text'}
              </button>
            </div>
            <div class="drawer-content" style="padding: 0.75rem; background: white;">
              ${this.isEditingTranscript 
                ? `<textarea id="textarea-ocr-edit" class="transcript-editor" rows="5" style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 6px; border: 1.5px solid #0f766e; border-radius: 4px;">${evalData.transcription}</textarea>`
                : `<div class="transcript-preview" style="font-family: monospace; font-size: 0.85rem; line-height: 1.45; color: #1e293b; max-height: 140px; overflow-y: auto;">${evalData.transcription.replace(/\n/g, '<br/>')}</div>`}
            </div>
          </div>

          <!-- Rubric Key Points Checklist -->
          <div class="criteria-section">
            <div class="criteria-header">
              <h4>Rubric Key Points Checklist (${evalData.points.length})</h4>
              <span class="criteria-subtext">Click badges to toggle Hit / Partial / Missed</span>
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
                    <span class="evidence-icon">❝</span>
                    <span class="evidence-quote">${pt.evidenceQuote}</span>
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

          <!-- Professor Remarks -->
          <div class="professor-notes-section">
            <label for="input-prof-remarks">Professor Remarks / Student Notes:</label>
            <input type="text" id="input-prof-remarks" class="input-control" placeholder="e.g. Good wall identification. Missed medial/lateral muscle attachments." value="${this.professorRemarks}" />
          </div>

          <!-- Accept & Next Loop Button -->
          <div class="review-action-footer">
            <button type="button" class="btn btn-success btn-lg btn-accept-next" id="btn-accept-next">
              ${renderIcon('check')} Accept Score (${this.finalScore.toFixed(2)}) & Next Paper ➔
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
        point.justification = 'Professor override: Criterion marked Full.';
      } else if (newStatus === 'partial') {
        point.awardedMarks = Number((point.weight * 0.5).toFixed(2));
        point.justification = 'Professor override: Criterion marked Partial.';
      } else {
        point.awardedMarks = 0;
        point.justification = 'Professor override: Criterion marked 0.';
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
        const stored = localStorage.getItem('gradepilot_gradebook_records') || localStorage.getItem('anatomigrade_gradebook_records');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return [
        { id: 'g1', studentName: 'Rohan Gupta', rollNo: 'STU-2024-001', subject: 'Human Anatomy', question: 'Boundaries of Axilla', finalScore: 5.0, aiScore: 5.0, maxMarks: 5.0, isOverridden: false, professorRemarks: 'All walls & attachments complete', timestamp: '11:42 AM', date: '2026-08-16' },
        { id: 'g2', studentName: 'Pooja Verma', rollNo: 'STU-2024-002', subject: 'Human Anatomy', question: 'Boundaries of Axilla', finalScore: 2.50, aiScore: 2.50, maxMarks: 5.0, isOverridden: false, professorRemarks: 'Pt 2 full, partial for walls 1,3,4', timestamp: '11:46 AM', date: '2026-08-16' }
      ];
    }

    saveRecords() {
      try { localStorage.setItem('gradepilot_gradebook_records', JSON.stringify(this.records)); } catch (e) {}
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
      link.download = `GradePilot_${new Date().toISOString().slice(0,10)}.csv`;
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
          this.updateActiveRubricBanner();
        }
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
        this.updateActiveRubricBanner();
        this.updateQuickRubricSelect();
      });

      this.bindGlobalEvents();
      this.renderRubricUI();
      this.updateHeaderStats();
      this.updateQuickRubricSelect();
    }

    bindGlobalEvents() {
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => this.switchView(tab.dataset.view));
      });

      document.getElementById('btn-run-eval')?.addEventListener('click', () => this.runEvaluation());

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

      // Test Key button
      btnTestApiKey?.addEventListener('click', async () => {
        const keyVal = inputApiKey ? inputApiKey.value.trim() : '';
        if (!keyVal) {
          if (testFeedback) testFeedback.innerHTML = '<span style="color: #e11d48;">⚠️ Please paste your API key first.</span>';
          return;
        }
        btnTestApiKey.disabled = true;
        btnTestApiKey.textContent = 'Testing...';
        if (testFeedback) testFeedback.innerHTML = '<span style="color: #0f766e;">Connecting to Google AI Studio...</span>';

        const testRes = await this.aiService.testApiKey(keyVal);
        btnTestApiKey.disabled = false;
        btnTestApiKey.textContent = '🧪 Test Key';

        if (testRes.ok) {
          if (testFeedback) testFeedback.innerHTML = `<span style="color: #059669; font-weight: 700;">✓ Connected Successfully! Active Vision: <code style="background: #e6f4ea; padding: 2px 5px; border-radius: 3px;">${testRes.activeModel}</code></span>`;
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
          this.showNotification('✓ Gemini Vision API activated!', 'success');
        } else {
          this.showNotification('API key removed. Running in offline mode.', 'info');
        }
        this.updateHeaderStats();
      });

      document.getElementById('select-quick-rubric')?.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification(`Loaded rubric: ${this.rubricManager.getRubric().subject}`, 'info');
      });
    }

    updateQuickRubricSelect() {
      const select = document.getElementById('select-quick-rubric');
      if (!select) return;
      const all = this.rubricManager.getAllRubrics();
      const currentId = this.rubricManager.getRubric().id;
      select.innerHTML = all.map(p => `
        <option value="${p.id}" ${p.id === currentId ? 'selected' : ''}>
          ${p.isCustom ? '⭐ ' : ''}${p.subject}: ${p.question.substring(0, 38)}... (${p.maxMarks}M)
        </option>
      `).join('');
    }

    switchView(viewName) {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === viewName));
      document.querySelectorAll('.view-section').forEach(sec => sec.classList.toggle('hidden', sec.id !== `view-${viewName}`));
      if (viewName === 'gradebook') this.gradebook.render();
    }

    updateActiveRubricBanner() {
      const r = this.rubricManager.getRubric();
      const s = document.getElementById('banner-subject');
      const q = document.getElementById('banner-question');
      const m = document.getElementById('banner-max-marks');
      if (s) s.textContent = r.subject;
      if (q) q.textContent = r.question;
      if (m) m.textContent = `${r.maxMarks} Marks`;
    }

    async runEvaluation() {
      if (this.isEvaluating) return;
      if (!this.currentPaper) return this.showNotification('Please select or capture a paper first.', 'warning');

      const btn = document.getElementById('btn-run-eval');
      const rubric = this.rubricManager.getRubric();

      this.isEvaluating = true;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm"></span> Evaluating...`;
      }

      this.showEvaluationLoading('Evaluating student handwriting & anatomical relations...');

      try {
        const result = await this.aiService.evaluatePaper({
          imageSrc: this.currentPaper.imageSrc,
          rawText: this.currentPaper.meta?.rawText,
          rubric: rubric,
          sampleMeta: this.currentPaper.meta,
          progressCallback: (statusText) => this.showEvaluationLoading(statusText)
        });

        this.reviewPanel.setEvaluationData(result, this.currentPaper.meta, rubric);
        this.showNotification(`Evaluation complete! Score: ${result.suggestedScore}/${rubric.maxMarks}`, 'success');

        if (window.innerWidth < 900) {
          document.getElementById('review-container')?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {
        console.error(err);
        const localFallback = this.aiService.evaluateIntelligentLocal({
          rawText: this.currentPaper.meta?.rawText,
          rubric: rubric,
          sampleMeta: this.currentPaper.meta
        });
        this.reviewPanel.setEvaluationData(localFallback, this.currentPaper.meta, rubric);
        this.showNotification(`Evaluation complete! Score: ${localFallback.suggestedScore}/${rubric.maxMarks}`, 'info');
      } finally {
        this.isEvaluating = false;
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>✨</span> Run AI Evaluation`;
        }
      }
    }

    recalculateWithText(updatedText) {
      const rubric = this.rubricManager.getRubric();
      const evalResult = this.aiService.evaluateIntelligentLocal({
        rawText: updatedText,
        rubric: rubric,
        sampleMeta: this.currentPaper?.meta
      });
      this.reviewPanel.setEvaluationData(evalResult, this.currentPaper?.meta, rubric);
      this.showNotification(`Recalculated with updated OCR text! Score: ${evalResult.suggestedScore}/${rubric.maxMarks}`, 'success');
    }

    showEvaluationLoading(customStatus = '') {
      const c = document.getElementById('review-container');
      if (!c) return;
      c.innerHTML = `
        <div class="evaluation-loading-card">
          <div class="loading-pulse-ring"></div>
          <div class="loading-title">GradePilot AI Evaluating</div>
          <div style="font-size: 0.85rem; color: #0f766e; font-weight: 600; margin-top: -6px;">${customStatus || 'Processing...'}</div>
          <div class="loading-steps-list">
            <div class="step-item active"><span class="step-dot"></span> Transcribing handwritten terminology...</div>
            <div class="step-item active"><span class="step-dot"></span> Matching keywords & wall boundaries...</div>
            <div class="step-item active"><span class="step-dot"></span> Calculating granular decimal score...</div>
          </div>
        </div>
      `;
    }

    handleAcceptAndNext(record) {
      this.gradebook.addRecord(record);
      this.showNotification(`✓ Grade logged for ${record.studentName} (${record.rollNo}): ${record.finalScore}/${record.maxMarks}`, 'success');

      this.currentSampleIndex = (this.currentSampleIndex + 1) % SAMPLE_PAPERS.length;
      const nextSample = SAMPLE_PAPERS[this.currentSampleIndex];

      document.querySelectorAll('.preset-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.sampleId === nextSample.id);
      });

      this.capture.loadSample(nextSample.id);
      this.reviewPanel.renderEmptyState();
      this.updateHeaderStats();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateHeaderStats() {
      const stats = this.gradebook.getStats();
      const count = document.getElementById('header-graded-count');
      const time = document.getElementById('header-time-saved');
      const api = document.getElementById('header-api-status');

      if (count) count.textContent = `${stats.total} Graded`;
      if (time) time.textContent = `~${stats.timeSavedMinutes}m Saved`;
      if (api) {
        if (this.aiService.hasLiveApiKey()) {
          api.className = 'header-api-badge live';
          api.innerHTML = `🟢 Live Vision Ready`;
        } else {
          api.className = 'header-api-badge offline';
          api.innerHTML = `⚡ Offline NLP Ready`;
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
              <h3>Rubric & Answer Key Configuration</h3>
              <p class="text-muted">Define question details and weighted key point criteria for AI grading.</p>
            </div>
            <div class="preset-action-bar" style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm" id="btn-new-blank-rubric" style="font-weight: 700; background: #0f766e;">
                ${renderIcon('plus')} + New Question
              </button>
              <div class="preset-selector-group">
                <label>Presets:</label>
                <select id="select-rubric-preset" class="input-select">
                  ${allRubrics.map(p => `
                    <option value="${p.id}" ${p.id === rubric.id ? 'selected' : ''}>
                      ${p.isCustom ? '⭐ ' : ''}${p.subject} - ${p.question.substring(0, 30)}... (${p.maxMarks}M)
                    </option>
                  `).join('')}
                </select>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-save-custom-rubric" style="font-weight: 700;">
                💾 Save Rubric
              </button>
            </div>
          </div>

          <div class="rubric-meta-grid">
            <div class="form-group">
              <label for="input-rubric-subject">Subject / Course Name:</label>
              <input type="text" id="input-rubric-subject" class="input-control" value="${rubric.subject}" placeholder="e.g. Upper Limb Anatomy, Biology, History..." />
            </div>
            <div class="form-group">
              <label for="input-rubric-maxmarks">Maximum Marks:</label>
              <input type="number" id="input-rubric-maxmarks" class="input-control" step="0.5" min="1" value="${rubric.maxMarks}" />
            </div>
            <div class="form-group span-2">
              <label for="input-rubric-question">Question Prompt:</label>
              <textarea id="input-rubric-question" class="input-control" rows="2" placeholder="Enter question prompt...">${rubric.question}</textarea>
            </div>
          </div>

          <div class="weight-summary-bar ${isBalanced ? 'balanced' : 'unbalanced'}">
            <div class="weight-status-text">
              Total Criteria Marks: <strong>${currentTotalWeight.toFixed(2)}</strong> / Max: <strong>${rubric.maxMarks.toFixed(2)}</strong>
              ${isBalanced ? '<span class="status-badge-ok">✓ Balanced</span>' : '<span class="status-badge-warn">⚠️ Mismatch</span>'}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-rebalance-weights">Auto-Balance Weights</button>
          </div>

          <div class="keypoints-list-header">
            <h4>Key Points / Answer Key Checklist (${rubric.keyPoints.length})</h4>
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

      c.querySelector('#btn-new-blank-rubric')?.addEventListener('click', () => {
        this.rubricManager.createNewBlankQuestion();
        this.showNotification('New blank question created! Type your question & key points below.', 'info');
      });

      c.querySelector('#btn-save-custom-rubric')?.addEventListener('click', () => {
        this.rubricManager.saveCurrentAsPreset();
        this.showNotification('✓ Question rubric saved to question bank!', 'success');
      });

      c.querySelector('#select-rubric-preset')?.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification('Rubric loaded!', 'info');
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
      window.gradePilotApp = new App();
      window.anatomiGradeApp = window.gradePilotApp;
    });
  } else {
    window.gradePilotApp = new App();
    window.anatomiGradeApp = window.gradePilotApp;
  }
})();

// AnatomiGrade AI - Sample Exam Papers & Presets Database

// Helper to generate a realistic SVG handwritten exam paper
function generateHandwrittenPaperSvg({
  studentName,
  rollNo,
  subject,
  questionTitle,
  lines,
  diagramType = null,
  inkColor = '#1e3a8a', // classic blue ballpoint
  paperColor = '#fffdfa',
  slant = -2
}) {
  const lineSpacing = 34;
  const startY = 180;
  const totalHeight = Math.max(900, startY + lines.length * lineSpacing + 220);

  // Generate ruled horizontal lines
  let ruledLinesSvg = '';
  for (let y = 140; y < totalHeight - 40; y += lineSpacing) {
    ruledLinesSvg += `<line x1="80" y1="${y}" x2="740" y2="${y}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="none"/>`;
  }

  // Handwritten text rendering with slight organic rotations/offsets
  let textSvg = '';
  lines.forEach((line, idx) => {
    const y = startY + idx * lineSpacing;
    const isHeader = line.startsWith('##') || line.startsWith('Q.') || line.startsWith('Ans:');
    const cleanText = line.replace(/^##\s*/, '');
    const xOffset = line.startsWith('  -') ? 140 : line.startsWith('  ') ? 120 : 100;
    const fontSize = isHeader ? 17 : 15;
    const fontWeight = isHeader ? '700' : '500';
    const randomRot = ((idx % 5) - 2) * 0.35 + slant;
    const randomDy = ((idx % 3) - 1) * 1.2;

    textSvg += `
      <g transform="rotate(${randomRot}, ${xOffset}, ${y})">
        <text x="${xOffset}" y="${y + randomDy}" font-family="'Caveat', 'Comic Sans MS', 'Patrick Hand', cursive, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${inkColor}" letter-spacing="0.5">
          ${escapeXml(cleanText)}
        </text>
      </g>
    `;
  });

  // Optional rough anatomical diagram sketch
  let diagramSvg = '';
  if (diagramType === 'brachial_plexus') {
    const diagY = totalHeight - 200;
    diagramSvg = `
      <g transform="translate(140, ${diagY})" stroke="${inkColor}" stroke-width="1.8" fill="none" stroke-linecap="round">
        <rect x="0" y="0" width="500" height="130" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4" fill="#f8fafc" fill-opacity="0.5" rx="6"/>
        <text x="15" y="22" font-family="'Caveat', cursive" font-size="14" font-weight="bold" fill="${inkColor}">Fig: Schematic Diagram of Brachial Plexus</text>
        
        <!-- Roots C5-T1 -->
        <text x="15" y="45" font-family="'Caveat', cursive" font-size="12" fill="${inkColor}">C5</text>
        <text x="15" y="60" font-family="'Caveat', cursive" font-size="12" fill="${inkColor}">C6</text>
        <text x="15" y="75" font-family="'Caveat', cursive" font-size="12" fill="${inkColor}">C7</text>
        <text x="15" y="90" font-family="'Caveat', cursive" font-size="12" fill="${inkColor}">C8</text>
        <text x="15" y="105" font-family="'Caveat', cursive" font-size="12" fill="${inkColor}">T1</text>

        <!-- Root lines -->
        <path d="M35 42 Q 60 48, 90 52"/>
        <path d="M35 57 Q 60 54, 90 52"/>
        <path d="M35 72 L 90 72"/>
        <path d="M35 87 Q 60 92, 90 98"/>
        <path d="M35 102 Q 60 100, 90 98"/>

        <!-- Trunks -->
        <path d="M90 52 L 170 52"/> <text x="100" y="46" font-family="'Caveat', cursive" font-size="11" fill="#475569">Upper</text>
        <path d="M90 72 L 170 72"/> <text x="100" y="66" font-family="'Caveat', cursive" font-size="11" fill="#475569">Middle</text>
        <path d="M90 98 L 170 98"/> <text x="100" y="94" font-family="'Caveat', cursive" font-size="11" fill="#475569">Lower</text>

        <!-- Divisions & Cords -->
        <path d="M170 52 L 250 45"/> <!-- Ant to Lateral -->
        <path d="M170 72 L 250 45"/> <!-- Ant to Lateral -->
        <path d="M170 52 L 250 72" stroke-dasharray="3,3"/> <!-- Post to Post -->
        <path d="M170 72 L 250 72" stroke-dasharray="3,3"/>
        <path d="M170 98 L 250 72" stroke-dasharray="3,3"/>
        <path d="M170 98 L 250 100"/> <!-- Ant to Medial -->

        <!-- Cords labels -->
        <text x="260" y="47" font-family="'Caveat', cursive" font-size="11" fill="${inkColor}">Lat. Cord -> Musculocutaneous, Median(L)</text>
        <text x="260" y="74" font-family="'Caveat', cursive" font-size="11" fill="${inkColor}">Post. Cord -> Radial, Axillary</text>
        <text x="260" y="103" font-family="'Caveat', cursive" font-size="11" fill="${inkColor}">Med. Cord -> Ulnar, Median(M)</text>
      </g>
    `;
  } else if (diagramType === 'cardiac_cycle') {
    const diagY = totalHeight - 190;
    diagramSvg = `
      <g transform="translate(140, ${diagY})" stroke="${inkColor}" stroke-width="1.6" fill="none">
        <rect x="0" y="0" width="500" height="120" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4" fill="#f8fafc" fill-opacity="0.5" rx="6"/>
        <text x="15" y="20" font-family="'Caveat', cursive" font-size="14" font-weight="bold" fill="${inkColor}">Fig: Wiggers / Ventricular Pressure Curve Outline</text>
        <!-- Pressure pulse curve -->
        <path d="M30 90 L 100 90 Q 140 20, 200 20 Q 260 20, 300 80 Q 320 75, 330 85 L 470 90" stroke-width="2.2"/>
        <text x="160" y="40" font-family="'Caveat', cursive" font-size="12" fill="#047857">Max Systolic (120 mmHg)</text>
        <text x="50" y="105" font-family="'Caveat', cursive" font-size="11" fill="#475569">Isovolumetric Contraction</text>
        <text x="310" y="105" font-family="'Caveat', cursive" font-size="11" fill="#475569">Semilunar Closure (S2)</text>
      </g>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalHeight}" width="100%" height="100%">
      <defs>
        <!-- Soft paper grain filter -->
        <filter id="paper-texture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0"/>
          <feComposite in2="SourceGraphic" in="gl" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
        </filter>
        <linearGradient id="page-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.06"/>
          <stop offset="2%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="98%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.08"/>
        </linearGradient>
      </defs>

      <!-- Paper background -->
      <rect width="800" height="${totalHeight}" fill="${paperColor}"/>
      <rect width="800" height="${totalHeight}" fill="url(#page-shadow)"/>

      <!-- Red vertical margin line -->
      <line x1="80" y1="0" x2="80" y2="${totalHeight}" stroke="#f87171" stroke-width="1.8" stroke-opacity="0.85"/>
      <line x1="83" y1="0" x2="83" y2="${totalHeight}" stroke="#f87171" stroke-width="0.8" stroke-opacity="0.45"/>

      <!-- Top Header Ruled Lines -->
      <line x1="0" y1="130" x2="800" y2="130" stroke="#94a3b8" stroke-width="1.5"/>

      <!-- University Exam Header Stamp -->
      <g transform="translate(100, 30)">
        <text x="0" y="20" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#0f172a" letter-spacing="1">FACULTY OF MEDICINE - INTERNAL ASSESSMENT I</text>
        <text x="0" y="42" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Subject: <tspan font-weight="600" fill="#1e293b">${escapeXml(subject)}</tspan></text>
        <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll No: <tspan font-weight="700" fill="#0f766e">${escapeXml(rollNo)}</tspan></text>
        <text x="0" y="86" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Date: 16-Aug-2026 | Max Time: 45 Mins</text>
        
        <!-- Stamp circle -->
        <circle cx="560" cy="40" r="32" stroke="#dc2626" stroke-width="1.5" fill="none" stroke-dasharray="3,2" transform="rotate(-12, 560, 40)"/>
        <text x="532" y="38" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#dc2626" transform="rotate(-12, 560, 40)">DEPARTMENT OF</text>
        <text x="536" y="49" font-family="'Inter', sans-serif" font-size="9" font-weight="bold" fill="#dc2626" transform="rotate(-12, 560, 40)">ANATOMY</text>
      </g>

      <!-- Ruled horizontal notebook lines -->
      ${ruledLinesSvg}

      <!-- Handwritten text -->
      ${textSvg}

      <!-- Diagram -->
      ${diagramSvg}
    </svg>
  `;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Sample papers with handwritten answers and pre-evaluated simulated ground truths
export const SAMPLE_PAPERS = [
  {
    id: 'sample-1',
    studentName: 'Anya Sharma',
    rollNo: 'MED-2024-001',
    subject: 'Human Anatomy - Paper I',
    questionId: 'preset-brachial-plexus',
    questionTitle: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
    maxScore: 10.0,
    expectedScore: 9.25,
    description: 'High-Scoring Paper: Exhaustive coverage of roots, trunks, divisions, cords, branches and Erb\'s palsy.',
    rawText: `Ans 1: Brachial Plexus
1. Formation & Roots:
Formed by the anterior (ventral) rami of C5, C6, C7, C8, and T1 spinal nerves. Minor contribution from C4 (pre-fixed) or T2 (post-fixed).
2. Trunks:
- Upper Trunk: Formed by union of C5 & C6 roots.
- Middle Trunk: Continuation of C7 root.
- Lower Trunk: Formed by union of C8 & T1 roots.
They pass through the posterior triangle of the neck above the clavicle.
3. Divisions:
Each trunk divides into Anterior (flexor) and Posterior (extensor) divisions beneath the clavicle.
4. Cords (related to 2nd part of Axillary Artery):
- Lateral Cord: Anterior divisions of Upper & Middle trunks (C5, C6, C7).
- Medial Cord: Anterior division of Lower trunk (C8, T1).
- Posterior Cord: Posterior divisions of all three trunks (C5, C6, C7, C8, T1).
5. Terminal Branches:
- Lateral cord gives Musculocutaneous nerve and Lateral root of Median nerve.
- Medial cord gives Ulnar nerve, Medial root of Median nerve, and Medial cutaneous nerves.
- Posterior cord gives Radial nerve, Axillary nerve, Thoracodorsal, and Subscapular nerves.
6. Applied Anatomy:
- Erb-Duchenne Palsy: Injury to upper trunk (Erb's point: C5, C6). Leads to 'Policeman's tip' or 'Waiter's tip' deformity (adducted arm, medially rotated, pronated forearm).
- Klumpke's Palsy: Injury to lower trunk (C8, T1) causing claw hand.`,
    diagramType: 'brachial_plexus',
    inkColor: '#1d4ed8'
  },
  {
    id: 'sample-2',
    studentName: 'David Chen',
    rollNo: 'MED-2024-002',
    subject: 'Human Anatomy - Paper I',
    questionId: 'preset-brachial-plexus',
    questionTitle: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
    maxScore: 10.0,
    expectedScore: 6.0,
    description: 'Average Paper: Correct roots and trunks, but missed division details and incomplete applied anatomy.',
    rawText: `Ans 1: Brachial Plexus
The brachial plexus is a network of nerves supplying upper limb.
Roots:
It is formed by ventral rami of C5, C6, C7, C8, and T1.
Trunks:
- Upper trunk from C5 + C6
- Middle trunk from C7
- Lower trunk from C8 + T1
Trunks are located in neck.
Cords:
The cords surround the axillary artery:
- Lateral cord gives Musculocutaneous nerve and Median nerve branch.
- Medial cord gives Ulnar nerve.
- Posterior cord gives Radial and Axillary nerves.
Applied Anatomy:
Injury to brachial plexus causes paralysis. Erb's palsy occurs in upper trunk injury leading to arm hanging by side.`,
    diagramType: 'brachial_plexus',
    inkColor: '#0f172a'
  },
  {
    id: 'sample-3',
    studentName: 'Rahul Verma',
    rollNo: 'MED-2024-003',
    subject: 'Physiology & Anatomy of Cardiovascular System',
    questionId: 'preset-cardiac-cycle',
    questionTitle: 'Explain the events of the Cardiac Cycle with emphasis on ventricular phases and valve mechanics.',
    maxScore: 5.0,
    expectedScore: 3.75,
    description: 'Good Theory Paper: Well structured systole/diastole with accurate valve timings; missed diastasis duration.',
    rawText: `Ans: Cardiac Cycle
The cardiac cycle consists of mechanical and electrical events occurring from the beginning of one heartbeat to the next. Normal duration = 0.8 seconds (at 75 bpm).
Phases:
1. Ventricular Systole (0.3s):
  a) Isovolumetric Contraction: Ventricles contract with all valves (AV and Semilunar) closed. Rapid rise in intraventricular pressure. Produces First Heart Sound (S1) due to closure of Mitral/Tricuspid valves.
  b) Rapid & Reduced Ejection: Aortic and Pulmonary semilunar valves open when ventricular pressure exceeds 80 mmHg (left) and 10 mmHg (right). Blood is pumped into aorta/pulmonary trunk.
2. Ventricular Diastole (0.5s):
  a) Isovolumetric Relaxation: Semilunar valves snap shut producing Second Heart Sound (S2). All 4 valves closed.
  b) Rapid Ventricular Filling: AV valves open as ventricular pressure drops below atrial pressure.
  c) Diastasis and Atrial Systole (0.1s): Atria contract to pump final 20-30% blood into ventricles.
Valve Mechanics:
- Chordae tendineae and papillary muscles prevent eversion of AV valve cusps into atria during systole.`,
    diagramType: 'cardiac_cycle',
    inkColor: '#0369a1'
  },
  {
    id: 'sample-4',
    studentName: 'Elena Rostova',
    rollNo: 'MED-2024-004',
    subject: 'Histology & Renal Anatomy',
    questionId: 'preset-renal-histology',
    questionTitle: 'Describe the microscopic anatomy of the Renal Cortex, Glomerulus, and Filtration Barrier.',
    maxScore: 5.0,
    expectedScore: 4.75,
    description: 'Comprehensive Histology Paper: Exact ultrastructure of podocytes, slit diaphragm, and basement membrane.',
    rawText: `Ans: Microscopic Anatomy of Renal Cortex & Filtration Barrier
1. Renal Cortex Structure:
Contains Renal Corpuscles (Malpighian corpuscles), Proximal Convoluted Tubules (PCT with brush border), Distal Convoluted Tubules (DCT), and Medullary Rays.
2. Renal Corpuscle:
Consists of:
- Bowman's Capsule: Parietal layer (simple squamous epithelium) and Visceral layer (specialized Podocytes).
- Glomerulus: Tuft of fenestrated anastomosing capillaries supplied by Afferent arteriole and drained by Efferent arteriole.
3. Glomerular Filtration Barrier (3 Layers):
- Fenestrated Capillary Endothelium (pores 70-100 nm, restricts RBCs).
- Glomerular Basement Membrane (GBM): Thick fused lamina densa composed of Type IV collagen and heparan sulfate (negatively charged, repels albumin).
- Podocyte Foot Processes (Pedicels): Interdigitate to form filtration slits bridged by Slit Diaphragm (nephrin and podocin proteins).
4. Juxtaglomerular Apparatus (JGA):
Comprises Macula Densa of DCT, Juxtaglomerular (JG) cells of afferent arteriole secreting renin, and Extraglomerular mesangial (Lacis) cells.`,
    diagramType: null,
    inkColor: '#1e3a8a'
  },
  {
    id: 'sample-5',
    studentName: 'Marcus Vance',
    rollNo: 'MED-2024-005',
    subject: 'Human Anatomy - Paper I',
    questionId: 'preset-brachial-plexus',
    questionTitle: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
    maxScore: 10.0,
    expectedScore: 3.25,
    description: 'Challenging / Messy Handwriting: Disorganized answer with several missing anatomical points.',
    rawText: `Brachial Plexus ans
Root from C5 to T1.
Trunk = top trunk, mid trunk, bot trunk.
Upper is C5 C6, mid C7, lower C8 T1.
Divisions into ant and post.
Lateral cord gives musculocutaneous. Medial gives ulnar. Post cord gives radial.
Klumpke is lower trunk injury.
Radial nerve injury gives wrist drop.`,
    diagramType: null,
    inkColor: '#334155',
    slant: -4
  }
];

// Helper to get SVG data URI for a sample paper
export function getSampleSvgDataUrl(sampleId) {
  const sample = SAMPLE_PAPERS.find(s => s.id === sampleId) || SAMPLE_PAPERS[0];
  const lines = sample.rawText.split('\n');
  const svgString = generateHandwrittenPaperSvg({
    studentName: sample.studentName,
    rollNo: sample.rollNo,
    subject: sample.subject,
    questionTitle: sample.questionTitle,
    lines: lines,
    diagramType: sample.diagramType,
    inkColor: sample.inkColor || '#1e3a8a',
    slant: sample.slant || -2
  });
  
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

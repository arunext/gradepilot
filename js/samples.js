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
  fontFamily = null,
  headerType = null,
  slant = -2.5
}) {
  const activeFont = fontFamily || "'Caveat', 'Comic Sans MS', 'Patrick Hand', cursive, sans-serif";
  const lineSpacing = 34;
  const startY = 190;
  const totalHeight = Math.max(960, startY + lines.length * lineSpacing + 200);

  // Generate ruled horizontal lines
  let ruledLinesSvg = '';
  for (let y = 140; y < totalHeight - 40; y += lineSpacing) {
    ruledLinesSvg += `<line x1="80" y1="${y}" x2="740" y2="${y}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="none"/>`;
  }

  // Handwritten text rendering with realistic uneven slants, strikethroughs, and caret insertions
  let textSvg = '';
  lines.forEach((rawLine, idx) => {
    const y = startY + idx * lineSpacing;
    const isHeader = rawLine.startsWith('##') || rawLine.startsWith('Q.') || rawLine.startsWith('Ans') || rawLine.startsWith('Q1') || rawLine.startsWith('Q2') || rawLine.startsWith('Q3') || rawLine.startsWith('Q4') || rawLine.startsWith('Q5');
    const isCaret = rawLine.trim().startsWith('^');
    const cleanLine = rawLine.replace(/^##\s*/, '');
    
    const organicSlant = slant + Math.sin(idx * 0.9) * 0.8;
    const randomDy = Math.sin(idx * 2.3) * 2.2;
    const xBase = cleanLine.startsWith('  -') ? 140 : cleanLine.startsWith('  ') ? 120 : isCaret ? 130 : 100;
    const fontSize = isHeader ? 18 : isCaret ? 14.5 : 16;
    const fontWeight = isHeader ? '700' : '500';

    let lineContent = cleanLine;
    let strikethroughSvg = '';

    const strikeMatch = lineContent.match(/~~([^~]+)~~/);
    if (strikeMatch) {
      const strikeText = strikeMatch[1];
      const strikeIndex = lineContent.indexOf('~~');
      const textBefore = lineContent.substring(0, strikeIndex);
      const approxXBefore = xBase + textBefore.length * 8.5;
      const strikeWidth = Math.max(45, strikeText.length * 9.5);

      strikethroughSvg = `
        <g opacity="0.9">
          <path d="M ${approxXBefore - 4} ${y + randomDy - 4} 
                   Q ${approxXBefore + strikeWidth * 0.25} ${y + randomDy - 9}, ${approxXBefore + strikeWidth * 0.5} ${y + randomDy - 3} 
                   T ${approxXBefore + strikeWidth + 6} ${y + randomDy - 6}" 
                stroke="${inkColor}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
          <path d="M ${approxXBefore + strikeWidth + 4} ${y + randomDy - 1} 
                   Q ${approxXBefore + strikeWidth * 0.6} ${y + randomDy + 5}, ${approxXBefore - 2} ${y + randomDy + 2}" 
                stroke="${inkColor}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
          <path d="M ${approxXBefore} ${y + randomDy - 2} L ${approxXBefore + strikeWidth} ${y + randomDy - 2}" 
                stroke="${inkColor}" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        </g>
      `;
      lineContent = lineContent.replace(/~~([^~]+)~~/, '$1');
    }

    if (isCaret) {
      const caretY = y + randomDy - 10;
      textSvg += `
        <g transform="rotate(${organicSlant}, ${xBase}, ${y})">
          <path d="M ${xBase - 15} ${caretY + 8} L ${xBase - 8} ${caretY - 2} L ${xBase - 1} ${caretY + 8}" stroke="${inkColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <text x="${xBase}" y="${caretY}" font-family="${activeFont}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${inkColor}" letter-spacing="0.3">
            ${escapeXml(lineContent.replace(/^\^\s*/, ''))}
          </text>
        </g>
      `;
    } else {
      textSvg += `
        <g transform="rotate(${organicSlant}, ${xBase}, ${y})">
          <text x="${xBase}" y="${y + randomDy}" font-family="${activeFont}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${inkColor}" letter-spacing="0.3">
            ${escapeXml(lineContent)}
          </text>
          ${strikethroughSvg}
        </g>
      `;
    }
  });

  // Dynamic header block
  let headerSvg = '';
  if (headerType === 'cbse') {
    headerSvg = `
      <g transform="translate(100, 26)">
        <text x="0" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#0f172a" letter-spacing="1">CENTRAL BOARD OF SECONDARY EDUCATION (CBSE) — TERM II</text>
        <text x="0" y="42" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Subject: <tspan font-weight="600" fill="#1e293b">${escapeXml(subject)}</tspan></text>
        <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll: <tspan font-weight="700" fill="#00a991">${escapeXml(rollNo)}</tspan></text>
        <text x="0" y="86" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Exam Date: Term Finals 2026 | Max Time: 3 Hours</text>
        <circle cx="560" cy="42" r="32" stroke="#dc2626" stroke-width="1.5" fill="none" stroke-dasharray="3,2" transform="rotate(-10, 560, 42)"/>
        <text x="528" y="39" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">TERM EXAM 2026</text>
        <text x="532" y="50" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">VERIFIED COPY</text>
      </g>
    `;
  } else if (headerType === 'cs_finals') {
    headerSvg = `
      <g transform="translate(100, 26)">
        <text x="0" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#0f172a" letter-spacing="1">DEPARTMENT OF COMPUTER SCIENCE &amp; ENGG — SEMESTER FINALS</text>
        <text x="0" y="42" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Subject: <tspan font-weight="600" fill="#1e293b">${escapeXml(subject)}</tspan></text>
        <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll: <tspan font-weight="700" fill="#00a991">${escapeXml(rollNo)}</tspan></text>
        <text x="0" y="86" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Course: CS-501 | Semester Final Examination</text>
        <circle cx="560" cy="42" r="32" stroke="#dc2626" stroke-width="1.5" fill="none" stroke-dasharray="3,2" transform="rotate(-10, 560, 42)"/>
        <text x="532" y="39" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">SEMESTER 2026</text>
        <text x="536" y="50" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">EVALUATED</text>
      </g>
    `;
  } else {
    headerSvg = `
      <g transform="translate(100, 26)">
        <text x="0" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#0f172a" letter-spacing="1">FACULTY OF MEDICINE — UNIVERSITY PROFESSIONAL EXAM</text>
        <text x="0" y="42" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Subject: <tspan font-weight="600" fill="#1e293b">${escapeXml(subject)}</tspan></text>
        <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll: <tspan font-weight="700" fill="#00a991">${escapeXml(rollNo)}</tspan></text>
        <text x="0" y="86" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Batch: MBBS Professional Assessment</text>
        <circle cx="560" cy="42" r="32" stroke="#dc2626" stroke-width="1.5" fill="none" stroke-dasharray="3,2" transform="rotate(-10, 560, 42)"/>
        <text x="528" y="39" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">DEPARTMENT OF</text>
        <text x="534" y="50" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">ANATOMY</text>
      </g>
    `;
  }

  // Diagram rendering
  let diagramSvg = '';
  if (diagramType === 'brachial_plexus') {
    const diagY = totalHeight - 200;
    diagramSvg = `
      <g transform="translate(140, ${diagY})" stroke="${inkColor}" stroke-width="1.8" fill="none" stroke-linecap="round">
        <rect x="0" y="0" width="500" height="130" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4" fill="#f8fafc" fill-opacity="0.5" rx="6"/>
        <text x="15" y="22" font-family="${activeFont}" font-size="14" font-weight="bold" fill="${inkColor}">Fig: Schematic Diagram of Brachial Plexus</text>
        <text x="15" y="45" font-family="${activeFont}" font-size="12" fill="${inkColor}">C5</text>
        <text x="15" y="60" font-family="${activeFont}" font-size="12" fill="${inkColor}">C6</text>
        <text x="15" y="75" font-family="${activeFont}" font-size="12" fill="${inkColor}">C7</text>
        <text x="15" y="90" font-family="${activeFont}" font-size="12" fill="${inkColor}">C8</text>
        <text x="15" y="105" font-family="${activeFont}" font-size="12" fill="${inkColor}">T1</text>
        <path d="M35 42 Q 60 48, 90 52"/>
        <path d="M35 57 Q 60 54, 90 52"/>
        <path d="M35 72 L 90 72"/>
        <path d="M35 87 Q 60 92, 90 98"/>
        <path d="M35 102 Q 60 100, 90 98"/>
        <path d="M90 52 L 170 52"/>
        <path d="M90 72 L 170 72"/>
        <path d="M90 98 L 170 98"/>
        <path d="M170 52 L 250 45"/>
        <path d="M170 72 L 250 45"/>
        <path d="M170 52 L 250 72" stroke-dasharray="3,3"/>
        <path d="M170 72 L 250 72" stroke-dasharray="3,3"/>
        <path d="M170 98 L 250 72" stroke-dasharray="3,3"/>
        <path d="M170 98 L 250 100"/>
        <text x="260" y="47" font-family="${activeFont}" font-size="11" fill="${inkColor}">Lat. Cord -> Musculocutaneous, Median(L)</text>
        <text x="260" y="74" font-family="${activeFont}" font-size="11" fill="${inkColor}">Post. Cord -> Radial, Axillary</text>
        <text x="260" y="103" font-family="${activeFont}" font-size="11" fill="${inkColor}">Med. Cord -> Ulnar, Median(M)</text>
      </g>
    `;
  } else if (diagramType === 'cardiac_cycle') {
    const diagY = totalHeight - 190;
    diagramSvg = `
      <g transform="translate(140, ${diagY})" stroke="${inkColor}" stroke-width="1.6" fill="none">
        <rect x="0" y="0" width="500" height="120" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4" fill="#f8fafc" fill-opacity="0.5" rx="6"/>
        <text x="15" y="20" font-family="${activeFont}" font-size="14" font-weight="bold" fill="${inkColor}">Fig: Wiggers / Ventricular Pressure Curve Outline</text>
        <path d="M30 90 L 100 90 Q 140 20, 200 20 Q 260 20, 300 80 Q 320 75, 330 85 L 470 90" stroke-width="2.2"/>
        <text x="160" y="40" font-family="${activeFont}" font-size="12" fill="#047857">Max Systolic (120 mmHg)</text>
        <text x="50" y="105" font-family="${activeFont}" font-size="11" fill="#475569">Isovolumetric Contraction</text>
        <text x="310" y="105" font-family="${activeFont}" font-size="11" fill="#475569">Semilunar Closure (S2)</text>
      </g>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalHeight}" width="100%" height="100%">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&amp;family=Kalam:wght@400;700&amp;family=Reenie+Beanie&amp;family=Shadows+Into+Light&amp;family=Inter:wght@400;600;700;800&amp;display=swap');
        </style>
        <linearGradient id="page-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.05"/>
          <stop offset="2%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="98%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <rect width="800" height="${totalHeight}" fill="${paperColor}"/>
      <rect width="800" height="${totalHeight}" fill="url(#page-shadow)"/>
      <line x1="80" y1="0" x2="80" y2="${totalHeight}" stroke="#f87171" stroke-width="1.8"/>
      <line x1="83" y1="0" x2="83" y2="${totalHeight}" stroke="#f87171" stroke-width="0.8" opacity="0.6"/>
      <line x1="0" y1="130" x2="800" y2="130" stroke="#94a3b8" stroke-width="1.5"/>
      ${headerSvg}
      ${ruledLinesSvg}
      ${textSvg}
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
  },
  {
    id: 'sample-6',
    studentName: 'Aarav Patel',
    rollNo: 'CS-2026-001',
    subject: 'Computer Science & AI Master Paper',
    questionId: 'preset-multi-cs-exam',
    questionTitle: 'CS & AI Master Examination (5 Questions, 25 Marks)',
    maxScore: 25.0,
    expectedScore: 24.25,
    description: 'High-Scoring Paper (24.25/25): Comprehensive derivations, exact complexity analysis, and formal cryptography equations.',
    rawText: `Ans Sheet: CS & AI Master Exam - Aarav Patel (Roll: CS-2026-001)

Q1: Backpropagation in Deep Neural Networks
Forward pass computes network activations z = w*x + b and prediction y_hat. Loss L is computed against target y using loss function.
Backward pass computes partial derivatives of loss wrt weights using chain rule:
dL/dw = (dL/da) * (da/dz) * (dz/dw)
Where dz/dw = x. Gradient descent updates weights: w = w - eta * (dL/dw).
Error gradients propagate backward layer by layer from output to input.

Q2: Time & Space Complexity: QuickSort vs MergeSort
1. MergeSort:
- Divide & Conquer algorithm splitting array into sub-buffers.
- Average Time: O(N log N)
- Worst Time: O(N log N) (guaranteed balanced splitting)
- Space: O(N) auxiliary array space for merging sub-arrays.
2. QuickSort:
- Partitioning algorithm around chosen pivot element.
- Average Time: O(N log N)
- Worst Time: O(N^2) occurs when array is already sorted and worst pivot (min/max) is selected.
- Space: O(log N) for call stack recursion (in-place partitioning).

Q3: ACID Properties in Relational Databases (RDBMS)
- Atomicity: Transactions are 'all or nothing'. If any operation fails, entire transaction rolls back to initial state.
- Consistency: Database transitions from one valid state to another, maintaining all schema constraints and foreign keys.
- Isolation: Concurrent transactions execute without inter-thread interference (achieved via locking or MVCC).
- Durability: Once committed, data changes are written to non-volatile storage (WAL log) and persist across system crashes.

Q4: Core Object-Oriented Programming (OOP) Principles
1. Encapsulation: Bundling data (private fields) and methods together, exposing access via public getters/setters.
2. Abstraction: Hiding complex implementation details using abstract classes and interfaces.
3. Inheritance: Reusing code where child subclass derives attributes and behaviors from a parent base class.
4. Polymorphism: Ability of objects to take multiple forms through method overriding (runtime) and method overloading (compile-time).

Q5: RSA Public Key Cryptography & Asymmetric Security
Select primes p, q. Compute modulus n = p*q and totient phi(n) = (p-1)*(q-1).
Choose public key exponent e coprime to phi(n). Compute private key d such that e*d = 1 mod phi(n).
- Encryption: Ciphertext c = m^e mod n using Public Key (e, n).
- Decryption: Plaintext message m = c^d mod n using Private Key (d, n).
Asymmetric mechanics allow sender to encrypt with public key without knowing private secret.`,
    diagramType: null,
    inkColor: '#1d4ed8',
    slant: -1.5
  },
  {
    id: 'sample-7',
    studentName: 'Priya Nair',
    rollNo: 'CS-2026-002',
    subject: 'Computer Science & AI Master Paper',
    questionId: 'preset-multi-cs-exam',
    questionTitle: 'CS & AI Master Examination (5 Questions, 25 Marks)',
    maxScore: 25.0,
    expectedScore: 16.50,
    description: 'Average Paper (16.50/25): Good core concepts, but omits chain rule breakdown and RSA modular exponentiation formulas.',
    rawText: `Ans Sheet: CS & AI Master Exam - Priya Nair (Roll: CS-2026-002)

Q1: Backpropagation
Backpropagation is used in deep learning to train neural networks.
It consists of forward pass to compute output and loss function, and backward pass to update weights.
Weights are adjusted using gradient descent method w = w - eta * gradient.
It calculates how much each node contributed to final error.

Q2: QuickSort vs MergeSort Complexity
MergeSort divides array into two halves, sorts them, and merges back.
Time complexity is O(N log N) in all cases (best, average, worst). Space complexity is O(N).
QuickSort picks a pivot element and partitions array around it.
Average time complexity is O(N log N). Space complexity is O(1) in-place.
Worst case time is O(N^2) when array is sorted.

Q3: Database ACID Properties
ACID stands for:
- Atomicity: All operations in transaction succeed or fail together.
- Consistency: Data remains consistent before and after transaction.
- Isolation: Multiple users reading/writing database do not clash.
- Durability: Saved data is retained permanently on hard drive.

Q4: OOP Principles
1. Encapsulation: Keeping variables private in a class so outside code cannot modify directly.
2. Inheritance: Subclass inherits properties from parent class using extends keyword.
3. Polymorphism: Same function name behaving differently depending on arguments or class type.
4. Abstraction: Hiding background details from user.

Q5: RSA Public Key Cryptography
RSA uses asymmetric cryptography with a public key for encryption and a private key for decryption.
Public key is shared with everyone, while private key is kept secret by owner.
Sender encrypts message using recipient's public key. Only holder of private key can decrypt ciphertext.
Uses prime numbers p and q to create large modulus n.`,
    diagramType: null,
    inkColor: '#0f172a',
    slant: -2.0
  },
  {
    id: 'sample-8',
    studentName: 'Rohan Gupta',
    rollNo: 'CS-2026-003',
    subject: 'Computer Science & AI Master Paper',
    questionId: 'preset-multi-cs-exam',
    questionTitle: 'CS & AI Master Examination (5 Questions, 25 Marks)',
    maxScore: 25.0,
    expectedScore: 8.75,
    description: 'Low-Scoring / Incomplete Paper (8.75/25): Brief answers with incorrect O(N) complexity claim and omitted OOP concepts.',
    rawText: `Ans Sheet: CS & AI Master Exam - Rohan Gupta (Roll: CS-2026-003)

Q1: Backpropagation in Neural Nets
Backpropagation adjusts neural net weights using loss function.
It uses back propagation of errors from output layer back to input nodes.
If loss is high, weights are changed.

Q2: QuickSort and MergeSort
QuickSort is fast sorting algorithm with time complexity O(N).
MergeSort splits array into halves and has time complexity O(N log N).
MergeSort uses extra memory space. QuickSort is faster for array sorting.

Q3: ACID Properties
A = Atomicity
C = Consistency
I = Isolation
D = Durability
Transactions in SQL database must be ACID compliant so database does not crash during power loss.

Q4: OOP Concepts
Classes and Objects are main OOP concepts.
Inheritance allows class to inherit methods.
Encapsulation wraps variables in class.

Q5: RSA Cryptography
RSA is security algorithm used in HTTPS and internet passwords.
It generates public and private key pairs.
Messages are encrypted with key so hackers cannot read packets.`,
    diagramType: null,
    inkColor: '#334155',
    slant: -3.5
  },
  {
    id: 'sample-9',
    studentName: 'Aarav Sharma',
    rollNo: 'CBSE-10-101',
    subject: 'CBSE Class 10 Science: Physics & Chemistry',
    questionId: 'preset-cbse-science-10',
    questionTitle: 'CBSE Class 10 Science: Physics & Chemistry (15 Marks)',
    maxScore: 15.0,
    expectedScore: 14.25,
    description: 'High-Scoring Paper (14.25/15): Clear Ohm\'s law derivation, balanced corrosion equation, and accurate antacid action.',
    rawText: `Ans Sheet: Class 10 Mid-Term Science - Aarav Sharma (Roll: CBSE-10-101)

Q1: Ohm's Law and Resistance of a Conductor
Ohm's Law states that at constant temperature, the electric current (I) flowing through a metallic conductor is directly proportional to the potential difference (V) across its ends:
V ∝ I => V = I * R (where R is Resistance).
Factors affecting resistance of a cylindrical conductor:
1. Length: Resistance is directly proportional to length of wire (R ∝ L).
2. Area of cross-section: Resistance is inversely proportional to cross-sectional area (R ∝ 1/A).
3. Nature of material: R = ρ * (L / A), where ρ (rho) is electrical resistivity.
4. Temperature: Resistance increases with increase in temperature for metallic conductors.

Q2: Rusting of Iron (Corrosion)
When iron is exposed to moist air containing oxygen and moisture/water, a reddish-brown coating called rust is formed.
Chemical Reaction:
4Fe(s) + 3O2(g) + 2xH2O(l) -> 2Fe2O3.xH2O(s) (Hydrated Iron(III) Oxide / Rust)
Prevention Methods:
1. Galvanization: Coating iron articles with a thin protective layer of zinc metal.
2. Painting / Greasing: Applying a coat of paint or grease on iron surface to prevent contact with air and moisture.

Q3: Neutralization Reaction & Antacids
A chemical reaction between an acid and a base to form salt and water is known as a neutralization reaction.
Example:
HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)
Antacids:
During indigestion, the stomach produces excess hydrochloric acid (HCl) causing pain and irritation. Antacids are mild basic substances like Milk of Magnesia [Mg(OH)2 - Magnesium Hydroxide] that neutralize this excess acid, giving relief.`,
    diagramType: null,
    inkColor: '#1d4ed8',
    slant: -1.2
  },
  {
    id: 'sample-10',
    studentName: 'Priya Patel',
    rollNo: 'CBSE-10-102',
    subject: 'CBSE Class 10 Science: Physics & Chemistry',
    questionId: 'preset-cbse-science-10',
    questionTitle: 'CBSE Class 10 Science: Physics & Chemistry (15 Marks)',
    maxScore: 15.0,
    expectedScore: 9.50,
    description: 'Average Paper (9.50/15): Correct Ohm\'s law statement, but omitted resistivity formula and incomplete rusting equation.',
    rawText: `Ans Sheet: Class 10 Science - Priya Patel (Roll: CBSE-10-102)

Q1: Ohm's Law
Current passing through a wire is proportional to voltage.
V = I * R.
Resistance depends on:
- Length of wire (longer wire has more resistance)
- Thickness of wire (thick wire has less resistance)
- Temperature.

Q2: Rusting of Iron
Rusting happens when iron is kept in open air with rain. It gets orange rust coating.
Iron + Oxygen + Water -> Rust.
Prevention:
- Painting windows and gates.
- Putting oil.

Q3: Neutralization Reaction
When acid and base mix together they cancel each other and make salt and water.
HCl + NaOH -> NaCl + H2O.
Antacids are taken for acidity because they are basic and stop stomach burning.`,
    diagramType: null,
    inkColor: '#0f172a',
    slant: -2.0
  },
  {
    id: 'sample-11',
    studentName: 'Ananya Sen',
    rollNo: 'CBSE-10-201',
    subject: 'CBSE Social Science: History & Civics',
    questionId: 'preset-cbse-humanities-10',
    questionTitle: 'CBSE Class 10 Social Science: History & Civics (15 Marks)',
    maxScore: 15.0,
    expectedScore: 13.75,
    description: 'High-Scoring Humanities Paper (13.75/15): Well structured causes of 1857 Revolt and comprehensive 6 Fundamental Rights.',
    rawText: `Ans Sheet: Class 10 Social Science - Ananya Sen (Roll: CBSE-10-201)

Q1: Causes of the Revolt of 1857 (First War of Indian Independence)
1. Political Causes:
- Lord Dalhousie's aggressive 'Doctrine of Lapse' annexed Indian kingdoms like Jhansi, Satara, and Nagpur without natural heirs.
- Annexation of Awadh on grounds of misgovernance insulted the Nawab and outraged local soldiers.
2. Economic Causes:
- British introduced heavy land revenue systems (Zamindari/Ryotwari) ruining Indian peasants.
- Cheap British machine goods destroyed traditional Indian weavers and handicraftsmen.
3. Immediate Cause:
- Introduction of the new Enfield rifle. Sepoys believed the cartridge grease contained cow and pig fat, offending Hindu and Muslim religious beliefs. Mangal Pandey revolted at Barrackpore in March 1857.

Q2: Six Fundamental Rights of Indian Citizens (Constitution of India)
Guaranteed under Part III of the Constitution:
1. Right to Equality (Articles 14-18): Equality before law and prohibition of discrimination on grounds of religion, race, caste, sex.
2. Right to Freedom (Articles 19-22): Freedom of speech, peaceful assembly, forming associations, and movement.
3. Right against Exploitation (Articles 23-24): Prohibits human trafficking, forced labor (begar), and child labor in hazardous factories.
4. Right to Freedom of Religion (Articles 25-28): Freedom of conscience and practice/propagation of any religion.
5. Cultural and Educational Rights (Articles 29-30): Protection of minority language and script.
6. Right to Constitutional Remedies (Article 32): Allows citizens to move Supreme Court/High Court through writs if rights are violated. Dr. B.R. Ambedkar called Article 32 the 'Heart and Soul of the Constitution'.

Q3: Formal vs Informal Sources of Credit in India
- Formal Sources: Commercial banks and cooperative societies. Supervised strictly by Reserve Bank of India (RBI), charging lower reasonable interest rates.
- Informal Sources: Local moneylenders, traders, landlords, and relatives. Unregulated with zero supervision, charging exorbitant interest rates.
Why rural poor depend on informal lenders:
- Commercial banks demand collateral (land papers, jewelry) and formal documents which poor rural farmers do not possess.
- Banks are scarce in remote rural villages, while local moneylenders are approachable anytime without paperwork.`,
    diagramType: null,
    inkColor: '#1d4ed8',
    slant: -1.0
  },
  {
    id: 'sample-messy-cbse-vikram',
    studentName: 'Vikram Malhotra',
    rollNo: 'CBSE-10-103',
    subject: 'CBSE Class 10 Science: Physics & Chemistry',
    questionId: 'preset-cbse-science-10',
    questionTitle: 'CBSE Class 10 Science: Physics & Chemistry (15 Marks)',
    category: 'cbse',
    isMessy: true,
    tag: '🔥 Rushed Term Exam',
    fontFamily: "'Kalam', cursive",
    headerType: 'cbse',
    slant: -3.0,
    maxScore: 15.0,
    expectedScore: 13.50,
    description: '🔥 Rushed Mid-Term (CBSE 10): Authentic exam speed, strikethrough formula correction, caret insertions.',
    rawText: `Ans Sheet: CBSE Class 10 Annual Exam - Vikram Malhotra (Roll: CBSE-10-103)

Q1: Ohm's Law and Resistance of a Conductor
Ohm's Law: At constant temp, current I is proportional to Voltage V (V = I * R).
Factors affecting resistance:
1. Length: Resistance increases with length of wire (R ∝ L).
2. Area of cross section: ~~R ∝ A~~
   ^ R ∝ 1/A (thick wire has LESS resistance, thin wire has more)
3. Formula: ~~R = rho * (A / L)~~
   ^ R = ρ * (L / A) where ρ = resistivity of material.
4. Temperature: R increases with rise in temperature for metals.

Q2: Rusting of Iron (Corrosion)
Rusting is slow chemical reaction forming reddish brown powder.
~~Rusting happens in dry air alone~~
   ^ Rusting requires BOTH Oxygen (O2) and Water/moisture (H2O)!
Chemical Reaction:
4Fe(s) + 3O2(g) + 2xH2O(l) -> 2Fe2O3.xH2O (Hydrated ferric oxide / rust)
Prevention:
1. Galvanisation: Coating zinc layer on iron sheets.
2. Painting: Applying oil paint to stop contact with air & rain.

Q3: Neutralization Reaction & Antacids
When acid reacts with base to form salt and water.
HCl + NaOH -> NaCl + H2O
Antacids: Stomach produces excess HCl causing burning pain & acidity.
Antacids are mild basic substances like Milk of Magnesia [Mg(OH)2].
They neutralize the extra acid giving fast relief.`,
    inkColor: '#1e40af'
  },
  {
    id: 'sample-messy-cs-devika',
    studentName: 'Devika Sengupta',
    rollNo: 'CS-2026-004',
    subject: 'Computer Science & AI Master Paper',
    questionId: 'preset-multi-cs-exam',
    questionTitle: 'CS & AI Master Examination (5 Questions, 25 Marks)',
    category: 'cs',
    isMessy: true,
    tag: '✏️ Hurried Pencil & Gel',
    fontFamily: "'Reenie Beanie', cursive",
    headerType: 'cs_finals',
    slant: -1.2,
    maxScore: 25.0,
    expectedScore: 21.50,
    description: '✏️ Hurried Pencil & Gel (CS Finals): Fast derivations, scratched-out complexity error, margin arrow.',
    rawText: `Ans Sheet: CS & AI Master Exam - Devika Sengupta (Roll: CS-2026-004)

Q1: Backpropagation in Deep Neural Networks
Forward pass computes layer activations z = W*x + b and prediction y_hat.
Loss L is computed against target y using MSE or Cross-Entropy loss.
Backward pass computes gradients via calculus chain rule:
dL/dW = (dL/da) * (da/dz) * (dz/dW) where dz/dW = x.
Weight update: W = W - eta * (dL/dW). Gradients flow back layer by layer.

Q2: Time & Space Complexity: QuickSort vs MergeSort
1. MergeSort: Divide & conquer algorithm.
   - Best/Avg/Worst Time: O(N log N) in all cases.
   - Space: O(N) auxiliary buffer for merging subarrays.
2. QuickSort: Partitioning around chosen pivot element.
   - Average Time: O(N log N).
   - ~~Worst Time: O(N log N)~~
     ^ Worst Time: O(N^2) when array sorted and bad pivot chosen!
   - Space: O(log N) recursion call stack (in-place).

Q3: ACID Properties in RDBMS
- Atomicity: All or nothing transaction. If query fails, rollback completely.
- Consistency: Database transitions between valid states adhering to FK schema.
- Isolation: Concurrent sessions run independently without dirty reads.
- Durability: Committed updates written to non-volatile WAL log.

Q4: Object-Oriented Programming (OOP) Principles
1. Encapsulation: Bundling data and methods, private fields with getters/setters.
2. Abstraction: Hiding implementation details via interfaces & abstract classes.
3. Inheritance: Subclass inherits behavior and fields from superclass.
4. Polymorphism: Method overriding at runtime and overloading at compile-time.

Q5: RSA Public Key Cryptography
Select large primes p, q. Modulus n = p*q. Euler phi(n) = (p-1)*(q-1).
Public key exponent e coprime to phi(n).
Private key d: ~~e * d = 0 mod phi~~
   ^ e * d ≡ 1 mod phi(n).
Encryption: c = m^e mod n (using public key (e,n)).
Decryption: m = c^d mod n (using private key (d,n)).`,
    inkColor: '#374151'
  },
  {
    id: 'sample-messy-anatomy-arjun',
    studentName: 'Arjun Ramaswamy',
    rollNo: 'MED-2024-006',
    subject: 'Human Anatomy - Upper Limb & Axilla',
    questionId: 'preset-brachial-plexus',
    questionTitle: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
    category: 'med',
    isMessy: true,
    tag: '⚠️ Last 15-Min Rush',
    fontFamily: "'Shadows Into Light', cursive",
    headerType: 'medical',
    slant: -3.8,
    maxScore: 5.0,
    expectedScore: 4.50,
    description: '⚠️ Last 15-Min Rush: Fast angular handwriting, heavy scribbles over wrong nerve roots, hurried abbreviations.',
    rawText: `Ans Sheet: Anatomy Paper I - Arjun Ramaswamy (Roll: MED-2024-006)

Q: Describe Boundaries of Axilla & Nerve Relations
Axilla is a pyramid shaped space between upper thorax and arm.
Boundaries:
1. Anterior wall: Pectoralis major, Pectoralis minor, Subclavius muscle.
2. Posterior wall: Subscapularis, Latissimus dorsi, Teres major.
   ~~Posterior cord gives ulnar nerve~~
   ^ Post cord gives Radial & Axillary nerves! (Ulnar is medial cord)
3. Medial wall: Upper 4 ribs with intercostal muscles, Serratus anterior.
4. Lateral wall: Very narrow! Intertubercular sulcus of humerus,
   Coracobrachialis, Short head of biceps brachii.
5. Apex (Cervico-axillary canal): Clavicle ant., 1st rib medially, Scapula post.
   Base: Axillary fascia and skin of armpit concavity.

Applied Anatomy:
- Axillary abscess: Drain by incision through floor/base avoiding axillary vessels.
- Axillary lymph node dissection in breast cancer clearance.`,
    inkColor: '#111827'
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
    fontFamily: sample.fontFamily,
    headerType: sample.headerType,
    slant: sample.slant || -2.5
  });
  
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

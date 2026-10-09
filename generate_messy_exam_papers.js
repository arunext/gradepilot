import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outputDir = path.join(process.cwd(), 'messy_exam_papers');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to escape XML
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

// Generate Realistic SVG for Messy Term Exam Paper
function generateRealisticMessySvg({
  studentName,
  rollNo,
  subject,
  examHeader,
  fontFamily,
  inkColor,
  slant = -2.5,
  lines,
  stampText = 'EXAM CONTROLLER - VERIFIED'
}) {
  const lineSpacing = 34;
  const startY = 190;
  const totalHeight = Math.max(980, startY + lines.length * lineSpacing + 180);

  // Ruled horizontal lines
  let ruledLinesSvg = '';
  for (let y = 140; y < totalHeight - 40; y += lineSpacing) {
    ruledLinesSvg += `<line x1="80" y1="${y}" x2="740" y2="${y}" stroke="#cbd5e1" stroke-width="1"/>`;
  }

  // Handwritten text rendering with strikethroughs, scribbles, and caret insertions
  let textSvg = '';
  lines.forEach((rawLine, idx) => {
    const y = startY + idx * lineSpacing;
    const isHeader = rawLine.startsWith('Ans') || rawLine.startsWith('Q.') || rawLine.startsWith('Q1') || rawLine.startsWith('Q2') || rawLine.startsWith('Q3') || rawLine.startsWith('Q4') || rawLine.startsWith('Q5');
    
    // Check if caret insertion
    const isCaret = rawLine.trim().startsWith('^');
    const isScratchOnly = rawLine.includes('[SCRATCH') || rawLine.includes('[wrong');
    
    // Slant & dy jitter
    const organicSlant = slant + Math.sin(idx * 0.9) * 0.8;
    const randomDy = Math.sin(idx * 2.3) * 2.2;
    const xBase = rawLine.startsWith('  -') ? 140 : rawLine.startsWith('  ') ? 120 : isCaret ? 130 : 100;
    const fontSize = isHeader ? 18 : isCaret ? 14.5 : 16;
    const fontWeight = isHeader ? '700' : '500';

    // Parse strikethroughs ~~...~~
    let lineContent = rawLine;
    let strikethroughSvg = '';

    const strikeMatch = lineContent.match(/~~([^~]+)~~/);
    if (strikeMatch) {
      const strikeText = strikeMatch[1];
      const strikeIndex = lineContent.indexOf('~~');
      const textBefore = lineContent.substring(0, strikeIndex);
      const approxXBefore = xBase + textBefore.length * 8.5;
      const strikeWidth = Math.max(45, strikeText.length * 9.5);

      // Realistic ink scratch-out scribble over the text
      strikethroughSvg = `
        <g opacity="0.9">
          <!-- Heavy wavy scratch lines -->
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
      // Replace ~~...~~ with clean text for rendering underneath
      lineContent = lineContent.replace(/~~([^~]+)~~/, '$1');
    }

    if (isCaret) {
      // Caret symbol insertion
      const caretY = y + randomDy - 10;
      textSvg += `
        <g transform="rotate(${organicSlant}, ${xBase}, ${y})">
          <path d="M ${xBase - 15} ${caretY + 8} L ${xBase - 8} ${caretY - 2} L ${xBase - 1} ${caretY + 8}" stroke="${inkColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <text x="${xBase}" y="${caretY}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${inkColor}" letter-spacing="0.3">
            ${escapeXml(lineContent.replace(/^\^\s*/, ''))}
          </text>
        </g>
      `;
    } else {
      textSvg += `
        <g transform="rotate(${organicSlant}, ${xBase}, ${y})">
          <text x="${xBase}" y="${y + randomDy}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${inkColor}" letter-spacing="0.3">
            ${escapeXml(lineContent)}
          </text>
          ${strikethroughSvg}
        </g>
      `;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalHeight}" width="100%" height="100%">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&amp;family=Kalam:wght@400;700&amp;family=Reenie+Beanie&amp;family=Shadows+Into+Light&amp;family=Inter:wght@400;600;700;800&amp;display=swap');
        </style>
        <linearGradient id="paper-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.05"/>
          <stop offset="2%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="98%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.06"/>
        </linearGradient>
      </defs>

      <!-- Paper background -->
      <rect width="800" height="${totalHeight}" fill="#fffdfa"/>
      <rect width="800" height="${totalHeight}" fill="url(#paper-shadow)"/>

      <!-- Red vertical margin line -->
      <line x1="80" y1="0" x2="80" y2="${totalHeight}" stroke="#f87171" stroke-width="1.8"/>
      <line x1="83" y1="0" x2="83" y2="${totalHeight}" stroke="#f87171" stroke-width="0.8" opacity="0.6"/>

      <!-- Top Header Ruled Line -->
      <line x1="0" y1="130" x2="800" y2="130" stroke="#94a3b8" stroke-width="1.5"/>

      <!-- Exam Header Block -->
      <g transform="translate(100, 26)">
        <text x="0" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#0f172a" letter-spacing="1">${escapeXml(examHeader)}</text>
        <text x="0" y="42" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Subject: <tspan font-weight="600" fill="#1e293b">${escapeXml(subject)}</tspan></text>
        <text x="0" y="64" font-family="'Inter', sans-serif" font-size="12" fill="#475569">Student: <tspan font-weight="600" fill="#1e293b">${escapeXml(studentName)}</tspan> | Roll: <tspan font-weight="700" fill="#00a991">${escapeXml(rollNo)}</tspan></text>
        <text x="0" y="86" font-family="'Inter', sans-serif" font-size="12" fill="#64748b">Exam Date: Term Finals 2026 | Max Time: 3 Hours</text>

        <!-- Official Stamp -->
        <circle cx="560" cy="42" r="32" stroke="#dc2626" stroke-width="1.5" fill="none" stroke-dasharray="3,2" transform="rotate(-10, 560, 42)"/>
        <text x="528" y="39" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">TERM EXAM 2026</text>
        <text x="532" y="50" font-family="'Inter', sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" transform="rotate(-10, 560, 42)">VERIFIED COPY</text>
      </g>

      <!-- Ruled horizontal notebook lines -->
      ${ruledLinesSvg}

      <!-- Handwritten text with strikethroughs & insertions -->
      ${textSvg}
    </svg>
  `;
}

// HTML wrapper for standalone viewing and Chrome printing
function generateHtmlPage({ title, svgContent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Kalam:wght@400;700&family=Reenie+Beanie&family=Shadows+Into+Light&family=Inter:wght@400;600;700;800&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }

    .sheet-wrapper {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      margin: 20px 0;
      box-sizing: border-box;
      overflow: hidden;
    }

    @media print {
      body {
        background: transparent;
      }
      .sheet-wrapper {
        box-shadow: none;
        margin: 0;
        width: 100%;
        min-height: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="sheet-wrapper">
    ${svgContent}
  </div>
</body>
</html>`;
}

// 3 Realistic Messy Exam Papers
const PAPERS = [
  {
    fileName: '01_vikram_malhotra_cbse_rushed',
    title: 'Vikram Malhotra — CBSE Class 10 Science (Rushed Mid-Term with Strikethroughs)',
    studentName: 'Vikram Malhotra',
    rollNo: 'CBSE-10-103',
    subject: 'CBSE Class 10 Science: Physics & Chemistry',
    examHeader: 'CENTRAL BOARD OF SECONDARY EDUCATION (CBSE) — TERM II',
    fontFamily: "'Kalam', cursive",
    inkColor: '#1e40af', // classic blue ballpoint
    slant: -3.0,
    lines: [
      'Ans Sheet: CBSE Class 10 Annual Exam - Vikram Malhotra (Roll: CBSE-10-103)',
      '',
      'Q1: Ohm\'s Law and Resistance of a Conductor',
      'Ohm\'s Law: At constant temp, current I is proportional to Voltage V (V = I * R).',
      'Factors affecting resistance:',
      '1. Length: Resistance increases with length of wire (R ∝ L).',
      '2. Area of cross section: ~~R ∝ A~~',
      '   ^ R ∝ 1/A (thick wire has LESS resistance, thin wire has more)',
      '3. Formula: ~~R = rho * (A / L)~~',
      '   ^ R = ρ * (L / A) where ρ = resistivity of material.',
      '4. Temperature: R increases with rise in temperature for metals.',
      '',
      'Q2: Rusting of Iron (Corrosion)',
      'Rusting is slow chemical reaction forming reddish brown powder.',
      '~~Rusting happens in dry air alone~~',
      '   ^ Rusting requires BOTH Oxygen (O2) and Water/moisture (H2O)!',
      'Chemical Reaction:',
      '4Fe(s) + 3O2(g) + 2xH2O(l) -> 2Fe2O3.xH2O (Hydrated ferric oxide / rust)',
      'Prevention:',
      '1. Galvanisation: Coating zinc layer on iron sheets.',
      '2. Painting: Applying oil paint to stop contact with air & rain.',
      '',
      'Q3: Neutralization Reaction & Antacids',
      'When acid reacts with base to form salt and water.',
      'HCl + NaOH -> NaCl + H2O',
      'Antacids: Stomach produces excess HCl causing burning pain & acidity.',
      'Antacids are mild basic substances like Milk of Magnesia [Mg(OH)2].',
      'They neutralize the extra acid giving fast relief.'
    ]
  },
  {
    fileName: '02_devika_sengupta_cs_ai_hurried',
    title: 'Devika Sengupta — CS & AI Master Exam (Hurried Pencil & Gel with Fast Derivations)',
    studentName: 'Devika Sengupta',
    rollNo: 'CS-2026-004',
    subject: 'Computer Science & AI Master Paper',
    examHeader: 'DEPARTMENT OF COMPUTER SCIENCE & ENGG — SEMESTER FINALS',
    fontFamily: "'Reenie Beanie', cursive",
    inkColor: '#374151', // graphite pencil / dark grey gel
    slant: -1.2,
    lines: [
      'Ans Sheet: CS & AI Master Exam - Devika Sengupta (Roll: CS-2026-004)',
      '',
      'Q1: Backpropagation in Deep Neural Networks',
      'Forward pass computes layer activations z = W*x + b and prediction y_hat.',
      'Loss L is computed against target y using MSE or Cross-Entropy loss.',
      'Backward pass computes gradients via calculus chain rule:',
      'dL/dW = (dL/da) * (da/dz) * (dz/dW) where dz/dW = x.',
      'Weight update: W = W - eta * (dL/dW). Gradients flow back layer by layer.',
      '',
      'Q2: Time & Space Complexity: QuickSort vs MergeSort',
      '1. MergeSort: Divide & conquer algorithm.',
      '   - Best/Avg/Worst Time: O(N log N) in all cases.',
      '   - Space: O(N) auxiliary buffer for merging subarrays.',
      '2. QuickSort: Partitioning around chosen pivot element.',
      '   - Average Time: O(N log N).',
      '   - ~~Worst Time: O(N log N)~~',
      '     ^ Worst Time: O(N^2) when array sorted and bad pivot chosen!',
      '   - Space: O(log N) recursion call stack (in-place).',
      '',
      'Q3: ACID Properties in RDBMS',
      '- Atomicity: All or nothing transaction. If query fails, rollback completely.',
      '- Consistency: Database transitions between valid states adhering to FK schema.',
      '- Isolation: Concurrent sessions run independently without dirty reads.',
      '- Durability: Committed updates written to non-volatile WAL log.',
      '',
      'Q4: Object-Oriented Programming (OOP) Principles',
      '1. Encapsulation: Bundling data and methods, private fields with getters/setters.',
      '2. Abstraction: Hiding implementation details via interfaces & abstract classes.',
      '3. Inheritance: Subclass inherits behavior and fields from superclass.',
      '4. Polymorphism: Method overriding at runtime and overloading at compile-time.',
      '',
      'Q5: RSA Public Key Cryptography',
      'Select large primes p, q. Modulus n = p*q. Euler phi(n) = (p-1)*(q-1).',
      'Public key exponent e coprime to phi(n).',
      'Private key d: ~~e * d = 0 mod phi~~',
      '   ^ e * d ≡ 1 mod phi(n).',
      'Encryption: c = m^e mod n (using public key (e,n)).',
      'Decryption: m = c^d mod n (using private key (d,n)).'
    ]
  },
  {
    fileName: '03_arjun_ramaswamy_anatomy_panic',
    title: 'Arjun Ramaswamy — Human Anatomy (Last 15-Minute Rush with Scribbles)',
    studentName: 'Arjun Ramaswamy',
    rollNo: 'MED-2024-006',
    subject: 'Human Anatomy - Upper Limb & Axilla',
    examHeader: 'FACULTY OF MEDICINE — UNIVERSITY PROFESSIONAL EXAMINATION',
    fontFamily: "'Shadows Into Light', cursive",
    inkColor: '#111827', // black micro-tip rapid scrawl
    slant: -3.8,
    lines: [
      'Ans Sheet: Anatomy Paper I - Arjun Ramaswamy (Roll: MED-2024-006)',
      '',
      'Q: Describe Boundaries of Axilla & Nerve Relations',
      'Axilla is a pyramid shaped space between upper thorax and arm.',
      'Boundaries:',
      '1. Anterior wall: Pectoralis major, Pectoralis minor, Subclavius muscle.',
      '2. Posterior wall: Subscapularis, Latissimus dorsi, Teres major.',
      '   ~~Posterior cord gives ulnar nerve~~',
      '   ^ Post cord gives Radial & Axillary nerves! (Ulnar is medial cord)',
      '3. Medial wall: Upper 4 ribs with intercostal muscles, Serratus anterior.',
      '4. Lateral wall: Very narrow! Intertubercular sulcus of humerus,',
      '   Coracobrachialis, Short head of biceps brachii.',
      '5. Apex (Cervico-axillary canal): Clavicle ant., 1st rib medially, Scapula post.',
      '   Base: Axillary fascia and skin of armpit concavity.',
      '',
      'Applied Anatomy:',
      '- Axillary abscess: Drain by incision through floor/base avoiding axillary vessels.',
      '- Axillary lymph node dissection in breast cancer clearance.'
    ]
  }
];

// Write files
console.log('Generating Realistic Messy Exam Papers...');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

PAPERS.forEach(paper => {
  const svg = generateRealisticMessySvg(paper);
  const svgPath = path.join(outputDir, `${paper.fileName}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log(`Saved SVG: ${svgPath}`);

  const html = generateHtmlPage({ title: paper.title, svgContent: svg });
  const htmlPath = path.join(outputDir, `${paper.fileName}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`Saved HTML: ${htmlPath}`);

  const pdfPath = path.join(outputDir, `${paper.fileName}.pdf`);
  const cmd = `"${chromePath}" --headless=new --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`Rendered PDF: ${pdfPath}`);
  } catch (err) {
    console.warn(`PDF generation note for ${paper.fileName}:`, err.message);
  }
});

// Write README in folder
const readmePath = path.join(outputDir, 'README.md');
const readmeContent = `# Realistic Messy Student Exam Papers Test Suite

This folder contains authentic test papers demonstrating GradeCrow's multimodal OCR on hurried term-exam handwriting with realistic student errors, cross-outs, and corrections.

## Test Papers Included

1. **01_vikram_malhotra_cbse_rushed** (\`.html\`, \`.svg\`, \`.pdf\`)
   - **Student**: Vikram Malhotra (Roll: \`CBSE-10-103\`)
   - **Subject**: CBSE Class 10 Science (Physics & Chemistry)
   - **Handwriting Style**: Indian student cursive (Google Font: *Kalam*) in blue ballpoint ink (\`#1e40af\`).
   - **Messy Elements**:
     - Scribbled out inverted resistance formula: \`~~R ∝ A~~ -> R ∝ 1/A\`
     - Crossed-out formula: \`~~R = rho * (A / L)~~ -> R = ρ * (L / A)\`
     - Caret insertion: \`^ Rusting requires BOTH Oxygen (O2) and Water/moisture (H2O)!\`
   - **Ground Truth**: High-scoring paper (13.5 / 15.0) despite hurried scribbles.

2. **02_devika_sengupta_cs_ai_hurried** (\`.html\`, \`.svg\`, \`.pdf\`)
   - **Student**: Devika Sengupta (Roll: \`CS-2026-004\`)
   - **Subject**: Computer Science & AI Master Paper
   - **Handwriting Style**: Thin, fast pencil scrawl (Google Font: *Reenie Beanie*) in graphite grey (\`#374151\`).
   - **Messy Elements**:
     - QuickSort worst-case strikethrough: \`~~Worst Time: O(N log N)~~ -> O(N^2)\`
     - Modular inverse scribble: \`~~e * d = 0 mod phi~~ -> e * d ≡ 1 mod phi(n)\`
     - Fast calculus notation and derivation lines.
   - **Ground Truth**: Solid derivation (21.5 / 25.0).

3. **03_arjun_ramaswamy_anatomy_panic** (\`.html\`, \`.svg\`, \`.pdf\`)
   - **Student**: Arjun Ramaswamy (Roll: \`MED-2024-006\`)
   - **Subject**: Human Anatomy - Upper Limb & Axilla
   - **Handwriting Style**: Angular rush (Google Font: *Shadows Into Light*) in black rapid gel ink (\`#111827\`).
   - **Messy Elements**:
     - Scratched out nerve root cords: \`~~Posterior cord gives ulnar nerve~~ -> Post cord gives Radial & Axillary nerves!\`
     - Hurried bullet points and anatomical abbreviations.
   - **Ground Truth**: 4.5 / 5.0.

## How to Test

- **Print & Scan**: Print any of the \`.pdf\` files on A4 paper and test the Hands-Free Auto-Scan camera mode on your smartphone!
- **Upload**: Upload the \`.pdf\` or \`.svg\` directly in GradeCrow.
- **In-App Demo**: These papers are also available under the "Try Demo Paper" drawer with the \`🔥 Rushed Term Exam\` badge.
`;

fs.writeFileSync(readmePath, readmeContent, 'utf8');
console.log(`Saved README: ${readmePath}`);
console.log('Done generating all realistic test papers!');

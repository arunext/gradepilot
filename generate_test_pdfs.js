import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outputDir = path.join(process.cwd(), 'test_pdfs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Question Paper & Key Page HTML Template
const questionPaperHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CS & AI Master Exam - Question Paper & Rubric Key Page</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }

    .exam-header {
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .university-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #0f172a;
    }

    .exam-meta {
      font-size: 13px;
      color: #475569;
      margin-top: 4px;
    }

    .marks-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      color: #0f766e;
      text-align: right;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: #00a991;
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 4px;
      margin-top: 20px;
      margin-bottom: 14px;
    }

    .question-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      background: #fafafa;
      page-break-inside: avoid;
    }

    .q-header {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .q-title {
      font-weight: 700;
      color: #0f172a;
    }

    .q-marks {
      color: #00a991;
      font-weight: 700;
    }

    .rubric-list {
      margin-top: 10px;
      padding-left: 0;
      list-style: none;
    }

    .rubric-item {
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 6px;
      font-size: 12.5px;
    }

    .rubric-weight {
      font-weight: 700;
      color: #2563eb;
    }

    .keywords-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: #f1f5f9;
      color: #475569;
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 4px;
    }

    .watermark-footer {
      margin-top: 30px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
  </style>
</head>
<body>

  <div class="exam-header">
    <div>
      <div class="university-title">Faculty of Computer Science & Artificial Intelligence</div>
      <div class="exam-meta">
        <strong>Subject:</strong> Computer Science & AI Master Paper (CS-501)<br>
        <strong>Examination:</strong> Internal Master Assessment | <strong>Duration:</strong> 60 Mins
      </div>
    </div>
    <div class="marks-badge">
      Total Questions: 5<br>
      Max Marks: 25.0
    </div>
  </div>

  <div class="section-title">Official Answer Key & Grading Rubric Specifications</div>

  <!-- Q1 -->
  <div class="question-card">
    <div class="q-header">
      <span class="q-title">Q1: Explain the mathematical concept of Backpropagation in Deep Neural Networks and state the chain rule formula.</span>
      <span class="q-marks">[5.0 Marks]</span>
    </div>
    <ul class="rubric-list">
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 1:</strong> Forward pass computes loss L; backward pass calculates partial derivatives dL/dw propagating error gradient back layer by layer.
        <br><span class="keywords-tag">Keywords: forward pass, loss, backward pass, gradient, partial derivative</span>
      </li>
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 2:</strong> Chain rule application dL/dw = (dL/da)*(da/dz)*(dz/dw) and gradient descent weight update w = w - eta*(dL/dw).
        <br><span class="keywords-tag">Keywords: chain rule, gradient descent, learning rate, eta, weight update</span>
      </li>
    </ul>
  </div>

  <!-- Q2 -->
  <div class="question-card">
    <div class="q-header">
      <span class="q-title">Q2: Analyze the average and worst-case time and space complexity of QuickSort vs MergeSort.</span>
      <span class="q-marks">[5.0 Marks]</span>
    </div>
    <ul class="rubric-list">
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 1:</strong> MergeSort: Average & Worst Time O(N log N), Space O(N) for merge buffer sub-arrays.
        <br><span class="keywords-tag">Keywords: mergesort, n log n, space o(n), divide and conquer</span>
      </li>
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 2:</strong> QuickSort: Average Time O(N log N), Worst Time O(N^2) for poor pivot selection, Space O(log N) recursion stack.
        <br><span class="keywords-tag">Keywords: quicksort, pivot, o(n^2), worst case, recursion stack</span>
      </li>
    </ul>
  </div>

  <!-- Q3 -->
  <div class="question-card">
    <div class="q-header">
      <span class="q-title">Q3: Define the ACID properties in Relational Database Management Systems (RDBMS).</span>
      <span class="q-marks">[5.0 Marks]</span>
    </div>
    <ul class="rubric-list">
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 1:</strong> Atomicity & Consistency: All-or-nothing transaction execution; maintains valid state and constraints.
        <br><span class="keywords-tag">Keywords: atomicity, all or nothing, consistency, valid state, rollback</span>
      </li>
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 2:</strong> Isolation & Durability: Concurrent transactions execute independently (locking/MVCC); committed data persists in non-volatile WAL.
        <br><span class="keywords-tag">Keywords: isolation, durability, concurrency, locks, committed, wal</span>
      </li>
    </ul>
  </div>

  <!-- Q4 -->
  <div class="question-card">
    <div class="q-header">
      <span class="q-title">Q4: Explain the four core Object-Oriented Programming (OOP) principles with clear definitions.</span>
      <span class="q-marks">[5.0 Marks]</span>
    </div>
    <ul class="rubric-list">
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 1:</strong> Encapsulation & Abstraction: Hiding internal state behind private access modifiers; exposing public interfaces.
        <br><span class="keywords-tag">Keywords: encapsulation, abstraction, private, interface, hiding</span>
      </li>
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 2:</strong> Inheritance & Polymorphism: Subclassing parent classes; method overriding/overloading allowing dynamic dispatch.
        <br><span class="keywords-tag">Keywords: inheritance, polymorphism, overriding, overloading, subclass</span>
      </li>
    </ul>
  </div>

  <!-- Q5 -->
  <div class="question-card">
    <div class="q-header">
      <span class="q-title">Q5: Describe RSA Public Key Cryptography and explain how asymmetric key pairs enable secure communication.</span>
      <span class="q-marks">[5.0 Marks]</span>
    </div>
    <ul class="rubric-list">
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 1:</strong> Key Generation: Prime selection p, q; modulus n = p*q, totient phi(n); public key (e,n), private key (d,n).
        <br><span class="keywords-tag">Keywords: rsa, prime, public key, private key, totient, modulo</span>
      </li>
      <li class="rubric-item">
        <span class="rubric-weight">[2.5 Marks]</span> <strong>Criterion 2:</strong> Encryption & Decryption: Ciphertext c = m^e mod n and plaintext recovery m = c^d mod n.
        <br><span class="keywords-tag">Keywords: ciphertext, plaintext, encryption, decryption, m^e mod n</span>
      </li>
    </ul>
  </div>

  <div class="watermark-footer">
    GradePilot AI Exam Platform — Master Key Page & Question Paper Specification (CS-501)
  </div>

</body>
</html>`;

// Helper to generate Student Handwritten Answer Sheet HTML
function generateStudentPaperHtml({ studentName, rollNo, expectedScore, inkColor, slant, rawText }) {
  const lines = rawText.split('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Student Answer Sheet - ${studentName} (${rollNo})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;600;700&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Caveat', 'Comic Sans MS', cursive, sans-serif;
      background: #fffdfa;
      color: ${inkColor};
      margin: 0;
      padding: 0;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    .paper-page {
      width: 210mm;
      min-height: 297mm;
      box-sizing: border-box;
      position: relative;
      padding: 45mm 15mm 20mm 30mm; /* Extra left margin for red vertical line */
      background: #fffdfa;
    }

    /* Red vertical left margin line */
    .margin-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 25mm;
      width: 1.5px;
      background: #f87171;
    }

    .margin-line-secondary {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 26.5mm;
      width: 0.8px;
      background: rgba(248, 113, 113, 0.4);
    }

    /* Ruled notebook horizontal lines */
    .ruled-bg {
      position: absolute;
      top: 40mm;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: repeating-linear-gradient(#fffdfa, #fffdfa 9.5mm, #cbd5e1 9.5mm, #cbd5e1 9.8mm);
      z-index: 1;
    }

    .paper-header {
      position: absolute;
      top: 10mm;
      left: 30mm;
      right: 15mm;
      z-index: 10;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      border-bottom: 2px solid #334155;
      padding-bottom: 8px;
    }

    .school-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #0f172a;
    }

    .header-details {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      margin-top: 4px;
      color: #475569;
    }

    .student-badge {
      font-weight: 700;
      color: #0f766e;
    }

    .expected-badge {
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .content-body {
      position: relative;
      z-index: 5;
      margin-top: 5mm;
      font-size: 20px;
      line-height: 9.8mm; /* Exactly match ruled lines spacing */
      letter-spacing: 0.3px;
      transform: rotate(${slant}deg);
    }

    .line-item {
      min-height: 9.8mm;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .line-header {
      font-weight: 700;
      font-size: 22px;
      text-decoration: underline;
      margin-top: 4mm;
    }

    .line-indent {
      padding-left: 20px;
    }
  </style>
</head>
<body>

  <div class="margin-line"></div>
  <div class="margin-line-secondary"></div>
  <div class="ruled-bg"></div>

  <div class="paper-page">
    
    <div class="paper-header">
      <div class="school-title">FACULTY OF COMPUTER SCIENCE & AI - INTERNAL ASSESSMENT</div>
      <div class="header-details">
        <div>
          Student: <strong class="student-badge">${studentName}</strong> | Roll No: <strong class="student-badge">${rollNo}</strong><br>
          Subject: <strong>CS & AI Master Paper (CS-501)</strong>
        </div>
        <div style="text-align: right;">
          Date: 04-Oct-2026<br>
          <span class="expected-badge">Target Score: ${expectedScore} / 25.0</span>
        </div>
      </div>
    </div>

    <div class="content-body">
      ${lines.map((l) => {
        const isHead = l.startsWith('Ans') || l.startsWith('Q1') || l.startsWith('Q2') || l.startsWith('Q3') || l.startsWith('Q4') || l.startsWith('Q5');
        const isInd = l.startsWith('-') || l.startsWith('1.') || l.startsWith('2.') || l.startsWith('3.') || l.startsWith('4.');
        return `<div class="line-item ${isHead ? 'line-header' : ''} ${isInd ? 'line-indent' : ''}">${escapeHtml(l)}</div>`;
      }).join('')}
    </div>

  </div>

</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Data definitions for the 3 student papers
const studentPapers = [
  {
    fileName: 'Student_Paper_1_Aarav_Patel_HighScoring',
    studentName: 'Aarav Patel',
    rollNo: 'CS-2026-001',
    expectedScore: '24.25',
    inkColor: '#1d4ed8',
    slant: -0.4,
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
Asymmetric mechanics allow sender to encrypt with public key without knowing private secret.`
  },
  {
    fileName: 'Student_Paper_2_Priya_Nair_Average',
    studentName: 'Priya Nair',
    rollNo: 'CS-2026-002',
    expectedScore: '16.50',
    inkColor: '#0f172a',
    slant: -0.6,
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
Uses prime numbers p and q to create large modulus n.`
  },
  {
    fileName: 'Student_Paper_3_Rohan_Gupta_LowScoring',
    studentName: 'Rohan Gupta',
    rollNo: 'CS-2026-003',
    expectedScore: '8.75',
    inkColor: '#334155',
    slant: -1.0,
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
Messages are encrypted with key so hackers cannot read packets.`
  }
];

// Write HTML files
const qpHtmlPath = path.join(outputDir, 'CS_AI_Master_Exam_Question_Paper.html');
fs.writeFileSync(qpHtmlPath, questionPaperHtml);
console.log(`Wrote ${qpHtmlPath}`);

const generatedHtmlFiles = [{ htmlPath: qpHtmlPath, pdfName: 'CS_AI_Master_Exam_Question_Paper_and_Rubric_Key.pdf' }];

studentPapers.forEach(sp => {
  const htmlContent = generateStudentPaperHtml(sp);
  const hPath = path.join(outputDir, `${sp.fileName}.html`);
  fs.writeFileSync(hPath, htmlContent);
  console.log(`Wrote ${hPath}`);
  generatedHtmlFiles.push({ htmlPath: hPath, pdfName: `${sp.fileName}.pdf` });
});

// Render PDFs using Chrome Headless
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

generatedHtmlFiles.forEach(item => {
  const pdfPath = path.join(outputDir, item.pdfName);
  const cmd = `"${chromePath}" --headless=new --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${item.htmlPath}"`;
  console.log(`Rendering PDF: ${item.pdfName}...`);
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`Successfully generated ${pdfPath}`);
  } catch (err) {
    console.error(`Error generating ${item.pdfName}:`, err.message);
  }
});

console.log('ALL PDFs GENERATED SUCCESSFULLY!');

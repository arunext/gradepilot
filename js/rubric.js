// AnatomiGrade AI - Rubric & Multi-Question Exam Management Module

export const PRESET_RUBRICS = [
  {
    id: 'preset-multi-med-exam',
    subject: 'Medical Sciences Master Paper',
    question: 'Comprehensive Anatomy & Physiology Final Examination (3 Questions)',
    examTitle: 'Medical Sciences Master Paper (3 Questions, 25 Marks)',
    maxMarks: 25.0,
    isMultiQuestion: true,
    questions: [
      {
        id: 'q1-bp',
        number: 1,
        title: 'Q1: Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
        maxMarks: 10.0,
        keyPoints: [
          { id: 'bp-1', text: 'Roots: Ventral rami of C5, C6, C7, C8, T1 with pre-fixed (C4) or post-fixed (T2) variations.', weight: 2.0, keywords: ['ventral rami', 'c5', 'c6', 'c7', 'c8', 't1', 'roots'] },
          { id: 'bp-2', text: 'Trunks & Divisions: Upper (C5+C6), Middle (C7), Lower (C8+T1); Anterior/Posterior divisions.', weight: 3.0, keywords: ['upper trunk', 'middle trunk', 'lower trunk', 'divisions'] },
          { id: 'bp-3', text: 'Cords & Terminal Branches: Lateral, Medial, Posterior cords; Radial, Median, Ulnar, Axillary nerves.', weight: 3.0, keywords: ['lateral cord', 'medial cord', 'posterior cord', 'radial', 'median', 'ulnar'] },
          { id: 'bp-4', text: 'Applied Anatomy: Erb-Duchenne palsy (C5-C6 / Waiter\'s tip) and Klumpke\'s palsy (C8-T1 / Claw hand).', weight: 2.0, keywords: ['erb', 'duchenne', 'klumpke', 'claw hand', 'waiter', 'palsy'] }
        ]
      },
      {
        id: 'q2-cardiac',
        number: 2,
        title: 'Q2: Explain the events of the Cardiac Cycle with emphasis on ventricular phases and valve mechanics.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'cc-1', text: 'Cycle Timing: 0.8s total duration at 75 bpm; Systole ~0.3s, Diastole ~0.5s.', weight: 1.0, keywords: ['0.8s', 'systole', 'diastole', '75 bpm'] },
          { id: 'cc-2', text: 'Isovolumetric Contraction & S1: All valves closed, steep pressure rise, AV valve closure produces S1.', weight: 2.0, keywords: ['isovolumetric contraction', 's1', 'first heart sound', 'av valves'] },
          { id: 'cc-3', text: 'Isovolumetric Relaxation & S2: Semilunar valve closure produces S2, ventricular filling phase.', weight: 2.0, keywords: ['isovolumetric relaxation', 's2', 'semilunar', 'filling'] }
        ]
      },
      {
        id: 'q3-renal',
        number: 3,
        title: 'Q3: Describe the microscopic anatomy of the Renal Cortex, Glomerulus, and Glomerular Filtration Barrier.',
        maxMarks: 10.0,
        keyPoints: [
          { id: 'rh-1', text: 'Cortical Anatomy: Renal corpuscles, PCT (brush border simple cuboidal), DCT, and Medullary rays.', weight: 3.0, keywords: ['pct', 'dct', 'brush border', 'renal corpuscle', 'cortex'] },
          { id: 'rh-2', text: 'Glomerular Filtration Barrier: Fenestrated endothelium, GBM (Type IV collagen & charge barrier), Podocyte pedicels with slit diaphragms.', weight: 4.0, keywords: ['filtration barrier', 'fenestrated', 'gbm', 'podocytes', 'slit diaphragm'] },
          { id: 'rh-3', text: 'Juxtaglomerular Apparatus: Macula densa, JG renin-secreting cells, and mesangial cells.', weight: 3.0, keywords: ['juxtaglomerular', 'macula densa', 'renin', 'mesangial'] }
        ]
      }
    ]
  },
  {
    id: 'preset-multi-stem-exam',
    subject: 'Physics & Applied Calculus Paper',
    question: 'Comprehensive STEM Examination (4 Questions)',
    examTitle: 'Physics & Calculus Exam Paper (4 Questions, 20 Marks)',
    maxMarks: 20.0,
    isMultiQuestion: true,
    questions: [
      {
        id: 'stem-q1',
        number: 1,
        title: 'Q1: Derive the kinematic equations for projectile motion and calculate maximum height $$H_{max} = \\frac{v_0^2 \\sin^2\\theta}{2g}$$.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'sq1-1', text: 'Horizontal & Vertical velocity components: $$v_x = v_0\\cos\\theta$$, $$v_y = v_0\\sin\\theta - gt$$.', weight: 2.5, keywords: ['v0cos', 'v0sin', 'velocity components', 'kinematics'] },
          { id: 'sq1-2', text: 'Derivation of maximum height at $$v_y = 0$$: $$H = \\frac{v_0^2 \\sin^2\\theta}{2g}$$.', weight: 2.5, keywords: ['maximum height', 'vy=0', 'derivation', '2g'] }
        ]
      },
      {
        id: 'stem-q2',
        number: 2,
        title: 'Q2: State Newton\'s Second Law and solve for acceleration of a block on an inclined plane with friction coefficient $$\\mu$$.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'sq2-1', text: 'Free-body diagram & force components: $$F_g = mg\\sin\\theta$$, Normal force $$N = mg\\cos\\theta$$.', weight: 2.5, keywords: ['free body diagram', 'mg sin', 'mg cos', 'normal force'] },
          { id: 'sq2-2', text: 'Net acceleration formula: $$a = g(\\sin\\theta - \\mu \\cos\\theta)$$.', weight: 2.5, keywords: ['acceleration', 'friction', 'mu cos'] }
        ]
      },
      {
        id: 'stem-q3',
        number: 3,
        title: 'Q3: Evaluate the definite integral $$\\int_0^1 x e^x dx$$ using Integration by Parts.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'sq3-1', text: 'Integration by Parts formula $$\\int u dv = uv - \\int v du$$ with $$u = x$$, $$dv = e^x dx$$.', weight: 2.5, keywords: ['integration by parts', 'u=x', 'dv=ex'] },
          { id: 'sq3-2', text: 'Antiderivative $$x e^x - e^x$$ and correct boundary evaluation giving final answer $$1$$.', weight: 2.5, keywords: ['antiderivative', 'xe^x - e^x', 'final answer 1'] }
        ]
      },
      {
        id: 'stem-q4',
        number: 4,
        title: 'Q4: Explain Simple Harmonic Motion (SHM) and write the differential equation $$\\frac{d^2x}{dt^2} + \\omega^2 x = 0$$.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'sq4-1', text: 'Restoring force definition $$F = -kx$$ and differential equation derivation.', weight: 2.5, keywords: ['restoring force', 'f=-kx', 'differential equation'] },
          { id: 'sq4-2', text: 'Angular frequency $$\\omega = \\sqrt{\\frac{k}{m}}$$ and period formula $$T = 2\\pi \\sqrt{\\frac{m}{k}}$$.', weight: 2.5, keywords: ['omega', 'period', '2pi sqrt'] }
        ]
      }
    ]
  },
  {
    id: 'preset-multi-cs-exam',
    subject: 'Computer Science & AI Master Paper',
    question: 'Comprehensive CS & Artificial Intelligence Examination (5 Questions)',
    examTitle: 'CS & AI Master Examination (5 Questions, 25 Marks)',
    maxMarks: 25.0,
    isMultiQuestion: true,
    questions: [
      {
        id: 'cs-q1',
        number: 1,
        title: 'Q1: Explain the mathematical concept of Backpropagation in Deep Neural Networks and state the chain rule formula.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'csq1-1', text: 'Forward pass computes loss L; backward pass calculates partial derivatives dL/dw propagating error back.', weight: 2.5, keywords: ['forward pass', 'loss', 'backward pass', 'gradient', 'partial derivative', 'loss function'] },
          { id: 'csq1-2', text: 'Chain rule formula: dL/dw = (dL/da)*(da/dz)*(dz/dw) and gradient descent weight update w = w - eta*(dL/dw).', weight: 2.5, keywords: ['chain rule', 'gradient descent', 'learning rate', 'eta', 'weight update', 'delta'] }
        ]
      },
      {
        id: 'cs-q2',
        number: 2,
        title: 'Q2: Analyze the average and worst-case time and space complexity of QuickSort vs MergeSort.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'csq2-1', text: 'MergeSort: Average & Worst Time O(N log N), Space O(N) for merge buffer arrays.', weight: 2.5, keywords: ['mergesort', 'n log n', 'o(n log n)', 'space o(n)', 'divide and conquer'] },
          { id: 'csq2-2', text: 'QuickSort: Average Time O(N log N), Worst Time O(N^2) for poor pivot selection, Space O(log N) recursion stack.', weight: 2.5, keywords: ['quicksort', 'pivot', 'o(n^2)', 'worst case', 'recursion stack'] }
        ]
      },
      {
        id: 'cs-q3',
        number: 3,
        title: 'Q3: Define the ACID properties in Relational Database Management Systems (RDBMS).',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'csq3-1', text: 'Atomicity & Consistency: All-or-nothing transaction execution; maintains valid state and foreign key constraints.', weight: 2.5, keywords: ['atomicity', 'all or nothing', 'consistency', 'valid state', 'rollback', 'constraints'] },
          { id: 'csq3-2', text: 'Isolation & Durability: Concurrent transactions execute independently (locking/MVCC); committed data persists in non-volatile WAL.', weight: 2.5, keywords: ['isolation', 'durability', 'concurrency', 'locks', 'committed', 'wal', 'non-volatile'] }
        ]
      },
      {
        id: 'cs-q4',
        number: 4,
        title: 'Q4: Explain the four core Object-Oriented Programming (OOP) principles with clear definitions.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'csq4-1', text: 'Encapsulation & Abstraction: Hiding internal state behind private access modifiers and exposing interfaces.', weight: 2.5, keywords: ['encapsulation', 'abstraction', 'private', 'interface', 'hiding', 'getters'] },
          { id: 'csq4-2', text: 'Inheritance & Polymorphism: Subclassing parent classes; method overriding/overloading allowing dynamic dispatch.', weight: 2.5, keywords: ['inheritance', 'polymorphism', 'overriding', 'overloading', 'subclass', 'parent class'] }
        ]
      },
      {
        id: 'cs-q5',
        number: 5,
        title: 'Q5: Describe RSA Public Key Cryptography and explain how asymmetric key pairs enable secure communication.',
        maxMarks: 5.0,
        keyPoints: [
          { id: 'csq5-1', text: 'Key Generation: Prime selection p, q; modulus n = p*q, totient phi(n); public key (e,n), private key (d,n).', weight: 2.5, keywords: ['rsa', 'prime', 'public key', 'private key', 'totient', 'modulo', 'asymmetric'] },
          { id: 'csq5-2', text: 'Encryption & Decryption: Ciphertext c = m^e mod n and plaintext recovery m = c^d mod n.', weight: 2.5, keywords: ['ciphertext', 'plaintext', 'encryption', 'decryption', 'm^e mod n', 'c^d mod n'] }
        ]
      }
    ]
  },
  {
    id: 'preset-brachial-plexus',
    subject: 'Human Anatomy - Single Question',
    question: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
    maxMarks: 10.0,
    keyPoints: [
      { id: 'bp-1', text: 'Roots: Ventral rami of C5, C6, C7, C8, T1 with mention of pre-fixed (C4) or post-fixed (T2) variations.', weight: 1.5, keywords: ['ventral rami', 'c5', 'c6', 'c7', 'c8', 't1', 'roots'] },
      { id: 'bp-2', text: 'Trunks: Upper (C5+C6), Middle (C7), Lower (C8+T1) formed in the posterior triangle of the neck.', weight: 1.5, keywords: ['upper trunk', 'middle trunk', 'lower trunk', 'c5+c6', 'c7', 'c8+t1'] },
      { id: 'bp-3', text: 'Divisions: Each trunk divides into Anterior (flexor) and Posterior (extensor) divisions beneath clavicle.', weight: 1.0, keywords: ['anterior division', 'posterior division', 'flexor', 'extensor'] },
      { id: 'bp-4', text: 'Cords: Lateral, Medial, Posterior cords; relations to 2nd part of Axillary Artery.', weight: 2.0, keywords: ['lateral cord', 'medial cord', 'posterior cord', 'axillary artery'] },
      { id: 'bp-5', text: 'Terminal Branches: Musculocutaneous, Axillary, Radial, Median, and Ulnar nerves.', weight: 2.0, keywords: ['musculocutaneous', 'axillary', 'radial', 'median', 'ulnar'] },
      { id: 'bp-6', text: 'Applied Anatomy: Erb-Duchenne palsy (C5-C6 / Waiter\'s tip) and Klumpke\'s palsy (C8-T1 / Claw hand).', weight: 2.0, keywords: ['erb', 'duchenne', 'klumpke', 'claw hand', 'palsy'] }
    ]
  }
];

/**
 * Normalizes any Rubric object into a standard array of questions.
 */
export function getNormalizedRubricQuestions(rubric) {
  if (!rubric) return [];
  if (Array.isArray(rubric.questions) && rubric.questions.length > 0) {
    return rubric.questions;
  }
  return [{
    id: rubric.id || 'q-1',
    number: 1,
    title: rubric.question || 'Exam Question',
    maxMarks: rubric.maxMarks || 10.0,
    keyPoints: rubric.keyPoints || []
  }];
}

export class RubricManager {
  constructor() {
    this.customRubrics = this.loadCustomRubrics();
    this.currentRubric = PRESET_RUBRICS[0]; // Default to first preset
    this.listeners = [];
  }

  loadCustomRubrics() {
    try {
      const saved = localStorage.getItem('gradecrow_custom_rubrics');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomRubrics() {
    try {
      localStorage.setItem('gradecrow_custom_rubrics', JSON.stringify(this.customRubrics));
    } catch (e) {}
  }

  saveToStorage() {
    try {
      localStorage.setItem('gradecrow_active_rubric', JSON.stringify(this.currentRubric));
    } catch (e) {}
  }

  getAllRubrics() {
    return [...PRESET_RUBRICS, ...this.customRubrics];
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach(fn => fn(this.currentRubric));
  }

  getRubric() {
    if (this.currentRubric) {
      if ((!this.currentRubric.keyPoints || this.currentRubric.keyPoints.length === 0) && Array.isArray(this.currentRubric.questions)) {
        this.currentRubric.keyPoints = this.currentRubric.questions.flatMap(q => q.keyPoints || []);
      }
    }
    return this.currentRubric;
  }

  getTotalPointsWeight() {
    const rubric = this.getRubric();
    if (!rubric) return 0;
    const points = (rubric.keyPoints && rubric.keyPoints.length > 0)
      ? rubric.keyPoints
      : (rubric.questions || []).flatMap(q => q.keyPoints || []);
    return points.reduce((sum, kp) => sum + (parseFloat(kp.weight) || 0), 0);
  }

  isWeightBalanced() {
    const total = this.getTotalPointsWeight();
    const max = this.getRubric()?.maxMarks || 25.0;
    return Math.abs(total - max) < 0.05;
  }

  setPreset(presetId) {
    const all = this.getAllRubrics();
    const found = all.find(p => p.id === presetId);
    if (found) {
      this.currentRubric = JSON.parse(JSON.stringify(found));
      if (!this.currentRubric.keyPoints && Array.isArray(this.currentRubric.questions)) {
        this.currentRubric.keyPoints = this.currentRubric.questions.flatMap(q => q.keyPoints || []);
      }
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

  setMultiQuestionRubric(parsedData) {
    const newId = 'custom-exam-' + Date.now().toString(36);
    this.currentRubric = {
      id: newId,
      subject: parsedData.subject || 'Multi-Question Exam Paper',
      question: parsedData.examTitle || parsedData.question || 'Multi-Question Exam Paper',
      examTitle: parsedData.examTitle || parsedData.question || 'Multi-Question Exam Paper',
      maxMarks: parsedData.totalMaxMarks || parsedData.maxMarks || 20.0,
      isMultiQuestion: true,
      isCustom: true,
      questions: (parsedData.questions || []).map((q, idx) => ({
        id: `q-${idx + 1}-${Date.now().toString(36)}`,
        number: q.number || (idx + 1),
        title: q.title || `Question ${idx + 1}`,
        maxMarks: typeof q.maxMarks === 'number' ? q.maxMarks : 5.0,
        keyPoints: (q.keyPoints || []).map((kp, kIdx) => ({
          id: `kp-${idx + 1}-${kIdx + 1}-${Date.now().toString(36)}`,
          text: kp.text || `Point ${kIdx + 1}`,
          weight: typeof kp.weight === 'number' ? kp.weight : 1.0,
          keywords: Array.isArray(kp.keywords) ? kp.keywords : []
        }))
      }))
    };

    if (this.currentRubric.questions.length === 0) {
      this.currentRubric.questions = [{
        id: 'q-1',
        number: 1,
        title: parsedData.question || 'Question 1',
        maxMarks: parsedData.maxMarks || 5.0,
        keyPoints: parsedData.keyPoints || []
      }];
    }

    this.currentRubric.keyPoints = this.currentRubric.questions.flatMap(q => q.keyPoints || []);

    this.saveCurrentAsPreset();
    this.notify();
    return this.currentRubric;
  }

  saveCurrentAsPreset() {
    const existingIdx = this.customRubrics.findIndex(r => r.id === this.currentRubric.id);
    const rubricCopy = JSON.parse(JSON.stringify(this.currentRubric));
    rubricCopy.isCustom = true;

    if (existingIdx >= 0) {
      this.customRubrics[existingIdx] = rubricCopy;
    } else {
      this.customRubrics.push(rubricCopy);
    }
    this.saveCustomRubrics();
    this.notify();
    return true;
  }
}

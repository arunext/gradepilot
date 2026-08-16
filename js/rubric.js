// AnatomiGrade AI - Rubric Management Module

export const PRESET_RUBRICS = [
  {
    id: 'preset-brachial-plexus',
    subject: 'Human Anatomy - Paper I',
    question: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
    maxMarks: 10.0,
    keyPoints: [
      {
        id: 'bp-1',
        text: 'Roots: Ventral rami of C5, C6, C7, C8, T1 with mention of pre-fixed (C4) or post-fixed (T2) variations.',
        weight: 1.5,
        keywords: ['ventral rami', 'c5', 'c6', 'c7', 'c8', 't1', 'roots', 'spinal nerves', 'anterior rami']
      },
      {
        id: 'bp-2',
        text: 'Trunks: Upper (C5+C6), Middle (C7), Lower (C8+T1) formed in the posterior triangle of the neck.',
        weight: 1.5,
        keywords: ['upper trunk', 'middle trunk', 'lower trunk', 'c5+c6', 'c7', 'c8+t1', 'posterior triangle']
      },
      {
        id: 'bp-3',
        text: 'Divisions: Each trunk divides into Anterior (flexor) and Posterior (extensor) divisions beneath clavicle.',
        weight: 1.0,
        keywords: ['anterior division', 'posterior division', 'divisions', 'flexor', 'extensor', 'clavicle']
      },
      {
        id: 'bp-4',
        text: 'Cords: Lateral (Upper+Middle anterior), Medial (Lower anterior), Posterior (all 3 posterior); relations to 2nd part of Axillary Artery.',
        weight: 2.0,
        keywords: ['lateral cord', 'medial cord', 'posterior cord', 'axillary artery', 'cords']
      },
      {
        id: 'bp-5',
        text: 'Terminal Branches: Correct derivation of Musculocutaneous, Axillary, Radial, Median, and Ulnar nerves.',
        weight: 2.0,
        keywords: ['musculocutaneous', 'axillary', 'radial', 'median', 'ulnar', 'terminal branches', 'nerve']
      },
      {
        id: 'bp-6',
        text: 'Applied Anatomy: Erb-Duchenne palsy (C5, C6 / Waiter\'s tip) and Klumpke\'s palsy (C8, T1 / Claw hand).',
        weight: 2.0,
        keywords: ['erb', 'duchenne', 'klumpke', 'waiter', 'policeman', 'claw hand', 'applied', 'clinical', 'palsy', 'injury']
      }
    ]
  },
  {
    id: 'preset-cardiac-cycle',
    subject: 'Physiology & Anatomy of CVS',
    question: 'Explain the events of the Cardiac Cycle with emphasis on ventricular phases and valve mechanics.',
    maxMarks: 5.0,
    keyPoints: [
      {
        id: 'cc-1',
        text: 'Definition & Timing: 0.8s total cycle (at 75 bpm), Ventricular Systole ~0.3s, Diastole ~0.5s.',
        weight: 0.75,
        keywords: ['0.8', 'seconds', 'systole', 'diastole', '75 bpm', 'cycle duration']
      },
      {
        id: 'cc-2',
        text: 'Isovolumetric Contraction: All valves closed, steep pressure rise, Mitral/Tricuspid closure produces S1.',
        weight: 1.25,
        keywords: ['isovolumetric contraction', 'valves closed', 'pressure', 'first heart sound', 's1', 'mitral', 'tricuspid']
      },
      {
        id: 'cc-3',
        text: 'Rapid & Reduced Ejection: Opening of Aortic & Pulmonary semilunar valves when pressure exceeds vascular resistance.',
        weight: 1.0,
        keywords: ['ejection', 'rapid ejection', 'reduced ejection', 'aortic valve', 'pulmonary', 'semilunar']
      },
      {
        id: 'cc-4',
        text: 'Isovolumetric Relaxation: Semilunar valve closure produces S2, all chambers closed, rapid pressure drop.',
        weight: 1.0,
        keywords: ['isovolumetric relaxation', 's2', 'second heart sound', 'semilunar closure', 'relaxation']
      },
      {
        id: 'cc-5',
        text: 'Ventricular Filling & Valve Mechanics: Rapid filling, diastasis, chordae tendineae and papillary muscle function.',
        weight: 1.0,
        keywords: ['filling', 'diastasis', 'atrial systole', 'chordae tendineae', 'papillary', 'av valves']
      }
    ]
  },
  {
    id: 'preset-renal-histology',
    subject: 'Histology & Renal Anatomy',
    question: 'Describe the microscopic anatomy of the Renal Cortex, Glomerulus, and Filtration Barrier.',
    maxMarks: 5.0,
    keyPoints: [
      {
        id: 'rh-1',
        text: 'Cortical Organization: Renal corpuscles, PCT (brush border simple cuboidal), DCT, and Medullary rays.',
        weight: 1.0,
        keywords: ['renal corpuscle', 'pct', 'proximal convoluted', 'brush border', 'dct', 'cortex']
      },
      {
        id: 'rh-2',
        text: 'Renal Corpuscle: Parietal layer (simple squamous), urinary space, visceral layer (podocytes), capillary tuft.',
        weight: 1.0,
        keywords: ['bowman', 'capsule', 'parietal', 'visceral', 'podocytes', 'glomerulus', 'capillary tuft']
      },
      {
        id: 'rh-3',
        text: 'Glomerular Filtration Barrier: Fenestrated endothelium (pores), Glomerular Basement Membrane (Type IV collagen, heparan sulfate charge barrier).',
        weight: 1.5,
        keywords: ['filtration barrier', 'fenestrated', 'endothelium', 'basement membrane', 'gbm', 'type iv collagen', 'heparan sulfate', 'charge']
      },
      {
        id: 'rh-4',
        text: 'Podocyte Pedicels & Slit Diaphragm: Secondary foot processes forming filtration slits bridged by nephrin & podocin.',
        weight: 1.0,
        keywords: ['podocyte', 'pedicels', 'foot processes', 'filtration slit', 'slit diaphragm', 'nephrin', 'podocin']
      },
      {
        id: 'rh-5',
        text: 'Juxtaglomerular Apparatus: Macula densa, Juxtaglomerular (renin-secreting) cells, and Lacis mesangial cells.',
        weight: 0.5,
        keywords: ['juxtaglomerular', 'jga', 'macula densa', 'jg cells', 'renin', 'lacis', 'mesangial']
      }
    ]
  },
  {
    id: 'preset-cranial-nerve-v',
    subject: 'Neuroanatomy & Head-Neck',
    question: 'Describe the functional components, cranial exit, branches, and clinical testing of the Trigeminal Nerve (CN V).',
    maxMarks: 10.0,
    keyPoints: [
      {
        id: 'cnv-1',
        text: 'Nuclei & Trigeminal Ganglion: Chief sensory, spinal, mesencephalic, and motor nuclei; Semilunar ganglion in Meckel\'s cave.',
        weight: 2.0,
        keywords: ['nuclei', 'trigeminal ganglion', 'semilunar', 'gasserian', 'mesencephalic', 'spinal nucleus', 'motor nucleus']
      },
      {
        id: 'cnv-2',
        text: 'Ophthalmic Division (V1): Exits via Superior Orbital Fissure; Frontal, Lacrimal, and Nasociliary branches for forehead and corneal sensation.',
        weight: 2.0,
        keywords: ['v1', 'ophthalmic', 'superior orbital fissure', 'frontal', 'lacrimal', 'nasociliary', 'corneal reflex']
      },
      {
        id: 'cnv-3',
        text: 'Maxillary Division (V2): Exits via Foramen Rotundum into Pterygopalatine fossa; Infraorbital, Zygomatic, and Superior Alveolar branches.',
        weight: 2.0,
        keywords: ['v2', 'maxillary', 'foramen rotundum', 'pterygopalatine', 'infraorbital', 'zygomatic', 'alveolar']
      },
      {
        id: 'cnv-4',
        text: 'Mandibular Division (V3): Exits via Foramen Ovale; Mixed motor/sensory supplying 4 muscles of mastication, Lingual, and Inferior Alveolar nerves.',
        weight: 2.5,
        keywords: ['v3', 'mandibular', 'foramen ovale', 'muscles of mastication', 'masseter', 'temporalis', 'pterygoid', 'lingual', 'inferior alveolar']
      },
      {
        id: 'cnv-5',
        text: 'Applied & Clinical Anatomy: Trigeminal Neuralgia (Tic Douloureux), Corneal reflex arc, and Jaw jerk reflex.',
        weight: 1.5,
        keywords: ['trigeminal neuralgia', 'tic douloureux', 'corneal reflex', 'jaw jerk', 'mastication paralysis']
      }
    ]
  }
];

export class RubricManager {
  constructor() {
    this.customRubrics = this.loadCustomRubrics();
    this.currentRubric = this.loadStoredRubric() || JSON.parse(JSON.stringify(PRESET_RUBRICS[0]));
    this.listeners = [];
  }

  loadStoredRubric() {
    try {
      const stored = localStorage.getItem('anatomigrade_current_rubric');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load stored rubric', e);
    }
    return null;
  }

  loadCustomRubrics() {
    try {
      const stored = localStorage.getItem('anatomigrade_custom_rubrics');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }

  saveCustomRubrics() {
    try {
      localStorage.setItem('anatomigrade_custom_rubrics', JSON.stringify(this.customRubrics));
    } catch (e) {}
  }

  saveToStorage() {
    try {
      localStorage.setItem('anatomigrade_current_rubric', JSON.stringify(this.currentRubric));
    } catch (e) {
      console.warn('Failed to persist rubric', e);
    }
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
    return this.currentRubric;
  }

  createNewBlankQuestion() {
    const newId = 'custom-' + Date.now().toString(36);
    this.currentRubric = {
      id: newId,
      subject: 'Anatomy / Medical Theory',
      question: 'New Question: Describe the anatomy and clinical relevance...',
      maxMarks: 5.0,
      isCustom: true,
      keyPoints: [
        {
          id: 'point-1',
          text: 'Key Point 1: Definition and primary anatomical structures...',
          weight: 2.5,
          keywords: ['structure', 'origin', 'anatomy']
        },
        {
          id: 'point-2',
          text: 'Key Point 2: Functional relations and clinical significance...',
          weight: 2.5,
          keywords: ['function', 'clinical', 'relation']
        }
      ]
    };
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

  setPreset(presetId) {
    const all = this.getAllRubrics();
    const found = all.find(p => p.id === presetId);
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
      text: text || 'New criteria / anatomical key point...',
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
    if (this.currentRubric.keyPoints.length <= 1) return false; // keep at least 1
    this.currentRubric.keyPoints = this.currentRubric.keyPoints.filter(p => p.id !== id);
    this.notify();
    return true;
  }

  rebalanceWeights() {
    const totalMax = this.currentRubric.maxMarks || 10.0;
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
    const sum = this.getTotalPointsWeight();
    return Math.abs(sum - this.currentRubric.maxMarks) < 0.05;
  }
}

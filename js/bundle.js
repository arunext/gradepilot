// GradeCrow AI - The Cleverest Handwritten Exam Grading Platform (gradecrow.com)
// Multimodal Vision OCR & Intelligent Semantic Concept Resolver (Somhi Design System)
(function() {
  'use strict';

  // --- 0. SUPABASE CONFIG & AUTH MANAGER ---
  const SUPABASE_CONFIG = {
    url: 'https://ofnvnkcwzxmbwavxdvtm.supabase.co',
    anonKey: 'sb_publishable_2uZid037F0dWrwInQ7XXzg_uLNSoWU9'
  };

  class SupabaseAuthManager {
    constructor() {
      this.client = null;
      this.user = null;
      this.profile = null;
      this.listeners = [];
      this.init();
    }

    init() {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        try {
          this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
          this.initAuth();
        } catch (e) {
          console.warn('Supabase client init failed:', e);
        }
      }
    }

    async initAuth() {
      if (!this.client) return;
      try {
        const { data: { session } } = await this.client.auth.getSession();
        if (session && session.user) {
          await this.syncProfile(session.user);
        }
        this.client.auth.onAuthStateChange(async (event, session) => {
          if (session && session.user) {
            await this.syncProfile(session.user);
          } else {
            this.user = null;
            this.profile = null;
            this.notify();
          }
        });
      } catch (e) {
        console.warn('Auth session check error:', e);
      }
    }

    async syncProfile(user) {
      this.user = user;
      const refParam = localStorage.getItem('gradecrow_ref_code');
      try {
        const { data: existing, error } = await this.client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (existing) {
          this.profile = existing;
        } else {
          // New User Registration!
          const generatedCode = 'CROW-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          const startingCredits = refParam ? 105 : 5; // 5 daily + 100 bonus scans if referred!
          
          const newProfile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || '',
            credits_balance: startingCredits,
            referral_code: generatedCode,
            referred_by: refParam || null,
            referrals_count: 0
          };

          const { data: created } = await this.client
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          this.profile = created || newProfile;

          // If referred, credit the referrer with +100 scans!
          if (refParam) {
            try {
              const { data: referrer } = await this.client
                .from('profiles')
                .select('id, credits_balance, referrals_count')
                .eq('referral_code', refParam)
                .single();

              if (referrer) {
                await this.client
                  .from('profiles')
                  .update({
                    credits_balance: (referrer.credits_balance || 0) + 100,
                    referrals_count: (referrer.referrals_count || 0) + 1
                  })
                  .eq('id', referrer.id);

                await this.client.from('credit_transactions').insert({
                  user_id: referrer.id,
                  amount: 100,
                  type: 'referral_bonus',
                  description: `Referred teacher: ${user.email}`
                });
              }
            } catch (errRef) {
              console.warn('Referral reward credit error:', errRef);
            }
            localStorage.removeItem('gradecrow_ref_code');
          }
        }
      } catch (err) {
        console.warn('Sync profile error:', err);
        this.profile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Teacher',
          avatar_url: user.user_metadata?.avatar_url || '',
          credits_balance: 5,
          referral_code: 'CROW-' + user.id.substring(0, 4).toUpperCase(),
          referrals_count: 0
        };
      }
      this.notify();
    }

    onAuthChange(cb) {
      this.listeners.push(cb);
    }

    notify() {
      this.listeners.forEach(fn => fn({ user: this.user, profile: this.profile }));
    }

    async signInWithGoogle() {
      if (!this.client) return alert('Authentication service initializing. Please refresh.');
      const redirectTo = window.location.origin + '/app';
      const { error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });
      if (error) alert('Google Sign-In error: ' + error.message);
    }

    async signOut() {
      if (this.client) await this.client.auth.signOut();
      this.user = null;
      this.profile = null;
      this.notify();
    }

    getCredits(hasCustomKey = false) {
      if (hasCustomKey) return Infinity;
      if (this.profile && typeof this.profile.credits_balance === 'number') {
        return this.profile.credits_balance;
      }
      return null;
    }

    canScan(hasCustomKey = false, guestCreditManager) {
      if (hasCustomKey) return true;
      if (this.profile && typeof this.profile.credits_balance === 'number') {
        return this.profile.credits_balance > 0;
      }
      return guestCreditManager.canScan(false);
    }

    async useScan(hasCustomKey = false, guestCreditManager) {
      if (hasCustomKey) return;
      if (this.profile && this.client) {
        const newBal = Math.max(0, (this.profile.credits_balance || 0) - 1);
        this.profile.credits_balance = newBal;
        try {
          await this.client
            .from('profiles')
            .update({ credits_balance: newBal })
            .eq('id', this.user.id);
        } catch (e) {}
        this.notify();
      } else {
        guestCreditManager.useScan(false);
      }
    }
  }

  // --- 0.1 GUEST CREDIT MANAGER (5 Free Daily Scans) ---
  class CreditManager {
    constructor() {
      this.DAILY_LIMIT = 5;
      this.data = this.loadData();
    }

    loadData() {
      const todayStr = new Date().toISOString().slice(0, 10);
      const bonusScans = parseInt(localStorage.getItem('gradecrow_bonus_scans') || '0', 10);
      try {
        const stored = localStorage.getItem('gradecrow_daily_credits');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.date === todayStr) {
            if (bonusScans > 0 && parsed.maxScans < (this.DAILY_LIMIT + bonusScans)) {
              parsed.maxScans = this.DAILY_LIMIT + bonusScans;
              this.saveData(parsed);
            }
            return parsed;
          }
        }
      } catch (e) {}
      const fresh = { date: todayStr, scansUsed: 0, maxScans: this.DAILY_LIMIT + bonusScans };
      this.saveData(fresh);
      return fresh;
    }

    saveData(d) {
      try {
        localStorage.setItem('gradecrow_daily_credits', JSON.stringify(d));
      } catch (e) {}
    }

    addBonusCredits(amount) {
      const currentBonus = parseInt(localStorage.getItem('gradecrow_bonus_scans') || '0', 10);
      const newBonus = currentBonus + amount;
      localStorage.setItem('gradecrow_bonus_scans', newBonus.toString());
      this.data.maxScans = (this.data.maxScans || this.DAILY_LIMIT) + amount;
      this.saveData(this.data);
      return this.getRemaining(false);
    }

    getRemaining(hasCustomKey = false) {
      if (hasCustomKey) return Infinity;
      const todayStr = new Date().toISOString().slice(0, 10);
      if (this.data.date !== todayStr) {
        const bonusScans = parseInt(localStorage.getItem('gradecrow_bonus_scans') || '0', 10);
        this.data = { date: todayStr, scansUsed: 0, maxScans: this.DAILY_LIMIT + bonusScans };
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
      inkColor: '#1d4ed8'
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
      inkColor: '#0f172a'
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
      inkColor: '#334155'
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
      inkColor: '#1d4ed8'
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
      inkColor: '#0f172a'
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
      inkColor: '#1d4ed8'
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
      id: 'preset-cbse-science-10',
      subject: 'CBSE Class 10 Science (Physics & Chemistry)',
      question: 'CBSE Science Mid-Term Examination (Physics & Chemistry - 3 Questions)',
      examTitle: 'CBSE Class 10 Science: Physics & Chemistry (15 Marks)',
      maxMarks: 15.0,
      isMultiQuestion: true,
      questions: [
        {
          id: 'q1-ohms-law',
          number: 1,
          title: "Q1 (Physics): State Ohm's Law and explain the factors on which the resistance of a cylindrical conductor depends.",
          maxMarks: 5.0,
          keyPoints: [
            { id: 'ol-1', text: "Ohm's Law: At constant temperature, current I is directly proportional to potential difference V (V = IR).", weight: 2.5, keywords: ["ohm's law", "v=ir", "potential difference", "current", "constant temperature", "directly proportional"] },
            { id: 'ol-2', text: "Resistance Factors: Directly proportional to length (R ∝ L), inversely proportional to area (R ∝ 1/A), and depends on material resistivity (R = ρL/A).", weight: 2.5, keywords: ["length", "area", "resistivity", "rho", "nature of material", "r=rho*l/a"] }
          ]
        },
        {
          id: 'q2-rusting-iron',
          number: 2,
          title: "Q2 (Chemistry): Explain the process of Rusting of Iron (Corrosion) with chemical equation and give two methods to prevent it.",
          maxMarks: 5.0,
          keyPoints: [
            { id: 'ri-1', text: "Rusting Definition & Equation: Iron reacts with oxygen and moisture/water to form hydrated iron(III) oxide (4Fe + 3O2 + 2xH2O -> 2Fe2O3.xH2O).", weight: 2.5, keywords: ["hydrated ferric oxide", "fe2o3", "oxygen", "moisture", "water", "corrosion"] },
            { id: 'ri-2', text: "Prevention Methods: Galvanization (coating with zinc), painting, applying oil/grease, or alloying (making stainless steel).", weight: 2.5, keywords: ["galvanization", "zinc", "painting", "alloying", "greasing", "oil"] }
          ]
        },
        {
          id: 'q3-neutralization',
          number: 3,
          title: "Q3 (Chemistry): What is a Neutralization Reaction? Give one balanced equation and explain why antacids are taken during acidity.",
          maxMarks: 5.0,
          keyPoints: [
            { id: 'nr-1', text: "Definition & Equation: Reaction between an acid and a base to form salt and water (e.g., HCl + NaOH -> NaCl + H2O).", weight: 2.5, keywords: ["neutralization", "acid", "base", "salt", "water", "hcl", "naoh", "nacl"] },
            { id: 'nr-2', text: "Antacid Action: Mild basic substances like Magnesium Hydroxide (Milk of Magnesia) neutralize excess hydrochloric acid in the stomach.", weight: 2.5, keywords: ["antacid", "magnesium hydroxide", "milk of magnesia", "excess acid", "stomach", "neutralize"] }
          ]
        }
      ]
    },
    {
      id: 'preset-cbse-humanities-10',
      subject: 'CBSE Social Science: Indian History & Civics',
      question: 'CBSE Social Science: Indian Constitution & 1857 Revolt (3 Questions)',
      examTitle: 'CBSE Class 10 Social Science: History & Civics (15 Marks)',
      maxMarks: 15.0,
      isMultiQuestion: true,
      questions: [
        {
          id: 'q1-revolt-1857',
          number: 1,
          title: "Q1 (History): Describe the major political, economic, and immediate causes of the Revolt of 1857.",
          maxMarks: 5.0,
          keyPoints: [
            { id: 'rev-1', text: "Political & Economic Causes: Doctrine of Lapse by Lord Dalhousie, heavy land revenue, and ruin of traditional Indian handicrafts.", weight: 2.5, keywords: ["doctrine of lapse", "dalhousie", "land revenue", "annexation", "handicrafts", "economic"] },
            { id: 'rev-2', text: "Immediate & Military Causes: Introduction of Enfield rifle with greased cartridges suspected of having cow and pig fat, and discontent among Indian sepoys.", weight: 2.5, keywords: ["greased cartridges", "enfield rifle", "sepoys", "mangal pandey", "immediate cause"] }
          ]
        },
        {
          id: 'q2-fundamental-rights',
          number: 2,
          title: "Q2 (Civics): Explain the Fundamental Rights guaranteed to Indian citizens by the Constitution of India.",
          maxMarks: 5.0,
          keyPoints: [
            { id: 'fr-1', text: "Core Rights: Right to Equality (Articles 14-18), Right to Freedom (Articles 19-22), and Right against Exploitation (Articles 23-24).", weight: 2.5, keywords: ["right to equality", "right to freedom", "exploitation", "article 14", "article 19"] },
            { id: 'fr-2', text: "Remedies & Protections: Right to Freedom of Religion, Cultural & Educational Rights, and Right to Constitutional Remedies (Article 32 - Heart and Soul of Constitution).", weight: 2.5, keywords: ["freedom of religion", "cultural", "constitutional remedies", "article 32", "dr ambedkar"] }
          ]
        },
        {
          id: 'q3-credit-sources',
          number: 3,
          title: "Q3 (Economics): Differentiate between formal and informal sources of credit in India. Why do rural households depend on informal sources?",
          maxMarks: 5.0,
          keyPoints: [
            { id: 'cr-1', text: "Formal vs Informal: Formal (Banks/Cooperatives, monitored by RBI, low interest) vs Informal (Moneylenders/Traders, unregulated, high interest).", weight: 2.5, keywords: ["formal credit", "informal credit", "rbi", "banks", "moneylenders", "interest"] },
            { id: 'cr-2', text: "Reasons for Rural Dependence: Lack of collateral/security, absence of banks in rural areas, and easy informal documentation.", weight: 2.5, keywords: ["collateral", "security", "rural", "documentation", "moneylender"] }
          ]
        }
      ]
    },
    {
      id: 'preset-6-question-master',
      subject: 'Human Physiology & Clinical Science Paper',
      question: 'Master 6-Question Exam Paper (30 Marks total)',
      examTitle: 'Comprehensive Master Exam Paper (6 Questions, 30 Marks)',
      maxMarks: 30.0,
      isMultiQuestion: true,
      isExampleMaster: true,
      questions: [
        {
          id: 'master-q1',
          number: 1,
          title: 'Q1: Describe the formation, trunks, divisions, cords, and terminal branches of the Brachial Plexus with applied clinical anatomy.',
          maxMarks: 5.0,
          sampleAnswers: [
            '• Roots: Ventral rami of C5, C6, C7, C8, T1.',
            '• Trunks: C5+C6 form Upper Trunk; C7 forms Middle Trunk; C8+T1 form Lower Trunk.',
            '• Divisions: Each trunk splits into Anterior (flexor) and Posterior (extensor) divisions.',
            '• Cords: Lateral (C5-C7), Posterior (C5-T1), Medial (C8-T1) around axillary artery.',
            '• Clinical: Erb-Duchenne palsy (C5-C6 / Waiter\'s tip hand) & Klumpke palsy (C8-T1 / Claw hand).'
          ],
          keyPoints: [
            { id: 'mq1-1', text: 'Roots & Trunks: Ventral rami C5-T1 form Upper (C5-C6), Middle (C7), and Lower (C8-T1) trunks.', weight: 1.5, keywords: ['ventral rami', 'c5', 'c6', 'c7', 'c8', 't1', 'upper trunk', 'middle trunk', 'lower trunk'] },
            { id: 'mq1-2', text: 'Divisions & Cords: Anterior/posterior divisions form Lateral, Medial, and Posterior cords around axillary artery.', weight: 1.5, keywords: ['anterior division', 'posterior division', 'lateral cord', 'medial cord', 'posterior cord', 'axillary artery'] },
            { id: 'mq1-3', text: 'Terminal Nerves & Applied: Radial, Median, Ulnar, Musculocutaneous, Axillary; Erb palsy (waiter tip) & Klumpke palsy (claw hand).', weight: 2.0, keywords: ['musculocutaneous', 'radial', 'median', 'axillary', 'ulnar', 'erb', 'klumpke', 'waiter tip', 'claw hand'] }
          ]
        },
        {
          id: 'master-q2',
          number: 2,
          title: 'Q2: Explain the events of the Cardiac Cycle with emphasis on ventricular pressure changes, volume curves, and heart sounds.',
          maxMarks: 5.0,
          sampleAnswers: [
            '• Total Duration: 0.8 seconds (75 bpm); Systole ~0.3s, Diastole ~0.5s.',
            '• Isovolumetric Contraction: All 4 valves closed, pressure rises rapidly; AV valve closure creates S1 (Lubb).',
            '• Ejection Phase: Semilunar valves open, blood pumped into aorta/pulmonary trunk.',
            '• Isovolumetric Relaxation: Semilunar valve closure creates S2 (Dupp) at start of diastole.'
          ],
          keyPoints: [
            { id: 'mq2-1', text: 'Cycle Timing: 0.8s total duration; Atrial systole (0.1s), Ventricular systole (0.3s), Ventricular diastole (0.4s).', weight: 1.5, keywords: ['0.8s', 'systole', 'diastole', '75 bpm', 'timing'] },
            { id: 'mq2-2', text: 'Isovolumetric Contraction & S1: All 4 valves closed, steep pressure rise, AV valve closure produces S1 (Lubb).', weight: 1.75, keywords: ['isovolumetric contraction', 's1', 'lubb', 'av valves', 'mitral'] },
            { id: 'mq2-3', text: 'Isovolumetric Relaxation & S2: Semilunar valve closure produces S2 (Dupp); rapid passive ventricular filling.', weight: 1.75, keywords: ['isovolumetric relaxation', 's2', 'dupp', 'semilunar valves', 'passive filling'] }
          ]
        },
        {
          id: 'master-q3',
          number: 3,
          title: 'Q3: Detail the histology of the Glomerular Filtration Barrier and the factors determining Glomerular Filtration Rate (GFR).',
          maxMarks: 5.0,
          sampleAnswers: [
            '• Fenestrated Endothelium: Capillary pores (70-100nm) block blood cells.',
            '• Basement Membrane (GBM): Type IV collagen & negatively charged heparan sulfate block plasma proteins.',
            '• Podocytes: Visceral epithelial cells with interdigitating pedicels & slit diaphragms.',
            '• Normal GFR: ~125 mL/min (~180 L/day), governed by net Starling hydrostatic & oncotic pressure gradients.'
          ],
          keyPoints: [
            { id: 'mq3-1', text: 'Filtration Barrier Layers: 1. Fenestrated endothelium, 2. Glomerular basement membrane (GBM), 3. Podocytes with slit diaphragms.', weight: 2.5, keywords: ['fenestrated', 'endothelium', 'gbm', 'podocytes', 'pedicels', 'slit diaphragm'] },
            { id: 'mq3-2', text: 'Starling Forces & GFR: Net Filtration Pressure NFP = (P_GC - P_BS) - pi_GC; Normal GFR = 125 mL/min.', weight: 2.5, keywords: ['starling forces', 'hydrostatic pressure', 'oncotic pressure', '125 ml/min', 'gfr'] }
          ]
        },
        {
          id: 'master-q4',
          number: 4,
          title: 'Q4: Describe chemical synaptic transmission at the neuromuscular junction (NMJ) from action potential arrival to muscle contraction.',
          maxMarks: 5.0,
          sampleAnswers: [
            '• Presynaptic: Action potential triggers voltage-gated Ca2+ influx -> exocytosis of Acetylcholine (ACh).',
            '• Synaptic Cleft: ACh diffuses across 20nm gap and binds nicotinic ACh receptors on motor end-plate.',
            '• Postsynaptic: Na+ influx produces End-Plate Potential (EPP) -> triggers muscular action potential.',
            '• Termination: Acetylcholinesterase (AChE) rapidly hydrolyzes ACh to choline and acetate.'
          ],
          keyPoints: [
            { id: 'mq4-1', text: 'Presynaptic Events: AP opens voltage-gated Ca2+ channels; Ca2+ influx triggers ACh exocytosis into synaptic cleft.', weight: 2.5, keywords: ['action potential', 'ca2+ channels', 'calcium influx', 'acetylcholine', 'exocytosis'] },
            { id: 'mq4-2', text: 'Postsynaptic Events & Termination: ACh binds nAChR causing Na+ entry, producing EPP; Acetylcholinesterase (AChE) hydrolyzes ACh.', weight: 2.5, keywords: ['nicotinic achr', 'end plate potential', 'epp', 'na+ entry', 'acetylcholinesterase'] }
          ]
        },
        {
          id: 'master-q5',
          number: 5,
          title: 'Q5: Explain Oxygen transport in blood via Hemoglobin, the Oxygen-Hemoglobin Dissociation Curve, and the Bohr Effect.',
          maxMarks: 5.0,
          sampleAnswers: [
            '• Hemoglobin Binding: Tetramer binding 4 O2 molecules; 1.34 mL O2 per gram Hb.',
            '• Sigmoidal Curve: Sigmoidal shape reflects positive cooperativity in subunit oxygen binding.',
            '• Bohr Effect (Right Shift): Increased H+ (low pH), high pCO2, elevated temperature, and 2,3-BPG decrease O2 affinity.',
            '• Physiological Advantage: Facilitates O2 unloading in actively metabolizing peripheral tissues.'
          ],
          keyPoints: [
            { id: 'mq5-1', text: 'Hemoglobin Binding & Capacity: Hb holds 4 O2 molecules; 1.34 mL O2/g Hb; Sigmoidal cooperative binding curve.', weight: 2.5, keywords: ['hemoglobin', '4 o2', '1.34 ml', 'sigmoidal curve', 'cooperative binding'] },
            { id: 'mq5-2', text: 'Rightward Shift (Bohr Effect): Elevated CO2, H+ (low pH), Temp, and 2,3-BPG shift curve right, enhancing O2 release.', weight: 2.5, keywords: ['bohr effect', 'right shift', 'high co2', 'low ph', 'high temp', '2 3-bpg'] }
          ]
        },
        {
          id: 'master-q6',
          number: 6,
          title: 'Q6: Compare the cellular origin, metabolic effects, and regulation of Insulin and Glucagon in blood glucose homeostasis.',
          maxMarks: 5.0,
          sampleAnswers: [
            '• Origin: Insulin from Pancreatic Islet Beta cells; Glucagon from Alpha cells.',
            '• Stimulus: High blood glucose stimulates insulin; Hypoglycemia stimulates glucagon.',
            '• Insulin Action: Promotes GLUT4 translocation, glycogenesis, lipogenesis, and cellular amino acid uptake.',
            '• Glucagon Action: Stimulates hepatic glycogenolysis, gluconeogenesis, and lipolysis to raise blood sugar.'
          ],
          keyPoints: [
            { id: 'mq6-1', text: 'Insulin (Beta Cells): Secreted during hyperglycemia; promotes GLUT4 translocation, glycogenesis, and glucose uptake.', weight: 2.5, keywords: ['beta cells', 'insulin', 'glut4', 'glycogenesis', 'glucose uptake', 'hyperglycemia'] },
            { id: 'mq6-2', text: 'Glucagon (Alpha Cells): Secreted during hypoglycemia; stimulates hepatic glycogenolysis, gluconeogenesis, and lipolysis.', weight: 2.5, keywords: ['alpha cells', 'glucagon', 'hypoglycemia', 'glycogenolysis', 'gluconeogenesis', 'lipolysis'] }
          ]
        }
      ]
    },
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
    }
  ];

  function getNormalizedRubricQuestions(rubric) {
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

  class RubricManager {
    constructor() {
      this.customRubrics = this.loadCustomRubrics();
      this.currentRubric = this.loadStoredRubric() || JSON.parse(JSON.stringify(PRESET_RUBRICS[0]));
      if (this.currentRubric && !this.currentRubric.keyPoints && Array.isArray(this.currentRubric.questions)) {
        this.currentRubric.keyPoints = this.currentRubric.questions.flatMap(q => q.keyPoints || []);
      }
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

    getRubric() {
      if (this.currentRubric) {
        if ((!this.currentRubric.keyPoints || this.currentRubric.keyPoints.length === 0) && Array.isArray(this.currentRubric.questions)) {
          this.currentRubric.keyPoints = this.currentRubric.questions.flatMap(q => q.keyPoints || []);
        }
      }
      return this.currentRubric;
    }

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
      if (scannedData.questions && scannedData.questions.length > 0) {
        return this.setMultiQuestionRubric(scannedData);
      }
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

    setPreset(presetId) {
      const found = this.getAllRubrics().find(p => p.id === presetId);
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

    addKeyPoint(text = '', weight = 1.0, keywords = []) {
      const newId = 'point-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      if (!this.currentRubric.keyPoints) this.currentRubric.keyPoints = [];
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
      if (!this.currentRubric.keyPoints) return false;
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
      if (!this.currentRubric.keyPoints || this.currentRubric.keyPoints.length <= 1) return false;
      this.currentRubric.keyPoints = this.currentRubric.keyPoints.filter(p => p.id !== id);
      this.notify();
      return true;
    }

    rebalanceWeights() {
      const rubric = this.getRubric();
      const points = (rubric?.keyPoints && rubric.keyPoints.length > 0)
        ? rubric.keyPoints
        : (rubric?.questions || []).flatMap(q => q.keyPoints || []);

      const totalMax = rubric?.maxMarks || 5.0;
      const count = points.length;
      if (count === 0) return;
      const baseWeight = Number((totalMax / count).toFixed(2));
      let currentSum = 0;
      
      points.forEach((pt, idx) => {
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
      const rubric = this.getRubric();
      if (!rubric) return 0;
      const points = (rubric.keyPoints && rubric.keyPoints.length > 0)
        ? rubric.keyPoints
        : (rubric.questions || []).flatMap(q => q.keyPoints || []);
      return (points || []).reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0);
    }

    isWeightBalanced() {
      const rubric = this.getRubric();
      const max = rubric?.maxMarks || 25.0;
      return Math.abs(this.getTotalPointsWeight() - max) < 0.05;
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

  // --- 4. PAPER CAPTURE & VIEWER (Multi-Page & PDF Queue Ready) ---
  class PaperCapture {
    constructor(options = {}) {
      this.container = options.container;
      this.onCaptureCallback = options.onCapture || (() => {});
      this.onGradeRequested = options.onGradeRequested || (() => {});
      
      this.currentImageSrc = null;
      this.currentMeta = null;
      
      // Multi-page state
      this.pages = []; // [{ pageNumber: 1, imageSrc: '...' }, ...]
      this.activePageIndex = 0;

      // Batch queue state
      this.batchQueue = []; // [{ meta, pages }, ...]
      this.activeBatchIndex = 0;

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
        // STATE 1: Ready to Upload / Take Photo / Drop PDFs
        this.container.innerHTML = `
          <div class="capture-container-inner">
            <!-- Batch Queue Control Bar (Hidden unless multiple student papers loaded) -->
            <div class="batch-queue-bar hidden" id="batch-queue-bar">
              <div class="batch-info">
                <span class="batch-icon">📦</span>
                <span class="batch-title">Batch Queue: Student <strong id="batch-current-num">1</strong> of <strong id="batch-total-num">1</strong></span>
              </div>
              <div class="batch-controls">
                <button type="button" class="btn btn-xs btn-outline" id="btn-prev-batch" title="Previous Student Paper">◀ Prev Student</button>
                <button type="button" class="btn btn-xs btn-outline" id="btn-next-batch" title="Next Student Paper">Next Student ▶</button>
              </div>
            </div>

            <div class="capture-actions-grid">
              <input type="file" id="camera-file-input" accept="image/*" capture="environment" class="file-input-hidden" />
              <input type="file" id="gallery-file-input" accept="image/*,.pdf" multiple class="file-input-hidden" />
                      <!-- Take Photo / Scan Document Card -->
              <div class="action-card-camera" id="btn-take-photo-direct">
                <div class="action-card-icon">📸</div>
                <div class="action-card-title">Scan Document / Take Photo</div>
                <div class="action-card-subtitle">Launch mobile document camera or pick PDF / image</div>
              </div>

              <!-- Upload File Card -->
              <div class="action-card-upload" id="btn-browse-file">
                <div class="action-card-icon">📁</div>
                <div class="action-card-title">Upload Image / PDF</div>
                <div class="action-card-subtitle">Supports multi-page PDFs, JPG, PNG</div>
              </div>
            </div>
          </div>
        `;
      } else {
        // STATE 2: Paper Loaded -> Preview with Multi-Page & Grade Button
        this.container.innerHTML = `
          <div class="capture-container-inner">
            <input type="file" id="camera-file-input" accept="image/*,.pdf" capture="environment" class="file-input-hidden" />
            <input type="file" id="gallery-file-input" accept="image/*,.pdf" multiple class="file-input-hidden" />

            <!-- Batch Queue Control Bar -->
            <div class="batch-queue-bar ${this.batchQueue.length > 1 ? '' : 'hidden'}" id="batch-queue-bar">
              <div class="batch-info">
                <span class="batch-icon">📦</span>
                <span class="batch-title">Batch Queue: Student <strong id="batch-current-num">${this.activeBatchIndex + 1}</strong> of <strong id="batch-total-num">${this.batchQueue.length}</strong></span>
              </div>
              <div class="batch-controls">
                <button type="button" class="btn btn-xs btn-outline" id="btn-prev-batch" title="Previous Student Paper">◀ Prev Student</button>
                <button type="button" class="btn btn-xs btn-outline" id="btn-next-batch" title="Next Student Paper">Next Student ▶</button>
              </div>
            </div>

            <div class="paper-viewer-card">
              <div class="viewer-header-bar">
                <div class="viewer-meta-info">
                  <span class="viewer-roll-pill" id="paper-badge-roll">${this.currentMeta?.rollNo || 'STU-101'}</span>
                  <span class="viewer-student-label" id="paper-student-name">${this.currentMeta?.studentName || 'Student Paper'}</span>
                </div>

                <!-- Multi-Page Navigation Pill -->
                <div class="page-nav-pill" id="page-nav-pill">
                  <button type="button" class="btn-page-step" id="btn-prev-page" title="Previous Page">◀</button>
                  <span class="page-indicator" id="page-indicator">Page ${this.activePageIndex + 1} of ${this.pages.length}</span>
                  <button type="button" class="btn-page-step" id="btn-next-page" title="Next Page">▶</button>
                  <button type="button" class="btn-add-page-chip" id="btn-add-page-trigger" title="Add another page">➕ Page</button>
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

              <!-- Page Thumbnails Strip -->
              <div class="page-thumbnails-bar ${this.pages.length > 1 ? '' : 'hidden'}" id="page-thumbnails-bar">
                ${this.pages.map((p, idx) => `
                  <button type="button" class="page-thumb ${idx === this.activePageIndex ? 'active' : ''}" data-idx="${idx}">
                    <img src="${p.imageSrc}" alt="Page ${p.pageNumber}" />
                    <span class="thumb-label">P${p.pageNumber}</span>
                  </button>
                `).join('')}
              </div>

              <div class="viewer-bottom-action-bar">
                <button type="button" class="btn-grade-primary" id="btn-grade-now">
                  <span>✨</span> Grade with AI ➔
                </button>
                <button type="button" class="btn-change-photo" id="btn-retake-photo">
                  📸 Change / Add File
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
          cameraInput.click();
        });
      }

      if (btnBrowse && galleryInput) {
        btnBrowse.addEventListener('click', () => galleryInput.click());
      }

      if (cameraInput) cameraInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
      if (galleryInput) galleryInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

      if (btnRetake) {
        btnRetake.addEventListener('click', () => {
          if (galleryInput) galleryInput.click();
        });
      }

      if (btnGradeNow) {
        btnGradeNow.addEventListener('click', () => this.onGradeRequested());
      }

      // Multi-Page Navigation Events
      const btnPrevPage = this.container.querySelector('#btn-prev-page');
      const btnNextPage = this.container.querySelector('#btn-next-page');
      const btnAddPage = this.container.querySelector('#btn-add-page-trigger');

      if (btnPrevPage) btnPrevPage.addEventListener('click', () => this.switchPage(this.activePageIndex - 1));
      if (btnNextPage) btnNextPage.addEventListener('click', () => this.switchPage(this.activePageIndex + 1));
      if (btnAddPage && galleryInput) {
        btnAddPage.addEventListener('click', () => galleryInput.click());
      }

      // Batch Queue Events
      const btnPrevBatch = this.container.querySelector('#btn-prev-batch');
      const btnNextBatch = this.container.querySelector('#btn-next-batch');
      if (btnPrevBatch) btnPrevBatch.addEventListener('click', () => this.switchBatch(this.activeBatchIndex - 1));
      if (btnNextBatch) btnNextBatch.addEventListener('click', () => this.switchBatch(this.activeBatchIndex + 1));

      // Thumbnails click
      this.container.querySelectorAll('.page-thumb').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.switchPage(idx);
        });
      });

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

      if (this.pages && this.pages.length > 0 && confirm('Append captured photo as Page ' + (this.pages.length + 1) + '?')) {
        this.addPageToPaper(dataUrl);
      } else {
        this.setPaperImage(dataUrl, {
          id: 'custom-photo-' + Date.now(),
          studentName: 'Student (Camera Scan)',
          rollNo: 'STU-' + Math.floor(1000 + Math.random() * 9000),
          isCustom: true
        });
      }
    }

    async handleFileSelect(fileList) {
      if (!fileList || !fileList.length) return;
      const files = Array.from(fileList);

      // PDF rendering via pdf.js
      const pdfFile = files.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      if (pdfFile) {
        try {
          const pdfPages = await this.renderPdfFile(pdfFile);
          if (pdfPages && pdfPages.length > 0) {
            const rollNo = 'STU-' + Math.floor(1000 + Math.random() * 9000);
            const meta = {
              id: 'pdf-' + Date.now(),
              studentName: pdfFile.name.replace(/\.[^/.]+$/, ""),
              rollNo: rollNo,
              isCustom: true
            };
            this.setMultiPagePaper(pdfPages, meta);
            return;
          }
        } catch (pdfErr) {
          console.error('PDF rendering error:', pdfErr);
        }
      }

      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (!imageFiles.length) return;

      if (imageFiles.length === 1) {
        const file = imageFiles[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (this.pages && this.pages.length > 0 && confirm('Append uploaded image as Page ' + (this.pages.length + 1) + '?')) {
            this.addPageToPaper(e.target.result);
          } else {
            this.setPaperImage(e.target.result, {
              id: 'uploaded-' + Date.now(),
              studentName: file.name.replace(/\.[^/.]+$/, ''),
              rollNo: 'STU-' + Math.floor(1000 + Math.random() * 9000),
              isCustom: true
            });
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Multiple images -> Batch Queue
        const readPromises = imageFiles.map(file => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ name: file.name, dataUrl: e.target.result });
          reader.readAsDataURL(file);
        }));

        const results = await Promise.all(readPromises);

        this.batchQueue = results.map((res, idx) => ({
          meta: {
            id: `batch-${Date.now()}-${idx}`,
            studentName: res.name.replace(/\.[^/.]+$/, ""),
            rollNo: `STU-${1001 + idx}`,
            isCustom: true
          },
          pages: [{ pageNumber: 1, imageSrc: res.dataUrl }]
        }));

        this.activeBatchIndex = 0;
        this.loadBatchItem(0);
      }
    }

    async renderPdfFile(file) {
      if (!window.pdfjsLib) {
        console.warn('PDF.js not available');
        return [];
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageImages = [];

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        pageImages.push(canvas.toDataURL('image/jpeg', 0.92));
      }

      return pageImages;
    }

    loadSample(sampleId) {
      const sample = SAMPLE_PAPERS.find(s => s.id === sampleId) || SAMPLE_PAPERS[0];
      const dataUrl = getSampleSvgDataUrl(sample.id);
      this.batchQueue = [];
      this.setPaperImage(dataUrl, sample);
    }

    setPaperImage(imageSrc, meta) {
      this.setMultiPagePaper([imageSrc], meta);
    }

    setMultiPagePaper(imageSrcArray, meta) {
      this.currentMeta = meta;
      this.pages = imageSrcArray.map((src, idx) => ({
        pageNumber: idx + 1,
        imageSrc: src
      }));
      this.activePageIndex = 0;
      this.currentImageSrc = this.pages[0]?.imageSrc || '';

      this.renderUI();
      this.attachEvents();
      this.resetTransform();

      this.onCaptureCallback({
        imageSrc: this.currentImageSrc,
        pages: this.pages,
        meta: this.currentMeta
      });
    }

    addPageToPaper(dataUrl) {
      this.pages.push({
        pageNumber: this.pages.length + 1,
        imageSrc: dataUrl
      });
      this.switchPage(this.pages.length - 1);
    }

    switchPage(index) {
      if (!this.pages || !this.pages.length) return;
      if (index < 0 || index >= this.pages.length) return;

      this.activePageIndex = index;
      this.currentImageSrc = this.pages[index].imageSrc;
      this.renderUI();
      this.attachEvents();
      this.resetTransform();

      this.onCaptureCallback({
        imageSrc: this.currentImageSrc,
        pages: this.pages,
        meta: this.currentMeta
      });
    }

    loadBatchItem(index) {
      if (!this.batchQueue || !this.batchQueue.length) return;
      if (index < 0 || index >= this.batchQueue.length) return;

      this.activeBatchIndex = index;
      const item = this.batchQueue[index];
      this.setMultiPagePaper(item.pages.map(p => p.imageSrc), item.meta);
    }

    switchBatch(index) {
      this.loadBatchItem(index);
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

    async evaluatePaper({ imageSrc, pages = [], pagesBase64 = [], rawText, rubric, sampleMeta, progressCallback = () => {} }) {
      const isCustomPhoto = Boolean(sampleMeta?.isCustom || (imageSrc && !imageSrc.startsWith('data:image/svg+xml')));
      let geminiError = null;

      // Extract all page image strings for multi-page answer sheet evaluation
      let pageList = [];
      if (Array.isArray(pagesBase64) && pagesBase64.length > 0) {
        pageList = pagesBase64;
      } else if (Array.isArray(pages) && pages.length > 0) {
        pageList = pages.map(p => typeof p === 'string' ? p : (p.imageSrc || p.src || ''));
      } else if (imageSrc) {
        pageList = [imageSrc];
      }

      pageList = pageList.filter(Boolean);
      const compressedPages = await Promise.all(
        pageList.map(src => compressImageForGemini(src))
      );

      const mainImageSrc = compressedPages[0] || imageSrc;

      // 1. If Live Custom Gemini API Key is available, perform Multimodal Vision OCR directly on the client
      if (this.hasLiveApiKey()) {
        try {
          progressCallback(`Transcribing handwriting across ${compressedPages.length} page(s) with GradeCrow AI...`);
          const visionResult = await this.evaluateWithGeminiVision({ imageSrc: mainImageSrc, pages: compressedPages, rubric, progressCallback });
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
        progressCallback(`Connecting to GradeCrow AI Cloud (${compressedPages.length} page(s))...`);
        const serverRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pagesBase64: compressedPages,
            imageBase64: mainImageSrc,
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
      return this.evaluateIntelligentLocal({ rawText, rubric, sampleMeta, imageSrc: mainImageSrc, isCustomPhoto, geminiError });
    }

    async parseQuestionSchemeFromImage({ imageSrc, pages = [], pagesBase64 = [], progressCallback = () => {} }) {
      progressCallback('Optimizing image pages & connecting to GradeCrow AI...');

      let pageList = [];
      if (Array.isArray(pagesBase64) && pagesBase64.length > 0) {
        pageList = pagesBase64;
      } else if (Array.isArray(pages) && pages.length > 0) {
        pageList = pages.map(p => typeof p === 'string' ? p : (p.imageSrc || p.src || ''));
      } else if (imageSrc) {
        pageList = [imageSrc];
      }

      const compressedPages = await Promise.all(
        pageList.filter(Boolean).map(src => compressImageForGemini(src))
      );

      if (compressedPages.length === 0) {
        throw new Error('No valid question paper image provided.');
      }

      // 1. Try serverless route /api/parse-question
      try {
        progressCallback(`Reading handwritten question paper (${compressedPages.length} page(s)) & points allocation...`);
        const serverRes = await fetch('/api/parse-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pagesBase64: compressedPages,
            imageBase64: compressedPages[0],
            mimeType: 'image/jpeg'
          })
        });

        if (serverRes.ok) {
          const parsed = await serverRes.json();
          if (parsed && (parsed.questions || parsed.question)) {
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
          const modelsToTry = await this.getWorkingModels(activeKey);
          
          const imageParts = compressedPages.map(src => {
            const cleanBase64 = src.replace(/^data:image\/[a-zA-Z+]+;base64,/, '').replace(/[\r\n\s]+/g, '');
            return { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } };
          });

          const prompt = `You are GradeCrow AI, an expert exam assistant (gradecrow.com).
Look at the attached handwritten or printed image(s) of an exam question paper (${imageParts.length} page(s)), marking scheme, or rubric written by a teacher.

The document may contain ONE question or MULTIPLE questions (e.g. Q1, Q2, Q3... up to Q20) across all pages.

Extract:
1. Overall Exam Title or Course Subject.
2. Total Maximum Marks for the whole paper across all questions.
3. Every individual Question (numbered Q1, Q2, etc.) across all pages, its allocated max marks, and its granular key answer points/criteria with individual point weights.
4. Relevant vocabulary keywords for each point.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "examTitle": "Title of Exam Paper or Course Name",
  "subject": "Subject Name",
  "totalMaxMarks": 20.0,
  "questions": [
    {
      "number": 1,
      "title": "Q1: Full question 1 text...",
      "maxMarks": 10.0,
      "keyPoints": [
        {
          "text": "Criterion or expected step description",
          "weight": 2.5,
          "keywords": ["keyword1", "keyword2"]
        }
      ]
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
                    ...imageParts
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
                const rawQuestions = Array.isArray(parsed.questions) && parsed.questions.length > 0
                  ? parsed.questions
                  : [{ number: 1, title: parsed.question || 'Scanned Question', maxMarks: parsed.maxMarks || 5.0, keyPoints: parsed.keyPoints || [] }];

                const formattedQuestions = rawQuestions.map((q, qIdx) => ({
                  id: `q-${qIdx + 1}-${Date.now().toString(36)}`,
                  number: q.number || (qIdx + 1),
                  title: q.title || `Question ${qIdx + 1}`,
                  maxMarks: typeof q.maxMarks === 'number' ? q.maxMarks : 5.0,
                  keyPoints: (q.keyPoints || []).map((kp, kIdx) => ({
                    id: `kp-${qIdx + 1}-${kIdx + 1}-${Date.now().toString(36)}`,
                    text: kp.text || `Point ${kIdx + 1}`,
                    weight: typeof kp.weight === 'number' ? Number(kp.weight.toFixed(2)) : 1.0,
                    keywords: Array.isArray(kp.keywords) ? kp.keywords : []
                  }))
                }));

                return {
                  examTitle: parsed.examTitle || 'Scanned Exam Paper',
                  subject: parsed.subject || 'General',
                  totalMaxMarks: (formattedQuestions || []).reduce((acc, q) => acc + (q.maxMarks || 0), 0),
                  isMultiQuestion: true,
                  questions: formattedQuestions
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
        examTitle: 'Scanned Exam Paper (OCR offline)',
        subject: 'General Course',
        totalMaxMarks: 10.0,
        isMultiQuestion: true,
        questions: [
          {
            id: `q-1-${Date.now().toString(36)}`,
            number: 1,
            title: 'Q1: Core anatomical concepts & diagrams',
            maxMarks: 5.0,
            keyPoints: [
              { id: `pt-1-1-${Date.now().toString(36)}`, text: 'Core concept explanation (2.5 marks)', weight: 2.5, keywords: [] },
              { id: `pt-1-2-${Date.now().toString(36)}`, text: 'Key terminology & definitions (2.5 marks)', weight: 2.5, keywords: [] }
            ]
          },
          {
            id: `q-2-${Date.now().toString(36)}`,
            number: 2,
            title: 'Q2: Clinical correlations & mechanism',
            maxMarks: 5.0,
            keyPoints: [
              { id: `pt-2-1-${Date.now().toString(36)}`, text: 'Clinical presentation and pathology (2.5 marks)', weight: 2.5, keywords: [] },
              { id: `pt-2-2-${Date.now().toString(36)}`, text: 'Treatment principles & outcomes (2.5 marks)', weight: 2.5, keywords: [] }
            ]
          }
        ]
      };
    }

    async evaluateWithGeminiVision({ imageSrc, pages = [], rubric, progressCallback = () => {} }) {
      const activeKey = this.getApiKey();
      if (!activeKey) throw new Error('API key is empty.');

      let rawPages = (Array.isArray(pages) && pages.length > 0)
        ? pages.map(p => typeof p === 'string' ? p : (p.imageSrc || p.src || ''))
        : [imageSrc];

      rawPages = rawPages.filter(Boolean);
      if (rawPages.length === 0) throw new Error('No image data found.');

      const imageParts = rawPages.map(src => {
        let mimeType = 'image/jpeg';
        let base64Data = '';
        const commaIdx = src.indexOf(',');
        if (commaIdx >= 0) {
          const meta = src.substring(0, commaIdx);
          base64Data = src.substring(commaIdx + 1).replace(/[\r\n\s]+/g, '');
          const m = meta.match(/data:([^;]+)/);
          if (m && m[1] && !m[1].includes('svg')) {
            mimeType = m[1];
          }
        } else {
          base64Data = src.replace(/[\r\n\s]+/g, '');
        }
        return { inlineData: { mimeType, data: base64Data } };
      });

      const keyPointsList = (rubric.keyPoints && rubric.keyPoints.length > 0)
        ? rubric.keyPoints
        : (rubric.questions || []).flatMap(q => q.keyPoints || []);

      const prompt = `You are GradeCrow AI, an expert exam evaluation assistant (gradecrow.com).
Look at the attached student handwritten exam paper image(s) (${imageParts.length} page(s) attached).
1. Transcribe the entire handwritten text on the paper across ALL pages accurately into the transcription field.
2. Evaluate the student's answer against the following question rubric and criteria across ALL pages.
3. SCORING & PARTIAL MARKS RULES:
   - "hit" (Full Marks = 100% of weight): The student provides the correct heading AND adequate explanation/details.
   - "partial" (Partial/Half Marks = 50% of weight): Award partial marks whenever the student writes the correct heading, concept title, or key terminology, even if detailed explanation is brief or absent.
   - "missed" (0 Marks): Topic or heading is completely absent across all pages.
4. Extract the exact quote from the student's text as evidence (mention page number if multi-page e.g. "[Page 2] ...").

QUESTION / SUBJECT: ${rubric.question} (${rubric.subject || 'General'})
MAXIMUM MARKS: ${rubric.maxMarks}

RUBRIC KEY POINTS:
${keyPointsList.map((kp, idx) => `Point ${idx + 1} [ID: ${kp.id}] [Weight: ${kp.weight}]: ${kp.text}`).join('\n')}

Respond ONLY with a JSON object in this exact schema:
{
  "transcription": "The full transcribed text of the student answer across all pages...",
  "suggestedScore": 3.5,
  "feedbackSummary": "A concise 2-sentence summary of strengths and omissions across pages.",
  "points": [
    {
      "pointId": "${keyPointsList[0]?.id || 'pt-1'}",
      "status": "partial",
      "awardedMarks": 0.5,
      "evidenceQuote": "[Page 1] Exact quote or formula",
      "justification": "Heading mentioned on page 1; awarded partial marks."
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
                  ...imageParts
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

          const calculatedTotal = (pointsList || []).reduce((sum, p) => sum + (p.awardedMarks || 0), 0);

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

        // 1. Identify heading/title candidate (e.g. text before colon, hyphen, or first key phrase)
        const anatomyHeaderMatch = rawCriteria.match(/(anterior wall|posterior wall|medial wall|lateral wall|apex|base|roots|trunks|divisions|cords|terminal branches)/i);
        let headerName = anatomyHeaderMatch ? anatomyHeaderMatch[1].toLowerCase() : null;
        
        if (!headerName) {
          const splitParts = rawCriteria.split(/[:\-\–\—\(\.\,]/);
          if (splitParts[0] && splitParts[0].trim().length > 2) {
            headerName = splitParts[0].trim();
          }
        }

        let itemsString = rawCriteria;
        if (headerName && rawCriteria.includes(headerName)) {
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
            return this.matchesMedicalConcept(line, headerName);
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
          justification = `Complete: Mentioned heading (${headerName}) with key details (${matchedItems.join(', ')}). Full marks.`;
        } else if (hasHeader && matchedCount >= 1) {
          status = 'partial';
          awardedMarks = Number((weight * 0.75).toFixed(2));
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Partial: Mentioned heading (${headerName}) with ${matchedItems.join(', ')}. Details incomplete.`;
        } else if (hasHeader && matchedCount === 0) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = `"...${studentLineWithHeader.trim()}..."`;
          justification = `Heading only: Mentioned concept (${headerName}) without full explanation. Partial marks awarded.`;
        } else if (!hasHeader && matchedCount >= 1) {
          status = 'partial';
          awardedMarks = Number((weight * 0.5).toFixed(2));
          evidenceQuote = this.extractSentenceCitation(studentText, matchedItems[0]);
          justification = `Partially mentioned concept details (${matchedItems.join(', ')}).`;
        } else {
          status = 'missed';
          awardedMarks = 0;
          evidenceQuote = '(Omitted from answer sheet)';
          justification = `Concept and description omitted from answer sheet.`;
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

  function formatMathText(text) {
    if (!text) return '';
    if (typeof window === 'undefined' || !window.katex) return text;

    try {
      // 1. Replace display math $$...$$
      let formatted = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
        try {
          return window.katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
        } catch (e) {
          return match;
        }
      });

      // 2. Replace inline math $...$
      formatted = formatted.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
        try {
          return window.katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
        } catch (e) {
          return match;
        }
      });

      return formatted;
    } catch (e) {
      return text;
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
            <p class="feedback-text">${formatMathText(evalData.feedbackSummary)}</p>
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
                : `<div class="transcript-preview">${formatMathText(evalData.transcription).replace(/\n/g, '<br/>')}</div>`}
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
                  <div class="criterion-desc">${formatMathText(pt.pointText)}</div>
                  <div class="criterion-evidence">
                    <span>❝</span>
                    <span>${formatMathText(pt.evidenceQuote)}</span>
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

      const recalculated = (this.currentEvaluation?.points || []).reduce((acc, p) => acc + (p.awardedMarks || 0), 0);
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

  // --- 7.5 LEGAL & COMPLIANCE POLICIES (Razorpay KYC Requirement) ---
  const LEGAL_DOCS = {
    terms: {
      title: 'Terms of Service',
      html: `
        <h4>1. Platform Overview</h4>
        <p>GradeCrow (gradecrow.com) provides AI-assisted grading, OCR handwriting recognition, question schema extraction, and gradebook management for teachers, professors, and educational institutions.</p>
        <h4>2. User Accounts & Fair Use</h4>
        <p>You agree to provide accurate information when signing in with Google. Free daily scans and purchased credits are non-transferable and intended for legitimate academic evaluation.</p>
        <h4>3. Credit Packs & Pricing</h4>
        <p>Scan credit packs start at ₹49 INR. Payments are securely processed via Razorpay. Purchased credits do not expire and remain linked to your Google account.</p>
        <h4>4. Data Ownership & Privacy</h4>
        <p>Educators retain 100% ownership of their question keys and student exam papers. GradeCrow does not sell or share student papers for public model training.</p>
      `
    },
    privacy: {
      title: 'Privacy Policy',
      html: `
        <h4>1. Information We Collect</h4>
        <p>We collect your basic Google profile (name, email, avatar) to manage your account and credits. When you upload exam papers, we process the images strictly for grading.</p>
        <h4>2. Data Security & Storage</h4>
        <p>Account data is protected via Supabase PostgreSQL with strict Row Level Security (RLS). All financial transactions are encrypted and processed by Razorpay PCI-DSS Level 1 compliant infrastructure.</p>
        <h4>3. Third-Party Services</h4>
        <p>We use Google Cloud AI (Gemini Vision) for handwriting recognition and Razorpay for payment processing.</p>
        <h4>4. Contact</h4>
        <p>For any privacy inquiries or account deletion requests, email us at <strong>support@gradecrow.com</strong>.</p>
      `
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      html: `
        <h4>1. Digital Credit Packs</h4>
        <p>Credit packs (₹49, ₹199, ₹499, ₹999) provide instant digital grading credits. Unused credits never expire.</p>
        <h4>2. Refund Eligibility</h4>
        <p>If you experience any technical failure where credits were deducted without producing an evaluation, or if you were charged in error, please contact us within 7 days of purchase at <strong>support@gradecrow.com</strong> with your payment ID.</p>
        <h4>3. Refund Timeline</h4>
        <p>Approved refunds are credited back to your original payment method (UPI / Bank Account / Card) within 5–7 business days via Razorpay.</p>
      `
    },
    contact: {
      title: 'Contact Us & Support',
      html: `
        <h4>GradeCrow Support</h4>
        <p>We are dedicated to helping educators evaluate exams faster.</p>
        <ul style="padding-left: 1.25rem; margin: 0.75rem 0; line-height: 1.8;">
          <li><strong>Email:</strong> support@gradecrow.com / arun@gradecrow.com</li>
          <li><strong>Website:</strong> <a href="https://gradecrow.vercel.app" target="_blank" style="color: #00a991; font-weight: 700;">https://gradecrow.vercel.app</a></li>
          <li><strong>Operating Hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM IST</li>
          <li><strong>Response Time:</strong> Within 24 hours</li>
        </ul>
      `
    }
  };

  // --- 8. MAIN APP CONTROLLER ---
  class App {
    constructor() {
      this.rubricManager = new RubricManager();
      this.aiService = new AiEvaluationService();
      this.creditManager = new CreditManager();
      this.authManager = new SupabaseAuthManager();
      this.currentPaper = null;
      this.currentSampleIndex = 0;
      this.isEvaluating = false;
      this.init();
    }

    async buyCreditPack(pack, amount, scans) {
      if (!this.authManager.user) {
        this.showNotification('Please sign in with Google first to buy credit packs.', 'info');
        this.authManager.signInWithGoogle();
        return;
      }

      if (typeof window.Razorpay === 'undefined') {
        return this.showNotification('Payment gateway is loading. Please try in a moment.', 'info');
      }

      this.showNotification(`Creating secure order for ${scans} scans (₹${amount})...`, 'info');

      try {
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pack,
            amount,
            scans,
            userId: this.authManager.user.id,
            userEmail: this.authManager.user.email,
            userName: this.authManager.profile?.full_name || ''
          })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || orderData.error) {
          throw new Error(orderData.error || 'Could not initiate payment order');
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'GradeCrow',
          description: `${scans} Exam Grading Scans (${(pack || '').toUpperCase()} Pack)`,
          image: 'https://gradecrow.vercel.app/favicon.svg',
          order_id: orderData.orderId,
          prefill: {
            name: this.authManager.profile?.full_name || '',
            email: this.authManager.user.email || ''
          },
          theme: {
            color: '#00a991'
          },
          handler: async (response) => {
            this.showNotification('Verifying payment with Razorpay...', 'info');
            try {
              const sessionData = await this.authManager.client?.auth.getSession();
              const userToken = sessionData?.data?.session?.access_token;

              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: this.authManager.user.id,
                  scans: scans,
                  pack: pack,
                  amount: amount,
                  userToken: userToken
                })
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.ok) {
                // Ensure Supabase DB is directly persisted
                if (this.authManager.client && this.authManager.user) {
                  try {
                    await this.authManager.client
                      .from('profiles')
                      .update({ credits_balance: verifyData.newBalance })
                      .eq('id', this.authManager.user.id);

                    await this.authManager.client
                      .from('credit_transactions')
                      .insert({
                        user_id: this.authManager.user.id,
                        amount: parseInt(scans, 10),
                        type: 'purchase',
                        description: `Purchased ${pack} Pack (${scans} scans for ₹${amount}) - Payment ID: ${response.razorpay_payment_id}`
                      });
                  } catch (syncErr) {
                    console.warn('Client DB sync notice:', syncErr);
                  }
                }

                if (this.authManager.profile) {
                  this.authManager.profile.credits_balance = verifyData.newBalance;
                }
                this.updateHeaderStats();
                document.getElementById('modal-pricing')?.classList.add('hidden');
                this.showNotification(`🎉 Payment successful! +${scans} scans added to your account.`, 'success');
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (vErr) {
              console.error(vErr);
              this.showNotification(`Verification notice: ${vErr.message}. Contact support@gradecrow.com`, 'error');
            }
          },
          modal: {
            ondismiss: () => {
              this.showNotification('Payment cancelled.', 'info');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error(err);
        this.showNotification(`Checkout error: ${err.message}`, 'error');
      }
    }

    async redeemCoupon(couponCode) {
      if (!couponCode) return { success: false, message: 'Please enter a coupon code.' };
      const code = couponCode.trim().toUpperCase();
      const validCoupons = ['REDDIT100', 'TEACHERS100', 'REDDITINDIA'];
      
      if (!validCoupons.includes(code)) {
        return { success: false, message: 'Invalid or expired promo code.' };
      }

      if (localStorage.getItem('gradecrow_coupon_' + code) === 'true') {
        return { success: false, message: `Promo code ${code} has already been claimed on this device.` };
      }

      // Add 100 scans to guest credit manager
      this.creditManager.addBonusCredits(100);

      // If user is authenticated with Supabase, credit their database profile as well
      if (this.authManager.profile) {
        const cur = this.authManager.profile.credits_balance || 0;
        this.authManager.profile.credits_balance = cur + 100;
        if (this.authManager.client) {
          try {
            await this.authManager.client.from('profiles').update({ credits_balance: cur + 100 }).eq('id', this.authManager.profile.id);
            await this.authManager.client.from('credit_transactions').insert({
              user_id: this.authManager.profile.id,
              amount: 100,
              type: 'promo_coupon',
              description: `Reddit Promo: ${code}`
            });
          } catch (e) {
            console.warn('Coupon profile credit error:', e);
          }
        }
      }

      localStorage.setItem('gradecrow_coupon_' + code, 'true');
      this.updateCreditsBadge();
      const msg = `🎉 Promo ${code} applied! 100 Free Exam Paper Scans added to your balance.`;
      this.showNotification(msg, 'success');
      return { success: true, message: msg };
    }

    init() {
      // Detect Coupon or Referral Code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const couponParam = urlParams.get('coupon') || urlParams.get('promo') || (urlParams.get('ref')?.toUpperCase().startsWith('REDDIT') ? urlParams.get('ref') : null);
      if (couponParam) {
        setTimeout(() => {
          this.redeemCoupon(couponParam);
        }, 800);
      }

      const refCode = urlParams.get('ref');
      if (refCode && !refCode.toUpperCase().startsWith('REDDIT')) {
        localStorage.setItem('gradecrow_ref_code', refCode.trim().toUpperCase());
        setTimeout(() => {
          this.showNotification(`🎁 Referral invite active! Sign in with Google to claim +100 bonus scans.`, 'success');
        }, 1200);
      }

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

      this.authManager.onAuthChange(() => {
        this.updateAuthUI();
        this.updateHeaderStats();
      });

      this.bindGlobalEvents();
      this.updateAuthUI();
      this.renderRubricUI();
      this.updateHeaderStats();
      this.updateQuickRubricSelect();
      this.updateCriteriaPreview();
      this.renderSamplePapersModal();
    }

    updateAuthUI() {
      const container = document.getElementById('auth-header-container');
      if (!container) return;

      const user = this.authManager.user;
      const profile = this.authManager.profile;

      if (!user) {
        // Logged Out
        container.innerHTML = `
          <button type="button" class="btn-google-login" id="btn-google-login" title="Sign in with Google">
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Sign In
          </button>
        `;
        container.querySelector('#btn-google-login')?.addEventListener('click', () => {
          this.authManager.signInWithGoogle();
        });
      } else {
        // Logged In
        const name = profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0];
        const firstName = name.split(' ')[0];
        const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`;
        const email = profile?.email || user.email;

        container.innerHTML = `
          <div class="user-menu-wrapper">
            <button type="button" class="user-avatar-trigger" id="btn-user-avatar" title="Account & Settings">
              <img src="${avatar}" class="user-avatar-img" alt="${firstName}" />
              <span class="user-name-text">${firstName}</span>
              <span class="user-caret">▾</span>
            </button>
            <div class="account-dropdown-menu hidden" id="account-dropdown-menu">
              <div class="dropdown-user-info">
                <img src="${avatar}" class="dropdown-avatar" />
                <div>
                  <div class="dropdown-name">${name}</div>
                  <div class="dropdown-email">${email}</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <button type="button" class="dropdown-item item-highlight" id="menu-btn-referral">
                🎁 Refer a Colleague (+100 Scans)
              </button>
              <button type="button" class="dropdown-item" id="menu-btn-pricing">
                🪙 Buy Credits (from ₹49)
              </button>
              <button type="button" class="dropdown-item" id="menu-btn-install-app">
                📱 Save as Web App (iOS/Android)
              </button>
              <button type="button" class="dropdown-item" id="menu-btn-settings">
                ⚙️ Settings & Custom Key
              </button>
              <div class="dropdown-divider"></div>
              <button type="button" class="dropdown-item item-danger" id="menu-btn-signout">
                🚪 Sign Out
              </button>
            </div>
          </div>
        `;

        const menuTrigger = container.querySelector('#btn-user-avatar');
        const dropdown = container.querySelector('#account-dropdown-menu');

        menuTrigger?.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown?.classList.toggle('hidden');
        });

        container.querySelector('#menu-btn-referral')?.addEventListener('click', () => {
          dropdown?.classList.add('hidden');
          this.openReferralModal();
        });

        container.querySelector('#menu-btn-pricing')?.addEventListener('click', () => {
          dropdown?.classList.add('hidden');
          document.getElementById('modal-pricing')?.classList.remove('hidden');
        });

        container.querySelector('#menu-btn-install-app')?.addEventListener('click', () => {
          dropdown?.classList.add('hidden');
          this.openInstallModal();
        });

        container.querySelector('#menu-btn-settings')?.addEventListener('click', () => {
          dropdown?.classList.add('hidden');
          this.openSettingsModal();
        });

        container.querySelector('#menu-btn-signout')?.addEventListener('click', () => {
          dropdown?.classList.add('hidden');
          this.authManager.signOut();
          this.showNotification('Signed out.', 'info');
        });
      }
    }

    openInstallModal() {
      const modal = document.getElementById('modal-install-app');
      if (!modal) return;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const tabIos = document.getElementById('tab-btn-ios');
      const tabAndroid = document.getElementById('tab-btn-android');
      const panelIos = document.getElementById('panel-install-ios');
      const panelAndroid = document.getElementById('panel-install-android');

      if (isIOS) {
        tabIos?.classList.add('active');
        tabAndroid?.classList.remove('active');
        panelIos?.classList.remove('hidden');
        panelAndroid?.classList.add('hidden');
      } else {
        tabAndroid?.classList.add('active');
        tabIos?.classList.remove('active');
        panelAndroid?.classList.remove('hidden');
        panelIos?.classList.add('hidden');
      }

      const directBtnBox = document.getElementById('pwa-direct-install-box');
      if (this.deferredInstallPrompt && directBtnBox) {
        directBtnBox.classList.remove('hidden');
      }

      modal.classList.remove('hidden');
    }

    openReferralModal() {
      const modal = document.getElementById('modal-referral');
      if (!modal) return;

      const code = this.authManager.profile?.referral_code || 'CROW';
      const refUrl = `https://gradecrow.vercel.app/?ref=${code}`;
      const inputUrl = document.getElementById('input-referral-url');
      const btnWhatsapp = document.getElementById('btn-whatsapp-share');
      const countStat = document.getElementById('referral-count-stat');
      const creditsStat = document.getElementById('referral-credits-stat');

      if (inputUrl) inputUrl.value = refUrl;
      if (countStat) countStat.textContent = this.authManager.profile?.referrals_count || 0;
      if (creditsStat) creditsStat.textContent = (this.authManager.profile?.referrals_count || 0) * 100;

      if (btnWhatsapp) {
        const shareMsg = `Hey! I'm using GradeCrow to grade handwritten exam papers in seconds. Use my link to get 100 free bonus scans: ${refUrl}`;
        btnWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;
      }

      modal.classList.remove('hidden');
    }

    openSettingsModal() {
      const inputApiKey = document.getElementById('input-gemini-key');
      const testFeedback = document.getElementById('api-test-feedback');
      const modalSettings = document.getElementById('modal-settings');
      if (inputApiKey) inputApiKey.value = this.aiService.loadApiKey();
      if (testFeedback) testFeedback.innerHTML = '';
      modalSettings?.classList.remove('hidden');
    }

    bindGlobalEvents() {
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => this.switchView(tab.dataset.view));
      });

      // Capture PWA beforeinstallprompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredInstallPrompt = e;
        const directBtnBox = document.getElementById('pwa-direct-install-box');
        if (directBtnBox) directBtnBox.classList.remove('hidden');
      });

      // Close dropdowns on outside click
      document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('account-dropdown-menu');
        const trigger = document.getElementById('btn-user-avatar');
        if (dropdown && !dropdown.classList.contains('hidden')) {
          if (!dropdown.contains(e.target) && !trigger?.contains(e.target)) {
            dropdown.classList.add('hidden');
          }
        }
      });

      // Install App Modal Handlers
      const modalInstall = document.getElementById('modal-install-app');
      const btnCloseInstall = document.getElementById('btn-close-install-modal');
      const btnDoneInstall = document.getElementById('btn-done-install-modal');
      const btnDirectInstall = document.getElementById('btn-pwa-direct-install');
      const tabIos = document.getElementById('tab-btn-ios');
      const tabAndroid = document.getElementById('tab-btn-android');
      const panelIos = document.getElementById('panel-install-ios');
      const panelAndroid = document.getElementById('panel-install-android');

      btnCloseInstall?.addEventListener('click', () => modalInstall?.classList.add('hidden'));
      btnDoneInstall?.addEventListener('click', () => modalInstall?.classList.add('hidden'));

      tabIos?.addEventListener('click', () => {
        tabIos.classList.add('active');
        tabAndroid?.classList.remove('active');
        panelIos?.classList.remove('hidden');
        panelAndroid?.classList.add('hidden');
      });

      tabAndroid?.addEventListener('click', () => {
        tabAndroid.classList.add('active');
        tabIos?.classList.remove('active');
        panelAndroid?.classList.remove('hidden');
        panelIos?.classList.add('hidden');
      });

      btnDirectInstall?.addEventListener('click', async () => {
        if (this.deferredInstallPrompt) {
          this.deferredInstallPrompt.prompt();
          const { outcome } = await this.deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            this.showNotification('✓ GradeCrow added to your home screen!', 'success');
            modalInstall?.classList.add('hidden');
          }
          this.deferredInstallPrompt = null;
        }
      });

      // Settings Modal
      const headerApiBadge = document.getElementById('header-api-status');
      const modalSettings = document.getElementById('modal-settings');
      const btnCloseSettings = document.getElementById('btn-close-settings');
      const btnCancelSettings = document.getElementById('btn-cancel-settings');
      const btnSaveApiKey = document.getElementById('btn-save-api-key');
      const btnTestApiKey = document.getElementById('btn-test-api-key');
      const inputApiKey = document.getElementById('input-gemini-key');
      const testFeedback = document.getElementById('api-test-feedback');

      headerApiBadge?.addEventListener('click', () => this.openSettingsModal());
      btnCloseSettings?.addEventListener('click', () => modalSettings?.classList.add('hidden'));
      btnCancelSettings?.addEventListener('click', () => modalSettings?.classList.add('hidden'));

      // Credits Limit Modal
      const modalCredits = document.getElementById('modal-credits-limit');
      const btnCloseCredits = document.getElementById('btn-close-credits-modal');
      const btnOpenPricingFromLimit = document.getElementById('btn-open-pricing-from-limit');
      const btnOpenReferralFromLimit = document.getElementById('btn-open-referral-from-limit');
      const linkOpenSettingsFromLimit = document.getElementById('link-open-settings-from-limit');

      btnCloseCredits?.addEventListener('click', () => modalCredits?.classList.add('hidden'));
      btnOpenPricingFromLimit?.addEventListener('click', () => {
        modalCredits?.classList.add('hidden');
        document.getElementById('modal-pricing')?.classList.remove('hidden');
      });
      btnOpenReferralFromLimit?.addEventListener('click', () => {
        modalCredits?.classList.add('hidden');
        this.openReferralModal();
      });
      linkOpenSettingsFromLimit?.addEventListener('click', (e) => {
        e.preventDefault();
        modalCredits?.classList.add('hidden');
        this.openSettingsModal();
      });

      // Referral Modal
      const modalReferral = document.getElementById('modal-referral');
      const btnCloseReferral = document.getElementById('btn-close-referral-modal');
      const btnCopyRefLink = document.getElementById('btn-copy-referral-link');

      btnCloseReferral?.addEventListener('click', () => modalReferral?.classList.add('hidden'));
      btnCopyRefLink?.addEventListener('click', () => {
        const inputUrl = document.getElementById('input-referral-url');
        if (inputUrl) {
          navigator.clipboard.writeText(inputUrl.value).then(() => {
            this.showNotification('✓ Referral link copied to clipboard!', 'success');
          }).catch(() => {
            inputUrl.select();
            document.execCommand('copy');
            this.showNotification('✓ Referral link copied!', 'success');
          });
        }
      });

      // Pricing Modal & Razorpay Buy Buttons
      const modalPricing = document.getElementById('modal-pricing');
      const btnClosePricing = document.getElementById('btn-close-pricing-modal');
      btnClosePricing?.addEventListener('click', () => modalPricing?.classList.add('hidden'));

      document.querySelectorAll('.btn-buy-pack').forEach(btn => {
        btn.addEventListener('click', () => {
          const pack = btn.dataset.pack;
          const amount = btn.dataset.amount;
          const scans = btn.dataset.scans;
          this.buyCreditPack(pack, amount, scans);
        });
      });

      // Coupon Redemption Button Handlers
      const btnApplyCoupon = document.getElementById('btn-apply-coupon');
      const inputCoupon = document.getElementById('input-coupon-code');
      const couponFeedback = document.getElementById('coupon-feedback');

      btnApplyCoupon?.addEventListener('click', async () => {
        const val = inputCoupon?.value;
        const res = await this.redeemCoupon(val);
        if (couponFeedback) {
          couponFeedback.textContent = res.message;
          couponFeedback.style.color = res.success ? '#065f46' : '#b91c1c';
        }
      });

      const btnApplyCouponLimit = document.getElementById('btn-apply-coupon-limit');
      const inputCouponLimit = document.getElementById('input-coupon-code-limit');
      const couponFeedbackLimit = document.getElementById('coupon-feedback-limit');

      btnApplyCouponLimit?.addEventListener('click', async () => {
        const val = inputCouponLimit?.value;
        const res = await this.redeemCoupon(val);
        if (couponFeedbackLimit) {
          couponFeedbackLimit.textContent = res.message;
          couponFeedbackLimit.style.color = res.success ? '#065f46' : '#b91c1c';
        }
        if (res.success) {
          setTimeout(() => {
            document.getElementById('modal-credits-limit')?.classList.add('hidden');
          }, 1500);
        }
      });

      // Mandatory Legal & Compliance Modals
      const modalLegal = document.getElementById('modal-legal');
      const btnCloseLegal = document.getElementById('btn-close-legal-modal');
      const btnDoneLegal = document.getElementById('btn-done-legal-modal');
      const legalTitle = document.getElementById('legal-modal-title');
      const legalBody = document.getElementById('legal-modal-body');

      document.querySelectorAll('.footer-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const docKey = btn.dataset.legal;
          const doc = LEGAL_DOCS[docKey];
          if (doc && legalTitle && legalBody) {
            legalTitle.textContent = doc.title;
            legalBody.innerHTML = doc.html;
            modalLegal?.classList.remove('hidden');
          }
        });
      });

      btnCloseLegal?.addEventListener('click', () => modalLegal?.classList.add('hidden'));
      btnDoneLegal?.addEventListener('click', () => modalLegal?.classList.add('hidden'));

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
      const schemeUploadBox = document.getElementById('scheme-upload-box');
      const schemeModalDesc = document.getElementById('scheme-modal-desc');
      const schemeScanningStage = document.getElementById('scheme-scanning-stage');
      const schemeDynamicStatus = document.getElementById('scheme-dynamic-status');
      const schemeModalFooter = document.getElementById('scheme-modal-footer');

      this.currentSchemePages = [];
      this.activeSchemePageIndex = 0;

      const schemePageBadge = document.getElementById('scheme-page-badge');
      const schemeThumbnailsContainer = document.getElementById('scheme-thumbnails-container');
      const btnAddSchemePage = document.getElementById('btn-add-scheme-page');

      const updateSchemePreviewUI = () => {
        if (!this.currentSchemePages || this.currentSchemePages.length === 0) {
          this.currentSchemeSrc = null;
          if (schemePreviewImg) schemePreviewImg.src = '';
          schemePreviewArea?.classList.add('hidden');
          schemePlaceholder?.classList.remove('hidden');
          if (btnSubmitScanScheme) btnSubmitScanScheme.disabled = true;
          return;
        }

        schemePlaceholder?.classList.add('hidden');
        schemePreviewArea?.classList.remove('hidden');
        if (btnSubmitScanScheme) btnSubmitScanScheme.disabled = false;

        const count = this.currentSchemePages.length;
        if (schemePageBadge) {
          schemePageBadge.textContent = count === 1 ? '📄 1 Page Loaded' : `📄 Question Paper (${count} Pages Loaded)`;
        }

        if (this.activeSchemePageIndex >= count) this.activeSchemePageIndex = count - 1;
        if (this.activeSchemePageIndex < 0) this.activeSchemePageIndex = 0;

        this.currentSchemeSrc = this.currentSchemePages[this.activeSchemePageIndex];
        if (schemePreviewImg) schemePreviewImg.src = this.currentSchemeSrc;

        if (schemeThumbnailsContainer) {
          if (count <= 1) {
            schemeThumbnailsContainer.innerHTML = '';
            schemeThumbnailsContainer.classList.add('hidden');
          } else {
            schemeThumbnailsContainer.classList.remove('hidden');
            schemeThumbnailsContainer.innerHTML = this.currentSchemePages.map((src, idx) => `
              <div class="scheme-thumb-item ${idx === this.activeSchemePageIndex ? 'active' : ''}" data-index="${idx}" style="cursor: pointer; border: 2px solid ${idx === this.activeSchemePageIndex ? 'var(--color-primary)' : '#e2e8f0'}; border-radius: 6px; overflow: hidden; position: relative; width: 44px; height: 56px; flex-shrink: 0; background: #000;">
                <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.65); color: #fff; font-size: 0.65rem; text-align: center; font-weight: 700;">${idx + 1}</span>
              </div>
            `).join('');

            schemeThumbnailsContainer.querySelectorAll('.scheme-thumb-item').forEach(el => {
              el.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(el.dataset.index, 10);
                this.activeSchemePageIndex = idx;
                updateSchemePreviewUI();
              });
            });
          }
        }
      };

      const openScanSchemeModal = () => {
        this.currentSchemePages = [];
        this.activeSchemePageIndex = 0;
        updateSchemePreviewUI();
        schemeUploadBox?.classList.remove('hidden');
        schemeModalDesc?.classList.remove('hidden');
        schemeModalFooter?.classList.remove('hidden');
        schemeScanningStage?.classList.add('hidden');
        modalScanScheme?.classList.remove('hidden');
      };

      btnQuickScanScheme?.addEventListener('click', openScanSchemeModal);
      btnCloseScanScheme?.addEventListener('click', () => modalScanScheme?.classList.add('hidden'));
      btnCancelScanScheme?.addEventListener('click', () => modalScanScheme?.classList.add('hidden'));

      let isAppendingPages = false;

      const handleSchemeFilesSelected = async (fileList, append = false) => {
        if (!fileList || !fileList.length) return;
        const files = Array.from(fileList);
        if (!append) {
          this.currentSchemePages = [];
        }

        const newPages = [];

        // Check if PDF file uploaded
        const pdfFile = files.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
        if (pdfFile) {
          try {
            const pdfPages = await this.renderPdfFile(pdfFile);
            if (pdfPages && pdfPages.length > 0) {
              newPages.push(...pdfPages);
            }
          } catch (pdfErr) {
            console.error('Scheme PDF rendering error:', pdfErr);
            this.showNotification('Error reading PDF file: ' + pdfErr.message, 'error');
          }
        } else {
          // Images
          const imageFiles = files.filter(f => f.type.startsWith('image/'));
          for (const imgFile of imageFiles) {
            const dataUrl = await new Promise(resolve => {
              const r = new FileReader();
              r.onload = e => resolve(e.target.result);
              r.readAsDataURL(imgFile);
            });
            if (dataUrl) newPages.push(dataUrl);
          }
        }

        if (newPages.length > 0) {
          this.currentSchemePages.push(...newPages);
          this.activeSchemePageIndex = append ? (this.currentSchemePages.length - newPages.length) : 0;
          updateSchemePreviewUI();
        }
      };

      btnTriggerSchemeCamera?.addEventListener('click', (e) => {
        e.stopPropagation();
        isAppendingPages = false;
        inputSchemeCamera?.click();
      });
      btnTriggerSchemeFile?.addEventListener('click', (e) => {
        e.stopPropagation();
        isAppendingPages = false;
        inputSchemeFile?.click();
      });
      btnAddSchemePage?.addEventListener('click', (e) => {
        e.stopPropagation();
        isAppendingPages = true;
        inputSchemeFile?.click();
      });

      inputSchemeCamera?.addEventListener('change', (e) => {
        handleSchemeFilesSelected(e.target.files, isAppendingPages);
        e.target.value = '';
      });
      inputSchemeFile?.addEventListener('change', (e) => {
        handleSchemeFilesSelected(e.target.files, isAppendingPages);
        e.target.value = '';
      });

      btnRetakeScheme?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentSchemePages = [];
        this.activeSchemePageIndex = 0;
        updateSchemePreviewUI();
      });

      btnSubmitScanScheme?.addEventListener('click', async () => {
        if (!this.currentSchemePages || this.currentSchemePages.length === 0) return;
        btnSubmitScanScheme.disabled = true;

        // Show Animated Crow Scanning Stage & hide input form
        schemeUploadBox?.classList.add('hidden');
        schemeModalDesc?.classList.add('hidden');
        schemeModalFooter?.classList.add('hidden');
        schemeScanningStage?.classList.remove('hidden');

        const pageCount = this.currentSchemePages.length;
        const scanMessages = [
          `🦅 Crow-Eye OCR analyzing ${pageCount} page(s) of handwritten question paper...`,
          '⚖️ Reading marks allocation (1 mark, 1.5 marks, 2 marks) across all questions...',
          '🧠 Extracting key concepts & required vocabulary...',
          '✍️ Formulating editable Question Checklist...'
        ];
        let msgIndex = 0;
        if (schemeDynamicStatus) schemeDynamicStatus.textContent = scanMessages[0];
        const statusInterval = setInterval(() => {
          msgIndex = (msgIndex + 1) % scanMessages.length;
          if (schemeDynamicStatus) schemeDynamicStatus.textContent = scanMessages[msgIndex];
        }, 3500);

        try {
          const parsed = await this.aiService.parseQuestionSchemeFromImage({
            pagesBase64: this.currentSchemePages,
            imageSrc: this.currentSchemePages[0],
            progressCallback: (msg) => {
              if (schemeDynamicStatus) schemeDynamicStatus.textContent = msg;
            }
          });

          clearInterval(statusInterval);
          this.rubricManager.loadScannedQuestion(parsed);
          modalScanScheme?.classList.add('hidden');
          this.switchView('rubric');
          this.showNotification(`✓ ${pageCount} page(s) of question & marking scheme scanned! You can edit any point below.`, 'success');
        } catch (err) {
          clearInterval(statusInterval);
          console.error(err);
          this.showNotification(`Could not parse question: ${err.message}`, 'error');
          openScanSchemeModal();
        } finally {
          btnSubmitScanScheme.disabled = false;
        }
      });

      // View 6-Question Example Paper Modal logic
      const modalViewExample = document.getElementById('modal-view-example-paper');
      const btnCloseViewExample = document.getElementById('btn-close-view-example');
      const btnCloseExampleModalFooter = document.getElementById('btn-close-example-modal-footer');
      const btnLoadExamplePaper = document.getElementById('btn-load-example-paper-into-rubric');
      const examplePaperModalBody = document.getElementById('example-paper-modal-body');

      const btnQuickViewExample = document.getElementById('btn-quick-view-example');
      const btnPillsViewExample = document.getElementById('btn-pills-view-example');

      const renderExamplePaperModalContent = () => {
        const examplePreset = PRESET_RUBRICS.find(p => p.id === 'preset-6-question-master') || PRESET_RUBRICS[0];
        const questions = examplePreset.questions || [];

        let html = `
          <div style="background: linear-gradient(135deg, rgba(0, 169, 145, 0.08) 0%, rgba(31, 37, 46, 0.03) 100%); border: 1px solid rgba(0, 169, 145, 0.25); border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-primary); background: rgba(0,169,145,0.15); padding: 3px 10px; border-radius: 20px;">
                  ${examplePreset.subject || 'Human Physiology & Clinical Science'}
                </span>
                <h4 style="margin: 8px 0 2px; font-size: 1.15rem; color: var(--text-main); font-weight: 800;">
                  ${examplePreset.examTitle || examplePreset.question}
                </h4>
                <p style="margin: 0; font-size: 0.82rem; color: var(--text-secondary);">
                  Complete exam structure showing 6 questions, score weights, keyword vocabulary, and model answer bullets.
                </p>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <span style="background: var(--color-primary); color: #fff; padding: 5px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 2px 6px rgba(0,169,145,0.3);">
                  🏆 30.0 Total Marks
                </span>
                <span style="background: #1F252E; color: #fff; padding: 5px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
                  📝 6 Questions
                </span>
              </div>
            </div>
          </div>

          <div class="example-questions-list" style="display: flex; flex-direction: column; gap: 1.25rem;">
        `;

        questions.forEach((q) => {
          html += `
            <div class="example-question-card" style="border: 1px solid var(--border-color); border-radius: 12px; padding: 1.1rem; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
                <h5 style="margin: 0; font-size: 0.98rem; font-weight: 800; color: var(--text-main); line-height: 1.4;">
                  ${q.title}
                </h5>
                <span style="flex-shrink: 0; background: rgba(0, 169, 145, 0.12); color: var(--color-primary); font-weight: 800; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;">
                  ${q.maxMarks.toFixed(1)} Marks
                </span>
              </div>

              <!-- Answer Criteria & Points Breakdown -->
              <div style="margin-bottom: 0.75rem;">
                <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.4rem; letter-spacing: 0.04em;">
                  🎯 Answer Criteria & Point Allocation:
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          `;

          (q.keyPoints || []).forEach((kp, kIdx) => {
            html += `
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--color-primary);">
                <div style="font-size: 0.85rem; color: var(--text-main); font-weight: 500; line-height: 1.35;">
                  <strong>Point ${kIdx + 1}:</strong> ${kp.text}
                  ${kp.keywords && kp.keywords.length > 0 ? `
                    <div style="margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap;">
                      ${kp.keywords.map(kw => `<span style="font-size: 0.7rem; background: #e2e8f0; color: #334155; padding: 1px 6px; border-radius: 4px;">#${kw}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
                <span style="font-size: 0.78rem; font-weight: 800; color: var(--color-primary); background: #ffffff; padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(0,169,145,0.3); flex-shrink: 0;">
                  +${kp.weight.toFixed(2)} M
                </span>
              </div>
            `;
          });

          html += `
                </div>
              </div>
          `;

          if (q.sampleAnswers && q.sampleAnswers.length > 0) {
            html += `
              <div style="background: #f0fdfa; border: 1px dashed rgba(0, 169, 145, 0.35); border-radius: 8px; padding: 0.75rem 1rem;">
                <div style="font-size: 0.78rem; font-weight: 700; color: #0d9488; margin-bottom: 0.35rem;">
                  💡 Model Answer Bullets & Key Concepts:
                </div>
                <ul style="margin: 0; padding-left: 1.1rem; font-size: 0.82rem; color: #134e4a; line-height: 1.5;">
                  ${q.sampleAnswers.map(ans => `<li>${ans}</li>`).join('')}
                </ul>
              </div>
            `;
          }

          html += `</div>`;
        });

        html += `</div>`;
        return html;
      };

      const openExampleModal = () => {
        if (examplePaperModalBody) {
          examplePaperModalBody.innerHTML = renderExamplePaperModalContent();
        }
        modalViewExample?.classList.remove('hidden');
      };

      this.openExampleModal = openExampleModal;

      btnQuickViewExample?.addEventListener('click', openExampleModal);
      btnPillsViewExample?.addEventListener('click', openExampleModal);
      btnCloseViewExample?.addEventListener('click', () => modalViewExample?.classList.add('hidden'));
      btnCloseExampleModalFooter?.addEventListener('click', () => modalViewExample?.classList.add('hidden'));

      btnLoadExamplePaper?.addEventListener('click', () => {
        const examplePreset = PRESET_RUBRICS.find(p => p.id === 'preset-6-question-master') || PRESET_RUBRICS[0];
        this.rubricManager.setMultiQuestionRubric(examplePreset);
        modalViewExample?.classList.add('hidden');
        this.switchView('rubric');
        this.showNotification(`✓ Loaded Master 6-Question Exam Paper (30 Marks total)!`, 'success');
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
      if (!this.authManager.canScan(hasCustomKey, this.creditManager)) {
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
          pages: this.capture.pages,
          rawText: this.capture.currentMeta?.rawText,
          rubric: rubric,
          sampleMeta: this.capture.currentMeta,
          progressCallback: (statusText) => this.showEvaluationLoading(statusText)
        });

        await this.authManager.useScan(hasCustomKey, this.creditManager);
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
        await this.authManager.useScan(hasCustomKey, this.creditManager);
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
          <div class="loading-title">GradeCrow is Inspecting Paper</div>
          <div class="loading-subtitle">${customStatus || 'Analyzing handwriting, math formulas & rubric...'}</div>
          <div class="loading-steps-list">
            <div class="step-item active"><span class="step-dot"></span> 🦅 Crow-Eye OCR Handwriting Analysis...</div>
            <div class="step-item active"><span class="step-dot"></span> ⚖️ Question Criteria, Math & Diagram Verification...</div>
            <div class="step-item active"><span class="step-dot"></span> ✍️ Decimal Score Calculation & Evidence Quotes...</div>
          </div>
        </div>
      `;
    }

    handleAcceptAndNext(record) {
      this.gradebook.addRecord(record);
      this.showNotification(`✓ Score logged: ${record.studentName} (${record.finalScore}/${record.maxMarks})`, 'success');

      // Check if we have an active Batch Queue
      if (this.capture.batchQueue && this.capture.batchQueue.length > 0) {
        const nextBatchIdx = this.capture.activeBatchIndex + 1;
        if (nextBatchIdx < this.capture.batchQueue.length) {
          this.capture.switchBatch(nextBatchIdx);
          this.reviewPanel.renderEmptyState();
          this.updateHeaderStats();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

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
      const userCredits = this.authManager.getCredits(hasCustomKey);
      const isUser = Boolean(this.authManager.user);

      if (creditsBadge) {
        if (hasCustomKey) {
          creditsBadge.className = 'header-credits-badge unlimited';
          creditsBadge.innerHTML = `✨ Unlimited`;
          creditsBadge.title = 'Custom API Key Active (Unlimited Scans)';
        } else if (isUser && userCredits !== null) {
          if (userCredits > 10) {
            creditsBadge.className = 'header-credits-badge';
          } else if (userCredits > 0) {
            creditsBadge.className = 'header-credits-badge low';
          } else {
            creditsBadge.className = 'header-credits-badge zero';
          }
          creditsBadge.innerHTML = `🦅 <span id="credits-count">${userCredits}</span> Scans`;
          creditsBadge.title = `${userCredits} scans available in your Google account`;
        } else {
          const remaining = this.creditManager.getRemaining(false);
          if (remaining > 2) {
            creditsBadge.className = 'header-credits-badge';
          } else if (remaining > 0) {
            creditsBadge.className = 'header-credits-badge low';
          } else {
            creditsBadge.className = 'header-credits-badge zero';
          }
          creditsBadge.innerHTML = `🦅 <span id="credits-count">${remaining}</span>/5 Free`;
          creditsBadge.title = `${remaining} free guest scans remaining today`;
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
              <button type="button" class="btn btn-secondary btn-sm" id="btn-view-example-paper-editor" title="View 6-Question Example Paper with Keys & Scores">
                👁️ View Example
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-scan-scheme-from-editor">
                📸 Scan Scheme
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-new-blank-rubric">
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
              <button type="button" class="btn-save-prominent" id="btn-save-custom-rubric">
                💾 Save Question
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

          <!-- Prominent Bottom Save & Grade Action Bar -->
          <div class="question-bottom-actions">
            <button type="button" class="btn btn-secondary" id="btn-save-question-bottom">
              💾 Save Question
            </button>
            <button type="button" class="btn btn-primary btn-lg" id="btn-save-and-grade" style="font-weight: 800; padding: 0.65rem 1.5rem;">
              💾 Save & Grade With This Question ➔
            </button>
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

      const handleSave = () => {
        this.rubricManager.saveCurrentAsPreset();
        this.showNotification('✓ Question saved to question bank!', 'success');
      };

      c.querySelector('#btn-save-custom-rubric')?.addEventListener('click', handleSave);
      c.querySelector('#btn-save-question-bottom')?.addEventListener('click', handleSave);

      c.querySelector('#btn-save-and-grade')?.addEventListener('click', () => {
        this.rubricManager.saveCurrentAsPreset();
        this.switchView('grading');
        this.showNotification('✓ Question saved! Ready to grade student sheets.', 'success');
      });

      c.querySelector('#select-rubric-preset')?.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification('Question loaded!', 'info');
      });

      c.querySelector('#btn-view-example-paper-editor')?.addEventListener('click', () => {
        this.openExampleModal?.();
      });

      c.querySelector('#input-rubric-subject')?.addEventListener('input', (e) => {
        this.rubricManager.setQuestionMeta({ subject: e.target.value });
      });

      c.querySelector('#input-rubric-maxmarks')?.addEventListener('input', (e) => {
        this.rubricManager.setQuestionMeta({ maxMarks: e.target.value });
      });

      c.querySelector('#input-rubric-question')?.addEventListener('input', (e) => {
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
        item.querySelector('.kp-text-input')?.addEventListener('input', (e) => {
          this.rubricManager.updateKeyPoint(id, { text: e.target.value });
        });
        item.querySelector('.kp-keywords-input')?.addEventListener('input', (e) => {
          this.rubricManager.updateKeyPoint(id, { keywords: e.target.value });
        });
        item.querySelector('.kp-weight-input')?.addEventListener('input', (e) => {
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

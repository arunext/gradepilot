// AnatomiGrade AI - Batch Gradebook & Analytics Module
import { renderIcon } from './icons.js';

export class GradebookManager {
  constructor(options = {}) {
    this.container = options.container;
    this.records = this.loadRecords();
    this.onViewDetail = options.onViewDetail || (() => {});
    this.init();
  }

  loadRecords() {
    try {
      const stored = localStorage.getItem('anatomigrade_gradebook_records');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load gradebook records', e);
    }
    // Seed with 2 demo records if empty
    return [
      {
        id: 'grade-demo-1',
        studentName: 'Anya Sharma',
        rollNo: 'MED-2024-001',
        subject: 'Human Anatomy - Paper I',
        question: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
        finalScore: 9.25,
        aiScore: 9.25,
        maxMarks: 10.0,
        isOverridden: false,
        professorRemarks: 'Excellent schematic diagram and clinical notes.',
        timestamp: '11:42 AM',
        date: '2026-08-16'
      },
      {
        id: 'grade-demo-2',
        studentName: 'David Chen',
        rollNo: 'MED-2024-002',
        subject: 'Human Anatomy - Paper I',
        question: 'Describe the formation, relations, branches, and applied anatomy of the Brachial Plexus.',
        finalScore: 6.0,
        aiScore: 5.75,
        maxMarks: 10.0,
        isOverridden: true,
        professorRemarks: 'Gave 0.25 bonus for clean trunk identification.',
        timestamp: '11:46 AM',
        date: '2026-08-16'
      }
    ];
  }

  saveRecords() {
    try {
      localStorage.setItem('anatomigrade_gradebook_records', JSON.stringify(this.records));
    } catch (e) {
      console.warn('Failed to persist gradebook', e);
    }
  }

  addRecord(record) {
    // Check if rollNo already exists, update if so, else prepend
    const existingIndex = this.records.findIndex(r => r.rollNo === record.rollNo && r.question === record.question);
    if (existingIndex >= 0) {
      this.records[existingIndex] = record;
    } else {
      this.records.unshift(record);
    }
    this.saveRecords();
    this.render();
  }

  deleteRecord(id) {
    this.records = this.records.filter(r => r.id !== id);
    this.saveRecords();
    this.render();
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all gradebook records for this session?')) {
      this.records = [];
      this.saveRecords();
      this.render();
    }
  }

  init() {
    this.render();
  }

  getStats() {
    const total = this.records.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgPercentage: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        timeSavedMinutes: 0
      };
    }

    let sumScores = 0;
    let sumPercentages = 0;
    let passCount = 0;
    let high = 0;
    let low = 999;

    this.records.forEach(r => {
      const pct = (r.finalScore / r.maxMarks) * 100;
      sumScores += r.finalScore;
      sumPercentages += pct;
      if (pct >= 50) passCount++;
      if (r.finalScore > high) high = r.finalScore;
      if (r.finalScore < low) low = r.finalScore;
    });

    const avgScore = Number((sumScores / total).toFixed(2));
    const avgPercentage = Math.round(sumPercentages / total);
    const passRate = Math.round((passCount / total) * 100);
    // Professor takes ~4 mins manually per paper vs 20 seconds with AnatomiGrade = ~3.6 mins saved per paper
    const timeSavedMinutes = Math.round(total * 3.6);

    return {
      total,
      avgScore,
      avgPercentage,
      highestScore: high,
      lowestScore: low === 999 ? 0 : low,
      passRate,
      timeSavedMinutes
    };
  }

  render() {
    if (!this.container) return;

    const stats = this.getStats();

    this.container.innerHTML = `
      <div class="gradebook-panel">
        
        <!-- Top Stats Row -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap icon-blue">${renderIcon('fileText')}</div>
            <div class="stat-info">
              <div class="stat-label">Papers Graded</div>
              <div class="stat-value">${stats.total}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-teal">${renderIcon('barChart')}</div>
            <div class="stat-info">
              <div class="stat-label">Class Average</div>
              <div class="stat-value">${stats.avgScore} <span class="stat-sub">(${stats.avgPercentage}%)</span></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-emerald">${renderIcon('checkCircle')}</div>
            <div class="stat-info">
              <div class="stat-label">Pass Rate</div>
              <div class="stat-value">${stats.passRate}%</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-amber">${renderIcon('zap')}</div>
            <div class="stat-info">
              <div class="stat-label">Time Saved</div>
              <div class="stat-value">~${stats.timeSavedMinutes} <span class="stat-sub">mins</span></div>
            </div>
          </div>
        </div>

        <!-- Gradebook Controls -->
        <div class="gradebook-header-row">
          <div class="header-left">
            <h3>Batch Gradebook Roster</h3>
            <span class="sub-count">${this.records.length} records in active session</span>
          </div>
          <div class="header-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-csv">
              ${renderIcon('download')} Export CSV
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-print-report">
              ${renderIcon('fileText')} Print Summary
            </button>
            <button type="button" class="btn btn-outline btn-sm text-danger" id="btn-clear-gradebook">
              ${renderIcon('trash')} Clear
            </button>
          </div>
        </div>

        <!-- Records Table -->
        <div class="table-responsive">
          <table class="gradebook-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Subject / Exam</th>
                <th>Score</th>
                <th>Status</th>
                <th>Notes / Remarks</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.records.length === 0 ? `
                <tr>
                  <td colspan="8" class="text-center py-6 text-muted">
                    No graded papers yet. Complete your first paper review to view records here!
                  </td>
                </tr>
              ` : this.records.map(r => {
                const pct = Math.round((r.finalScore / r.maxMarks) * 100);
                const isPass = pct >= 50;
                return `
                  <tr data-record-id="${r.id}">
                    <td><strong>${r.rollNo}</strong></td>
                    <td>${r.studentName}</td>
                    <td class="text-truncate" style="max-width: 180px;" title="${r.question}">${r.subject}</td>
                    <td>
                      <span class="score-pill ${isPass ? 'score-pass' : 'score-fail'}">
                        ${r.finalScore.toFixed(2)} / ${r.maxMarks.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      ${r.isOverridden ? `
                        <span class="badge-tag badge-amber" title="Professor adjusted from ${r.aiScore}">Overridden</span>
                      ` : `
                        <span class="badge-tag badge-green" title="Directly accepted AI score">AI Accepted</span>
                      `}
                    </td>
                    <td class="text-truncate text-muted" style="max-width: 200px;" title="${r.professorRemarks || ''}">
                      ${r.professorRemarks || '—'}
                    </td>
                    <td class="text-sm text-muted">${r.timestamp}</td>
                    <td>
                      <button type="button" class="btn-icon-subtle btn-del-row" data-id="${r.id}" title="Remove record">
                        ${renderIcon('trash')}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    if (!this.container) return;

    // Export CSV
    const btnExport = this.container.querySelector('#btn-export-csv');
    if (btnExport) btnExport.addEventListener('click', () => this.exportCsv());

    // Print
    const btnPrint = this.container.querySelector('#btn-print-report');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    // Clear
    const btnClear = this.container.querySelector('#btn-clear-gradebook');
    if (btnClear) btnClear.addEventListener('click', () => this.clearAll());

    // Delete single row
    this.container.querySelectorAll('.btn-del-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        this.deleteRecord(id);
      });
    });
  }

  exportCsv() {
    if (this.records.length === 0) {
      alert('No gradebook records to export.');
      return;
    }

    const headers = ['Roll No', 'Student Name', 'Subject', 'Question', 'Final Score', 'Max Marks', 'Percentage', 'AI Score', 'Is Overridden', 'Professor Remarks', 'Date', 'Time'];
    const rows = this.records.map(r => [
      `"${r.rollNo}"`,
      `"${r.studentName}"`,
      `"${r.subject}"`,
      `"${(r.question || '').replace(/"/g, '""')}"`,
      r.finalScore,
      r.maxMarks,
      `${Math.round((r.finalScore / r.maxMarks) * 100)}%`,
      r.aiScore,
      r.isOverridden ? 'YES' : 'NO',
      `"${(r.professorRemarks || '').replace(/"/g, '""')}"`,
      `"${r.date}"`,
      `"${r.timestamp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AnatomiGrade_Assessment_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

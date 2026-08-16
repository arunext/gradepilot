// AnatomiGrade AI - Professor Review & Evaluation Panel Module
import { renderIcon } from './icons.js';

export class ReviewPanel {
  constructor(options = {}) {
    this.container = options.container;
    this.onAcceptAndNext = options.onAcceptAndNext || (() => {});
    this.onScoreChanged = options.onScoreChanged || (() => {});

    this.currentEvaluation = null;
    this.currentPaperMeta = null;
    this.currentRubric = null;

    this.finalScore = 0;
    this.isOverridden = false;
    this.professorRemarks = '';
    this.isEditingTranscript = false;

    this.init();
  }

  init() {
    this.renderEmptyState();
  }

  renderEmptyState() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="review-empty-state">
        <div class="empty-icon">${renderIcon('sparkles')}</div>
        <h3>Ready for AI Evaluation</h3>
        <p>Select a student paper on the left or take a photo, then tap <strong>"Run AI Evaluation"</strong> to generate automated grading and keypoint matching.</p>
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
    const maxMarks = this.currentRubric?.maxMarks || evalData.maxMarks || 10.0;
    const percentage = Math.round((this.finalScore / maxMarks) * 100);

    const isLive = evalData.mode === 'gemini-live';

    this.container.innerHTML = `
      <div class="review-panel-inner animate-fade-in">
        
        <!-- Professor Score Hero Card -->
        <div class="score-hero-card ${this.isOverridden ? 'score-overridden' : ''}">
          <div class="score-hero-header">
            <div class="student-info-block">
              <span class="roll-badge">${meta.rollNo}</span>
              <span class="student-name">${meta.studentName}</span>
            </div>
            <div class="ai-source-badge ${isLive ? 'badge-live' : 'badge-offline'}">
              ${renderIcon('sparkles')} ${isLive ? 'Gemini 1.5 Flash Vision' : 'Smart Offline NLP'}
            </div>
          </div>

          <div class="score-main-display">
            <div class="score-number-group">
              <div class="score-value-wrap">
                <input 
                  type="number" 
                  id="input-final-score" 
                  class="score-input-direct" 
                  value="${this.finalScore}" 
                  step="0.25" 
                  min="0" 
                  max="${maxMarks}" 
                />
                <span class="score-max">/ ${maxMarks.toFixed(1)}</span>
              </div>
              <div class="score-percentage-pill">${percentage}% (${this.getGradeBadge(percentage)})</div>
            </div>

            <!-- Score Adjustment Quick Chips -->
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
              <span>⚠️ Score overridden by Professor (Original AI: <strong>${evalData.suggestedScore}</strong>)</span>
              <button type="button" class="btn-link" id="btn-revert-score">Revert to AI Score</button>
            </div>
          ` : ''}
        </div>

        <!-- Student Feedback Summary Box -->
        <div class="feedback-summary-box">
          <div class="box-title">
            <span>📝 AI Assessment Summary</span>
          </div>
          <p class="feedback-text">${evalData.feedbackSummary || 'All key criteria evaluated.'}</p>
        </div>

        <!-- Key Points Breakdown Checklist -->
        <div class="criteria-section">
          <div class="criteria-header">
            <h4>Rubric Key Points Checklist (${evalData.points.length})</h4>
            <span class="criteria-subtext">Click badges to toggle Hit / Partial / Missed</span>
          </div>

          <div class="criteria-list">
            ${evalData.points.map((pt, idx) => {
              const statusClass = pt.status === 'hit' ? 'status-hit' : pt.status === 'partial' ? 'status-partial' : 'status-missed';
              const statusLabel = pt.status === 'hit' ? 'Hit (Full)' : pt.status === 'partial' ? 'Partial' : 'Missed';
              return `
                <div class="criterion-card ${statusClass}" data-point-id="${pt.pointId}" data-index="${idx}">
                  <div class="criterion-top-row">
                    <div class="criterion-num">Point ${idx + 1}</div>
                    <div class="criterion-score-badge">
                      <span class="awarded-val">${pt.awardedMarks.toFixed(2)}</span> / ${pt.weight.toFixed(2)} Marks
                    </div>
                  </div>

                  <div class="criterion-desc">${pt.pointText}</div>

                  <!-- Evidence citation from student handwriting -->
                  <div class="criterion-evidence">
                    <span class="evidence-icon">❝</span>
                    <span class="evidence-quote">${pt.evidenceQuote}</span>
                  </div>

                  <div class="criterion-justification">
                    💡 <em>${pt.justification}</em>
                  </div>

                  <!-- Interactive override toggles for professor -->
                  <div class="criterion-toggles">
                    <button type="button" class="btn-toggle-status ${pt.status === 'hit' ? 'active-hit' : ''}" data-action="hit">
                      ✓ Full (${pt.weight.toFixed(2)})
                    </button>
                    <button type="button" class="btn-toggle-status ${pt.status === 'partial' ? 'active-partial' : ''}" data-action="partial">
                      ½ Half (${(pt.weight * 0.5).toFixed(2)})
                    </button>
                    <button type="button" class="btn-toggle-status ${pt.status === 'missed' ? 'active-missed' : ''}" data-action="missed">
                      ✕ 0 Marks
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Transcribed Student Text Viewer & Correction -->
        <div class="transcription-drawer">
          <div class="drawer-header" id="toggle-transcript-view">
            <span>📄 Extracted OCR Handwriting Transcription</span>
            <button type="button" class="btn-xs btn-outline" id="btn-toggle-edit-transcript">
              ${this.isEditingTranscript ? 'Save Edit' : 'Edit OCR'}
            </button>
          </div>
          <div class="drawer-content">
            ${this.isEditingTranscript ? `
              <textarea id="textarea-ocr-edit" class="transcript-editor" rows="6">${evalData.transcription}</textarea>
            ` : `
              <div class="transcript-preview">${evalData.transcription.replace(/\n/g, '<br/>')}</div>
            `}
          </div>
        </div>

        <!-- Professor Remarks Box -->
        <div class="professor-notes-section">
          <label for="input-prof-remarks">Professor Remarks / Student Guidance:</label>
          <input 
            type="text" 
            id="input-prof-remarks" 
            class="input-control" 
            placeholder="e.g. Good diagram. Needs clearer clinical correlation with Erb's palsy." 
            value="${this.professorRemarks}"
          />
        </div>

        <!-- Bottom Action Bar: Accept & Next Loop -->
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
    if (!this.container) return;

    // Score direct input
    const scoreInput = this.container.querySelector('#input-final-score');
    if (scoreInput) {
      scoreInput.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        const max = this.currentRubric?.maxMarks || 10.0;
        if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(max, Number(val.toFixed(2))));
        this.updateFinalScore(val, true);
      });
    }

    // Delta chips (-1, -0.5, +0.5, etc.)
    this.container.querySelectorAll('.btn-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseFloat(btn.dataset.delta);
        const max = this.currentRubric?.maxMarks || 10.0;
        let newScore = Math.max(0, Math.min(max, Number((this.finalScore + delta).toFixed(2))));
        this.updateFinalScore(newScore, true);
      });
    });

    // Revert button
    const btnRevert = this.container.querySelector('#btn-revert-score');
    if (btnRevert) {
      btnRevert.addEventListener('click', () => {
        this.updateFinalScore(this.currentEvaluation.suggestedScore, false);
      });
    }

    // Interactive point status toggles
    this.container.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.criterion-card');
        const pointId = card.dataset.pointId;
        const action = btn.dataset.action; // 'hit', 'partial', 'missed'
        this.togglePointStatus(pointId, action);
      });
    });

    // Transcript edit toggle
    const btnEditTranscript = this.container.querySelector('#btn-toggle-edit-transcript');
    if (btnEditTranscript) {
      btnEditTranscript.addEventListener('click', () => {
        if (this.isEditingTranscript) {
          const textarea = this.container.querySelector('#textarea-ocr-edit');
          if (textarea) {
            this.currentEvaluation.transcription = textarea.value;
          }
          this.isEditingTranscript = false;
        } else {
          this.isEditingTranscript = true;
        }
        this.renderEvaluation();
      });
    }

    // Remarks change
    const remarksInput = this.container.querySelector('#input-prof-remarks');
    if (remarksInput) {
      remarksInput.addEventListener('input', (e) => {
        this.professorRemarks = e.target.value;
      });
    }

    // Accept & Next Paper Button
    const btnAccept = this.container.querySelector('#btn-accept-next');
    if (btnAccept) {
      btnAccept.addEventListener('click', () => {
        this.confirmAndProceed();
      });
    }
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
      point.justification = 'Professor override: Criterion marked as Full.';
    } else if (newStatus === 'partial') {
      point.awardedMarks = Number((point.weight * 0.5).toFixed(2));
      point.justification = 'Professor override: Criterion marked as Partial.';
    } else {
      point.awardedMarks = 0;
      point.justification = 'Professor override: Criterion marked as Missed.';
    }

    // Recalculate total score
    let recalculated = this.currentEvaluation.points.reduce((acc, p) => acc + p.awardedMarks, 0);
    const max = this.currentRubric?.maxMarks || 10.0;
    this.finalScore = Math.min(max, Math.max(0, Number(recalculated.toFixed(2))));
    this.isOverridden = true;

    this.renderEvaluation();
  }

  confirmAndProceed() {
    const record = {
      id: 'grade-' + Date.now(),
      studentName: this.currentPaperMeta.studentName,
      rollNo: this.currentPaperMeta.rollNo,
      subject: this.currentRubric?.subject || 'Anatomy',
      question: this.currentRubric?.question || 'Exam Question',
      finalScore: this.finalScore,
      aiScore: this.currentEvaluation.suggestedScore,
      maxMarks: this.currentRubric?.maxMarks || 10.0,
      isOverridden: this.isOverridden,
      points: this.currentEvaluation.points,
      professorRemarks: this.professorRemarks,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };

    this.onAcceptAndNext(record);
  }

  getGradeBadge(percentage) {
    if (percentage >= 85) return 'Distinction';
    if (percentage >= 70) return 'First Class';
    if (percentage >= 50) return 'Pass';
    return 'Needs Review';
  }
}

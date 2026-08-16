// AnatomiGrade AI - Main Application Controller
import { RubricManager } from './rubric.js';
import { PaperCapture } from './capture.js';
import { AiEvaluationService } from './ai-service.js';
import { ReviewPanel } from './review.js';
import { GradebookManager } from './gradebook.js';
import { renderIcon } from './icons.js';
import { SAMPLE_PAPERS } from './samples.js';

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
    this.bindComponents();
    this.bindGlobalEvents();
    this.renderRubricUI();
    this.updateHeaderStats();
    this.updateQuickRubricSelect();
  }

  bindComponents() {
    // Capture Component
    this.capture = new PaperCapture({
      container: document.getElementById('capture-container'),
      onCapture: (paperData) => {
        this.currentPaper = paperData;
        this.onPaperChanged();
      }
    });

    // Review Panel Component
    this.reviewPanel = new ReviewPanel({
      container: document.getElementById('review-container'),
      onAcceptAndNext: (record) => this.handleAcceptAndNext(record),
      onScoreChanged: (newScore) => this.updateToast(`Score updated to ${newScore.toFixed(2)}`)
    });

    // Gradebook Component
    this.gradebook = new GradebookManager({
      container: document.getElementById('gradebook-container')
    });

    // Sync rubric changes
    this.rubricManager.onChange(() => {
      this.renderRubricUI();
      this.updateActiveRubricBanner();
      this.updateQuickRubricSelect();
    });
  }

  bindGlobalEvents() {
    // Nav Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;
        this.switchView(targetView);
      });
    });

    // Trigger AI Evaluation Button
    const btnEvaluate = document.getElementById('btn-run-eval');
    if (btnEvaluate) {
      btnEvaluate.addEventListener('click', () => this.runEvaluation());
    }

    // Settings Modal
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const modalSettings = document.getElementById('modal-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSaveApiKey = document.getElementById('btn-save-api-key');
    const inputApiKey = document.getElementById('input-gemini-key');

    if (btnOpenSettings && modalSettings) {
      btnOpenSettings.addEventListener('click', () => {
        if (inputApiKey) inputApiKey.value = this.aiService.loadApiKey();
        modalSettings.classList.remove('hidden');
      });
    }
    if (btnCloseSettings && modalSettings) {
      btnCloseSettings.addEventListener('click', () => modalSettings.classList.add('hidden'));
    }
    if (btnSaveApiKey && inputApiKey && modalSettings) {
      btnSaveApiKey.addEventListener('click', () => {
        this.aiService.setApiKey(inputApiKey.value);
        modalSettings.classList.add('hidden');
        this.showNotification('API Key saved successfully!', 'success');
        this.updateHeaderStats();
      });
    }

    // Rubric Presets quick switcher in header
    const selectRubric = document.getElementById('select-quick-rubric');
    if (selectRubric) {
      selectRubric.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification(`Loaded rubric: ${this.rubricManager.getRubric().subject}`, 'info');
      });
    }
  }

  updateQuickRubricSelect() {
    const selectRubric = document.getElementById('select-quick-rubric');
    if (!selectRubric) return;

    const all = this.rubricManager.getAllRubrics();
    const currentId = this.rubricManager.getRubric().id;

    selectRubric.innerHTML = all.map(p => `
      <option value="${p.id}" ${p.id === currentId ? 'selected' : ''}>
        ${p.isCustom ? '⭐ ' : ''}${p.subject}: ${p.question.substring(0, 40)}... (${p.maxMarks}M)
      </option>
    `).join('');
  }

  switchView(viewName) {
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.view === viewName);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== `view-${viewName}`);
    });

    if (viewName === 'gradebook') {
      this.gradebook.render();
    }
  }

  onPaperChanged() {
    this.updateActiveRubricBanner();
  }

  updateActiveRubricBanner() {
    const rubric = this.rubricManager.getRubric();
    const bannerSubject = document.getElementById('banner-subject');
    const bannerQuestion = document.getElementById('banner-question');
    const bannerMax = document.getElementById('banner-max-marks');

    if (bannerSubject) bannerSubject.textContent = rubric.subject;
    if (bannerQuestion) bannerQuestion.textContent = rubric.question;
    if (bannerMax) bannerMax.textContent = `${rubric.maxMarks} Marks`;
  }

  async runEvaluation() {
    if (this.isEvaluating) return;
    if (!this.currentPaper) {
      this.showNotification('Please select or capture an exam paper first.', 'warning');
      return;
    }

    const btnEvaluate = document.getElementById('btn-run-eval');
    const rubric = this.rubricManager.getRubric();

    this.isEvaluating = true;
    if (btnEvaluate) {
      btnEvaluate.disabled = true;
      btnEvaluate.innerHTML = `
        <span class="spinner-sm"></span> Evaluating with AI...
      `;
    }

    this.showEvaluationLoading();

    try {
      const result = await this.aiService.evaluatePaper({
        imageSrc: this.currentPaper.imageSrc,
        rawText: this.currentPaper.meta?.rawText,
        rubric: rubric,
        sampleMeta: this.currentPaper.meta
      });

      this.reviewPanel.setEvaluationData(result, this.currentPaper.meta, rubric);
      this.showNotification(`AI evaluation complete! Score: ${result.suggestedScore}/${rubric.maxMarks}`, 'success');

      // Scroll review panel into view on mobile
      const reviewContainer = document.getElementById('review-container');
      if (reviewContainer && window.innerWidth < 900) {
        reviewContainer.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      this.showNotification(`Evaluation error: ${err.message}`, 'error');
    } finally {
      this.isEvaluating = false;
      if (btnEvaluate) {
        btnEvaluate.disabled = false;
        btnEvaluate.innerHTML = `${renderIcon('sparkles')} Run AI Evaluation`;
      }
    }
  }

  showEvaluationLoading() {
    const container = document.getElementById('review-container');
    if (!container) return;

    container.innerHTML = `
      <div class="evaluation-loading-card">
        <div class="loading-pulse-ring"></div>
        <div class="loading-title">AnatomiGrade Vision AI Processing</div>
        <div class="loading-steps-list">
          <div class="step-item active">
            <span class="step-dot"></span> Extracting handwritten medical terminology & relations...
          </div>
          <div class="step-item active">
            <span class="step-dot"></span> Performing strict semantic comparison with Answer Key...
          </div>
          <div class="step-item active">
            <span class="step-dot"></span> Calculating granular decimal score breakdown...
          </div>
        </div>
      </div>
    `;
  }

  handleAcceptAndNext(record) {
    // 1. Add record to gradebook
    this.gradebook.addRecord(record);
    this.showNotification(`✓ Grade logged for ${record.studentName} (${record.rollNo}): ${record.finalScore}/${record.maxMarks}`, 'success');

    // 2. Advance to next sample paper or prepare next student roll
    this.currentSampleIndex = (this.currentSampleIndex + 1) % SAMPLE_PAPERS.length;
    const nextSample = SAMPLE_PAPERS[this.currentSampleIndex];

    // Select the card in capture panel
    const sampleCards = document.querySelectorAll('.preset-card');
    sampleCards.forEach(c => {
      c.classList.toggle('selected', c.dataset.sampleId === nextSample.id);
    });

    this.capture.loadSample(nextSample.id);

    // 3. Reset review panel for new evaluation
    this.reviewPanel.renderEmptyState();

    // 4. Update header counters
    this.updateHeaderStats();

    // 5. Scroll back up to paper viewer if on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateHeaderStats() {
    const stats = this.gradebook.getStats();
    const badgeCount = document.getElementById('header-graded-count');
    const badgeTime = document.getElementById('header-time-saved');
    const badgeApi = document.getElementById('header-api-status');

    if (badgeCount) badgeCount.textContent = `${stats.total} Graded`;
    if (badgeTime) badgeTime.textContent = `~${stats.timeSavedMinutes}m Saved`;
    if (badgeApi) {
      if (this.aiService.hasLiveApiKey()) {
        badgeApi.className = 'header-api-badge live';
        badgeApi.innerHTML = `🟢 Gemini Live`;
      } else {
        badgeApi.className = 'header-api-badge offline';
        badgeApi.innerHTML = `⚡ Smart Offline`;
      }
    }
  }

  renderRubricUI() {
    const rubricContainer = document.getElementById('rubric-builder-container');
    if (!rubricContainer) return;

    const rubric = this.rubricManager.getRubric();
    const allRubrics = this.rubricManager.getAllRubrics();
    const isBalanced = this.rubricManager.isWeightBalanced();
    const currentTotalWeight = this.rubricManager.getTotalPointsWeight();

    rubricContainer.innerHTML = `
      <div class="rubric-builder-card">
        
        <!-- Header & Presets -->
        <div class="rubric-top-bar">
          <div>
            <h3>Rubric & Answer Key Configuration</h3>
            <p class="text-muted">Define question details and weighted key point criteria for AI grading.</p>
          </div>
          <div class="preset-action-bar" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-new-blank-rubric" style="font-weight: 700;">
              ${renderIcon('plus')} + New Question
            </button>
            <div class="preset-selector-group">
              <label>Presets:</label>
              <select id="select-rubric-preset" class="input-select">
                ${allRubrics.map(p => `
                  <option value="${p.id}" ${p.id === rubric.id ? 'selected' : ''}>
                    ${p.isCustom ? '⭐ ' : ''}${p.subject} - ${p.question.substring(0, 32)}... (${p.maxMarks}M)
                  </option>
                `).join('')}
              </select>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-save-custom-rubric" title="Save current question to your question bank">
              💾 Save Rubric
            </button>
          </div>
        </div>

        <!-- Question Meta Inputs -->
        <div class="rubric-meta-grid">
          <div class="form-group">
            <label for="input-rubric-subject">Subject / Course Name:</label>
            <input type="text" id="input-rubric-subject" class="input-control" value="${rubric.subject}" placeholder="e.g. Neuroanatomy, General Surgery..." />
          </div>

          <div class="form-group">
            <label for="input-rubric-maxmarks">Maximum Marks:</label>
            <input type="number" id="input-rubric-maxmarks" class="input-control" step="0.5" min="1" value="${rubric.maxMarks}" />
          </div>

          <div class="form-group span-2">
            <label for="input-rubric-question">Question Prompt:</label>
            <textarea id="input-rubric-question" class="input-control" rows="2" placeholder="Enter the exact exam question prompt...">${rubric.question}</textarea>
          </div>
        </div>

        <!-- Key Points Weight Bar -->
        <div class="weight-summary-bar ${isBalanced ? 'balanced' : 'unbalanced'}">
          <div class="weight-status-text">
            Total Points Weight: <strong>${currentTotalWeight.toFixed(2)}</strong> / Max: <strong>${rubric.maxMarks.toFixed(2)}</strong>
            ${isBalanced ? '<span class="status-badge-ok">✓ Balanced</span>' : '<span class="status-badge-warn">⚠️ Mismatch</span>'}
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-rebalance-weights">
            Auto-Balance Point Weights
          </button>
        </div>

        <!-- Key Points List -->
        <div class="keypoints-list-header">
          <h4>Key Points / Grading Criteria Checklist (${rubric.keyPoints.length})</h4>
          <button type="button" class="btn btn-primary btn-sm" id="btn-add-keypoint">
            ${renderIcon('plus')} Add Key Point
          </button>
        </div>

        <div class="keypoints-list" id="keypoints-list">
          ${rubric.keyPoints.map((kp, idx) => `
            <div class="keypoint-item" data-id="${kp.id}">
              <div class="keypoint-drag-handle">#${idx + 1}</div>
              <div class="keypoint-inputs">
                <input 
                  type="text" 
                  class="input-control kp-text-input" 
                  value="${kp.text}" 
                  placeholder="Criterion description (e.g. Roots C5-T1, Trunk division...)" 
                />
                <div class="kp-keywords-wrap">
                  <span class="kp-tag">Keywords:</span>
                  <input 
                    type="text" 
                    class="input-control kp-keywords-input" 
                    value="${(kp.keywords || []).join(', ')}" 
                    placeholder="e.g. roots, c5, c6, upper trunk" 
                  />
                </div>
              </div>
              <div class="keypoint-weight-wrap">
                <label>Marks:</label>
                <input 
                  type="number" 
                  class="input-control kp-weight-input" 
                  step="0.25" 
                  min="0.25" 
                  value="${kp.weight}" 
                />
              </div>
              <button type="button" class="btn-icon-subtle btn-del-kp" data-id="${kp.id}" title="Remove Criterion">
                ${renderIcon('trash')}
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    this.attachRubricEvents();
  }

  attachRubricEvents() {
    const container = document.getElementById('rubric-builder-container');
    if (!container) return;

    // + New Blank Question
    const btnNew = container.querySelector('#btn-new-blank-rubric');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.rubricManager.createNewBlankQuestion();
        this.showNotification('New blank question rubric ready! Enter your question and criteria.', 'info');
      });
    }

    // Save Custom Rubric
    const btnSaveCustom = container.querySelector('#btn-save-custom-rubric');
    if (btnSaveCustom) {
      btnSaveCustom.addEventListener('click', () => {
        this.rubricManager.saveCurrentAsPreset();
        this.showNotification('✓ Question rubric saved to your question bank!', 'success');
      });
    }

    // Preset selector
    const selectPreset = container.querySelector('#select-rubric-preset');
    if (selectPreset) {
      selectPreset.addEventListener('change', (e) => {
        this.rubricManager.setPreset(e.target.value);
        this.showNotification('Rubric loaded!', 'info');
      });
    }

    // Subject input
    const inputSubject = container.querySelector('#input-rubric-subject');
    if (inputSubject) {
      inputSubject.addEventListener('change', (e) => {
        this.rubricManager.setQuestionMeta({ subject: e.target.value });
      });
    }

    // Max marks
    const inputMax = container.querySelector('#input-rubric-maxmarks');
    if (inputMax) {
      inputMax.addEventListener('change', (e) => {
        this.rubricManager.setQuestionMeta({ maxMarks: e.target.value });
      });
    }

    // Question prompt
    const inputQuestion = container.querySelector('#input-rubric-question');
    if (inputQuestion) {
      inputQuestion.addEventListener('change', (e) => {
        this.rubricManager.setQuestionMeta({ question: e.target.value });
      });
    }

    // Auto-balance weights
    const btnRebalance = container.querySelector('#btn-rebalance-weights');
    if (btnRebalance) {
      btnRebalance.addEventListener('click', () => {
        this.rubricManager.rebalanceWeights();
        this.showNotification('Point weights balanced evenly!', 'success');
      });
    }

    // Add Key Point
    const btnAddKp = container.querySelector('#btn-add-keypoint');
    if (btnAddKp) {
      btnAddKp.addEventListener('click', () => {
        this.rubricManager.addKeyPoint('', 1.0, []);
      });
    }

    // Delete Key Point
    container.querySelectorAll('.btn-del-kp').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.rubricManager.removeKeyPoint(id);
      });
    });

    // Keypoint text and weight inputs
    container.querySelectorAll('.keypoint-item').forEach(item => {
      const id = item.dataset.id;
      const textInput = item.querySelector('.kp-text-input');
      const keywordsInput = item.querySelector('.kp-keywords-input');
      const weightInput = item.querySelector('.kp-weight-input');

      if (textInput) {
        textInput.addEventListener('change', () => {
          this.rubricManager.updateKeyPoint(id, { text: textInput.value });
        });
      }
      if (keywordsInput) {
        keywordsInput.addEventListener('change', () => {
          this.rubricManager.updateKeyPoint(id, { keywords: keywordsInput.value });
        });
      }
      if (weightInput) {
        weightInput.addEventListener('change', () => {
          this.rubricManager.updateKeyPoint(id, { weight: weightInput.value });
        });
      }
    });
  }

  showNotification(msg, type = 'info') {
    const toast = document.getElementById('app-toast');
    if (!toast) return;

    toast.className = `app-toast toast-${type} show`;
    toast.textContent = msg;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.className = 'app-toast';
    }, 3200);
  }

  updateToast(msg) {
    this.showNotification(msg, 'info');
  }
}

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.anatomiGradeApp = new App();
});

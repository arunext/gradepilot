// AnatomiGrade AI - Camera, Upload & Paper Viewer Module
import { getSampleSvgDataUrl, SAMPLE_PAPERS } from './samples.js';

export class PaperCapture {
  constructor(options = {}) {
    this.container = options.container;
    this.onCaptureCallback = options.onCapture || (() => {});
    
    this.currentImageSrc = null;
    this.currentMeta = null;
    this.stream = null;
    this.isCameraActive = false;

    // Viewport transform state
    this.zoom = 1;
    this.rotation = 0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Image filter adjustments
    this.filters = {
      contrast: 100, // %
      brightness: 100, // %
      grayscale: false,
      sharpen: false
    };

    this.init();
  }

  init() {
    this.renderUI();
    this.attachEvents();
    // Load first sample paper by default for instant delight
    this.loadSample('sample-1');
  }

  renderUI() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="capture-panel">
        <!-- Top Toolbar / Tabs -->
        <div class="capture-tabs">
          <button type="button" class="tab-btn active" data-mode="presets">
            <span class="tab-icon">📄</span> Sample Papers (4)
          </button>
          <button type="button" class="tab-btn" data-mode="upload">
            <span class="tab-icon">📁</span> Upload Image
          </button>
          <button type="button" class="tab-btn" data-mode="camera">
            <span class="tab-icon">📷</span> Mobile Camera
          </button>
        </div>

        <!-- Mode 1: Presets Selector Drawer -->
        <div class="capture-mode-pane" id="pane-presets">
          <div class="presets-scroll-grid">
            ${SAMPLE_PAPERS.map(s => `
              <div class="preset-card ${s.id === 'sample-1' ? 'selected' : ''}" data-sample-id="${s.id}">
                <div class="preset-card-header">
                  <span class="badge-student">${s.rollNo}</span>
                  <span class="badge-expected">Est. ${s.expectedScore}/${s.maxScore}</span>
                </div>
                <div class="preset-student-name">${s.studentName}</div>
                <div class="preset-desc">${s.description}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Mode 2: Upload Zone -->
        <div class="capture-mode-pane hidden" id="pane-upload">
          <div class="dropzone" id="paper-dropzone">
            <input type="file" id="file-input" accept="image/*" class="file-input-hidden" />
            <div class="dropzone-content">
              <div class="dropzone-icon">📤</div>
              <div class="dropzone-title">Drop student's handwritten answer sheet here</div>
              <div class="dropzone-subtitle">or click to browse from device (JPG, PNG, HEIC)</div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-browse-file">Browse File</button>
            </div>
          </div>
        </div>

        <!-- Mode 3: Live Camera Viewport -->
        <div class="capture-mode-pane hidden" id="pane-camera">
          <div class="camera-viewport-container">
            <video id="camera-video" playsinline autoplay muted class="camera-video"></video>
            <canvas id="camera-canvas" class="hidden"></canvas>
            
            <div class="camera-overlay">
              <div class="camera-guide-frame">
                <span class="guide-corner top-left"></span>
                <span class="guide-corner top-right"></span>
                <span class="guide-corner bottom-left"></span>
                <span class="guide-corner bottom-right"></span>
                <div class="guide-text">Align Exam Paper within frame</div>
              </div>
            </div>

            <div class="camera-controls">
              <button type="button" class="btn btn-icon btn-camera-switch" id="btn-switch-camera" title="Switch Camera">🔄</button>
              <button type="button" class="btn-shutter" id="btn-snap-photo" title="Capture Photo">
                <span class="shutter-inner"></span>
              </button>
              <button type="button" class="btn btn-icon btn-camera-close" id="btn-close-camera" title="Stop Camera">❌</button>
            </div>
          </div>
        </div>

        <!-- Interactive Paper Viewport & Enhancement Tools -->
        <div class="paper-viewer-wrapper">
          <div class="viewer-header">
            <div class="viewer-title-group">
              <span class="viewer-badge" id="paper-badge-roll">MED-2024-001</span>
              <span class="viewer-subtitle" id="paper-student-name">Anya Sharma</span>
            </div>
            <div class="viewer-toolbar">
              <button type="button" class="btn-tool" id="btn-zoom-out" title="Zoom Out">🔍-</button>
              <button type="button" class="btn-tool" id="btn-zoom-reset" title="Reset Zoom">100%</button>
              <button type="button" class="btn-tool" id="btn-zoom-in" title="Zoom In">🔍+</button>
              <button type="button" class="btn-tool" id="btn-rotate" title="Rotate 90°">🔄 90°</button>
              <button type="button" class="btn-tool" id="btn-toggle-filters" title="Enhance Ink / Contrast">✨ Filters</button>
            </div>
          </div>

          <!-- Enhancement filter bar (collapsible) -->
          <div class="filter-toolbar hidden" id="filter-toolbar">
            <div class="filter-item">
              <label>Contrast: <span id="val-contrast">100%</span></label>
              <input type="range" id="range-contrast" min="50" max="250" value="100" />
            </div>
            <div class="filter-item">
              <label>Brightness: <span id="val-brightness">100%</span></label>
              <input type="range" id="range-brightness" min="60" max="160" value="100" />
            </div>
            <div class="filter-item">
              <label class="checkbox-label">
                <input type="checkbox" id="chk-grayscale" /> B&W Doc Mode
              </label>
            </div>
            <button type="button" class="btn btn-xs btn-outline" id="btn-reset-filters">Reset</button>
          </div>

          <!-- Canvas / Image Stage with Pan & Drag -->
          <div class="viewer-stage" id="viewer-stage">
            <div class="viewer-content" id="viewer-content">
              <img id="active-paper-img" src="" alt="Student Handwritten Answer Paper" draggable="false" />
            </div>
            <div class="viewer-drag-hint">💡 Drag to pan • Pinch / Double-click to zoom</div>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Mode tabs
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.switchMode(mode);
      });
    });

    // Preset cards
    this.container.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const sampleId = card.dataset.sampleId;
        this.loadSample(sampleId);
      });
    });

    // File Upload
    const fileInput = this.container.querySelector('#file-input');
    const btnBrowse = this.container.querySelector('#btn-browse-file');
    const dropzone = this.container.querySelector('#paper-dropzone');

    if (btnBrowse && fileInput) {
      btnBrowse.addEventListener('click', () => fileInput.click());
    }
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileSelect(e.dataTransfer.files);
        }
      });
    }

    // Camera Controls
    const btnSnap = this.container.querySelector('#btn-snap-photo');
    const btnCloseCam = this.container.querySelector('#btn-close-camera');
    if (btnSnap) btnSnap.addEventListener('click', () => this.snapPhoto());
    if (btnCloseCam) btnCloseCam.addEventListener('click', () => this.switchMode('presets'));

    // Viewer Zoom / Pan Controls
    const btnZoomIn = this.container.querySelector('#btn-zoom-in');
    const btnZoomOut = this.container.querySelector('#btn-zoom-out');
    const btnZoomReset = this.container.querySelector('#btn-zoom-reset');
    const btnRotate = this.container.querySelector('#btn-rotate');
    const btnToggleFilters = this.container.querySelector('#btn-toggle-filters');

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.adjustZoom(0.25));
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.adjustZoom(-0.25));
    if (btnZoomReset) btnZoomReset.addEventListener('click', () => this.resetTransform());
    if (btnRotate) btnRotate.addEventListener('click', () => this.rotatePaper());
    if (btnToggleFilters) {
      btnToggleFilters.addEventListener('click', () => {
        const toolbar = this.container.querySelector('#filter-toolbar');
        toolbar.classList.toggle('hidden');
      });
    }

    // Filter Sliders
    const rangeContrast = this.container.querySelector('#range-contrast');
    const rangeBrightness = this.container.querySelector('#range-brightness');
    const chkGrayscale = this.container.querySelector('#chk-grayscale');
    const btnResetFilters = this.container.querySelector('#btn-reset-filters');

    if (rangeContrast) {
      rangeContrast.addEventListener('input', (e) => {
        this.filters.contrast = e.target.value;
        this.container.querySelector('#val-contrast').textContent = `${e.target.value}%`;
        this.applyFilters();
      });
    }
    if (rangeBrightness) {
      rangeBrightness.addEventListener('input', (e) => {
        this.filters.brightness = e.target.value;
        this.container.querySelector('#val-brightness').textContent = `${e.target.value}%`;
        this.applyFilters();
      });
    }
    if (chkGrayscale) {
      chkGrayscale.addEventListener('change', (e) => {
        this.filters.grayscale = e.target.checked;
        this.applyFilters();
      });
    }
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        this.filters = { contrast: 100, brightness: 100, grayscale: false, sharpen: false };
        if (rangeContrast) rangeContrast.value = 100;
        if (rangeBrightness) rangeBrightness.value = 100;
        if (chkGrayscale) chkGrayscale.checked = false;
        this.container.querySelector('#val-contrast').textContent = '100%';
        this.container.querySelector('#val-brightness').textContent = '100%';
        this.applyFilters();
      });
    }

    // Pan Dragging on Stage
    const stage = this.container.querySelector('#viewer-stage');
    if (stage) {
      stage.addEventListener('mousedown', (e) => this.startDrag(e));
      window.addEventListener('mousemove', (e) => this.doDrag(e));
      window.addEventListener('mouseup', () => this.endDrag());

      // Touch events for mobile
      stage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.startDrag(e.touches[0]);
        }
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (this.isDragging && e.touches.length === 1) {
          this.doDrag(e.touches[0]);
        }
      }, { passive: true });
      window.addEventListener('touchend', () => this.endDrag());

      // Double-click to toggle 1.5x zoom
      stage.addEventListener('dblclick', () => {
        this.zoom = this.zoom > 1 ? 1 : 1.6;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
      });
    }
  }

  switchMode(mode) {
    const panePresets = this.container.querySelector('#pane-presets');
    const paneUpload = this.container.querySelector('#pane-upload');
    const paneCamera = this.container.querySelector('#pane-camera');

    panePresets.classList.add('hidden');
    paneUpload.classList.add('hidden');
    paneCamera.classList.add('hidden');

    if (mode === 'presets') {
      panePresets.classList.remove('hidden');
      this.stopCamera();
    } else if (mode === 'upload') {
      paneUpload.classList.remove('hidden');
      this.stopCamera();
    } else if (mode === 'camera') {
      paneCamera.classList.remove('hidden');
      this.startCamera();
    }
  }

  async startCamera() {
    try {
      this.stopCamera();
      const video = this.container.querySelector('#camera-video');
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = this.stream;
      this.isCameraActive = true;
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Could not access camera. Please allow camera permissions or upload an image file.');
      this.switchMode('presets');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.isCameraActive = false;
    }
  }

  snapPhoto() {
    const video = this.container.querySelector('#camera-video');
    const canvas = this.container.querySelector('#camera-canvas');
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    this.stopCamera();
    this.switchMode('presets');

    const rollNo = 'ROLL-' + Math.floor(1000 + Math.random() * 9000);
    this.setPaperImage(dataUrl, {
      id: 'custom-photo-' + Date.now(),
      studentName: 'Student (Camera Scan)',
      rollNo: rollNo,
      isCustom: true
    });
  }

  handleFileSelect(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const rollNo = 'ROLL-' + Math.floor(1000 + Math.random() * 9000);
      this.setPaperImage(dataUrl, {
        id: 'uploaded-' + Date.now(),
        studentName: file.name.replace(/\.[^/.]+$/, ""),
        rollNo: rollNo,
        isCustom: true
      });
    };
    reader.readAsDataURL(file);
  }

  loadSample(sampleId) {
    const sample = SAMPLE_PAPERS.find(s => s.id === sampleId) || SAMPLE_PAPERS[0];
    const dataUrl = getSampleSvgDataUrl(sample.id);
    this.setPaperImage(dataUrl, sample);
  }

  setPaperImage(imageSrc, meta) {
    this.currentImageSrc = imageSrc;
    this.currentMeta = meta;

    const img = this.container.querySelector('#active-paper-img');
    const rollBadge = this.container.querySelector('#paper-badge-roll');
    const nameLabel = this.container.querySelector('#paper-student-name');

    if (img) img.src = imageSrc;
    if (rollBadge && meta.rollNo) rollBadge.textContent = meta.rollNo;
    if (nameLabel && meta.studentName) nameLabel.textContent = meta.studentName;

    this.resetTransform();
    this.onCaptureCallback({
      imageSrc: this.currentImageSrc,
      meta: this.currentMeta
    });
  }

  adjustZoom(delta) {
    this.zoom = Math.min(3.5, Math.max(0.7, this.zoom + delta));
    this.container.querySelector('#btn-zoom-reset').textContent = `${Math.round(this.zoom * 100)}%`;
    this.updateTransform();
  }

  resetTransform() {
    this.zoom = 1;
    this.rotation = 0;
    this.panX = 0;
    this.panY = 0;
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

  applyFilters() {
    const img = this.container.querySelector('#active-paper-img');
    if (!img) return;
    let filterStr = `contrast(${this.filters.contrast}%) brightness(${this.filters.brightness}%)`;
    if (this.filters.grayscale) {
      filterStr += ' grayscale(100%) contrast(150%)';
    }
    img.style.filter = filterStr;
  }

  startDrag(e) {
    this.isDragging = true;
    this.dragStartX = e.clientX - this.panX;
    this.dragStartY = e.clientY - this.panY;
    const stage = this.container.querySelector('#viewer-stage');
    if (stage) stage.classList.add('grabbing');
  }

  doDrag(e) {
    if (!this.isDragging) return;
    this.panX = e.clientX - this.dragStartX;
    this.panY = e.clientY - this.dragStartY;
    this.updateTransform();
  }

  endDrag() {
    this.isDragging = false;
    const stage = this.container.querySelector('#viewer-stage');
    if (stage) stage.classList.remove('grabbing');
  }

  getCurrentPaper() {
    return {
      imageSrc: this.currentImageSrc,
      meta: this.currentMeta
    };
  }
}

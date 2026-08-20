# 🦅 GradeCrow AI — The Cleverest Handwritten Exam Grading Platform

> **Live App**: [gradecrow.vercel.app](https://gradecrow.vercel.app/)  
> **Domain**: `gradecrow.com`  
> **Tagline**: *"Sharp eyes. Fair marks. Zero grading fatigue."*

GradeCrow AI is a modern, fast, mobile-first web application designed for teachers, educators, and university professors across all subjects to automate and accelerate the evaluation of handwritten exam papers using Multimodal AI Vision (Google Gemini Vision API + built-in intelligent semantic concept resolver).

---

## 🌟 Core Features & Workflow

1. **Step 1: Select or Create Question & Rubric**:
   - Easily configure questions, maximum marks, and granular key grading criteria for any subject (STEM, Medicine, Humanities, Social Sciences, etc.).
   - Decimal mark weighting per key point (e.g. 0.5, 1.0, 1.25, 2.5).
   - One-click auto-balance feature to distribute point weights evenly across max marks.
   - Built-in multi-subject preset rubrics with instant keypoint preview.

2. **Step 2: Mobile Camera, Upload & Interactive Paper Viewport**:
   - Clean, tactile action cards: **📸 Take Photo** (rear camera capture) and **📁 Upload Image File** (JPG, PNG, HEIC).
   - Subtle popup modal to load sample demo student papers without cluttering the home screen.
   - Paper manipulation tools: Zoom (70% to 350%), Pan dragging, 90° Rotation.

3. **Step 3: Dual AI Vision & Semantic Concept Evaluation**:
   - **Google Gemini Multimodal Vision API**: Connects directly using your free Google AI Studio API key with auto-sorted Flash model endpoints.
   - **Intelligent Offline Semantic Concept Engine**: Built-in NLP evaluator with citation quote extraction, synonym stemming, and instant offline grading.
   - Granular Keypoint Checklist: Classifies criteria into `Hit (Full Marks)`, `Partial (Half Marks)`, or `Missed (0 Marks)` with exact cited snippets from the student's text.

4. **Rapid Teacher-in-the-Loop Review System**:
   - Hero Score card with direct decimal input and quick step chips (`-1.0`, `-0.5`, `-0.25`, `+0.25`, `+0.5`, `+1.0`).
   - Interactive 3-way status toggles: Tap `✓ Full`, `½ Half`, or `✕ 0` to override any point on the fly with live recalculation.
   - OCR transcription drawer with in-place text editor for correcting difficult student handwriting.
   - Tactile **"Save Grade & Next Paper ➔"** loop that logs to the gradebook and resets for the next student sheet cleanly.

5. **Batch Gradebook & Class Analytics**:
   - Live roster table tracking Roll No, Student Name, Subject, Final Score, AI status, and Teacher remarks.
   - Real-time statistics: Total papers graded, class mean percentage, pass rate, and grading time saved counter.
   - One-click CSV Export and Print-ready Summary.

---

## 📖 Brand Guidelines

Read the full brand narrative, mascot symbolism, and design system in [`BRAND_GUIDELINES.md`](./BRAND_GUIDELINES.md).

---

## 🚀 How to Run Locally

### Option 1: Direct File Opening
Double-click `index.html` in your browser.

### Option 2: PowerShell HTTP Server
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
This automatically hosts the app on `http://localhost:8080` and opens it in your browser.

---

## 🌐 Deploy to Vercel

```powershell
git add .
git commit -m "Rebrand to GradeCrow AI"
git push
```
Or deploy directly via [vercel.com](https://vercel.com).

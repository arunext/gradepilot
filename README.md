# ✈️ GradePilot AI - Universal Handwritten Exam Grading Platform

GradePilot AI is a modern, fast, mobile-friendly web application designed for teachers, educators, and university professors across all subjects to automate and accelerate the evaluation of handwritten exam papers using Multimodal AI Vision (Google Gemini Vision API + built-in intelligent NLP fallback).

---

## 🌟 Core Features & Workflow

1. **Universal Rubric & Answer Key Builder**:
   - Easily configure questions, maximum marks, and granular key grading criteria for any subject (STEM, Medicine, Humanities, Social Sciences, etc.).
   - Decimal mark weighting per key point (e.g. 0.5, 1.0, 1.25, 2.5).
   - One-click auto-balance feature to distribute point weights evenly across max marks.
   - Built-in multi-subject preset rubrics.

2. **Mobile Camera, Upload & Interactive Paper Viewport**:
   - Real-time mobile rear-camera capture (`capture="environment"`) with frame alignment guide.
   - Drag & Drop file uploader for scanned answer sheets (JPG, PNG, HEIC).
   - Realistic handwritten exam paper presets.
   - Paper manipulation tools: Zoom (70% to 350%), Pan dragging, 90° Rotation, and Image Enhancement Filters (Contrast boost, Brightness, B&W Doc mode for faint pencil/ink).

3. **Dual AI Vision & Semantic Concept Evaluation**:
   - **Google Gemini Multimodal Vision API**: Connects directly using your free Google AI Studio API key.
   - **Intelligent Offline Semantic Concept Engine**: Built-in NLP evaluator with citation quote extraction, medical/scientific term stemming, and instant offline grading.
   - Granular Keypoint Checklist: Classifies criteria into `Hit (Full Marks)`, `Partial (Half Marks)`, or `Missed (0 Marks)` with exact cited snippets from the student's text.

4. **Rapid Teacher-in-the-Loop Review System**:
   - Hero Score card with direct decimal input and quick step chips (`-1.0`, `-0.5`, `-0.25`, `+0.25`, `+0.5`, `+1.0`).
   - Interactive 3-way status toggles: Tap `✓ Full`, `½ Half`, or `✕ 0` to override any point on the fly with live recalculation.
   - OCR transcription drawer with in-place text editor for correcting difficult student handwriting.
   - Tactile **"Accept Score & Next Paper ➔"** loop that logs to the gradebook and loads the next student sheet without losing rubric context.

5. **Batch Gradebook & Class Analytics**:
   - Live roster table tracking Roll No, Student Name, Subject, Final Score, AI status, and Teacher remarks.
   - Real-time statistics: Total papers graded, class mean percentage, pass rate, and grading time saved counter.
   - One-click CSV Export and Print-ready Summary.

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
npx vercel
```
Or push to GitHub and import the repository on [vercel.com/new](https://vercel.com/new).

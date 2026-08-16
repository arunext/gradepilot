# 🩺 AnatomiGrade AI - Mobile-First Handwritten Exam Grading MVP

AnatomiGrade AI is a fast, mobile-first web application designed for university medical and theory professors to automate and accelerate the grading of handwritten internal exam papers using OCR and Vision LLMs (Google Gemini Vision API + built-in intelligent NLP fallback).

---

## 🌟 Core Features & User Flow

1. **Rubric & Answer Key Builder**:
   - Easily configure questions, maximum marks, and key grading criteria.
   - Granular decimal mark weighting per key point (e.g. 1.25, 0.75, 2.0).
   - One-click auto-balance feature to distribute point weights evenly across max marks.
   - Built-in Anatomy presets (*Brachial Plexus*, *Cardiac Cycle & Valves*, *Renal Glomerular Filtration Barrier*, *Trigeminal Nerve CN V*).

2. **Mobile Camera, Upload & Interactive Paper Viewport**:
   - Real-time mobile rear-camera capture (`capture="environment"`) with frame alignment guide.
   - Drag & Drop file uploader for scanned answer sheets.
   - 4 pre-rendered realistic handwritten anatomy exam papers with authentic student answers and schematic diagrams.
   - Paper manipulation tools: Zoom (100% to 350%), Pan dragging, 90° Rotation, and Image Enhancement Filters (Contrast boost, Brightness, B&W Doc mode for faint pencil/ink).

3. **Dual AI Vision & Semantic Evaluation**:
   - **Google Gemini 1.5/2.0 Flash Vision API**: Direct integration via configurable API key in settings.
   - **Intelligent Offline Semantic Engine**: Built-in NLP evaluator with citation quote extraction, entity recognition, and zero-latency instant demoing.
   - Granular Keypoint Checklist: Classifies criteria into `Hit (Full Marks)`, `Partial (Half Marks)`, or `Missed (0 Marks)` with exact cited snippets from the student's text.
   - Decimal score calculations (e.g., `3.25 / 5.0` or `9.25 / 10.0`).

4. **Rapid Professor-in-the-Loop Review System**:
   - Hero Score card with direct decimal input and quick step chips (`-1.0`, `-0.5`, `-0.25`, `+0.25`, `+0.5`, `+1.0`).
   - Interactive 3-way status toggles: Tap `✓ Full`, `½ Half`, or `✕ 0` to override any point on the fly with live recalculation.
   - OCR transcription drawer with in-place text editor for correcting difficult doctor handwriting.
   - Tactile **"Accept Score & Next Paper ➔"** loop that logs to the gradebook, auto-increments the student roll number, and re-arms the paper viewer for the next student sheet without losing the rubric context.

5. **Batch Gradebook & Class Analytics**:
   - Live roster table tracking Roll No, Student Name, Subject, Final Score, AI status, and Professor remarks.
   - Real-time statistics: Total papers graded, class mean percentage, pass rate, and grading time saved counter.
   - One-click CSV Export and Print-ready Summary.

---

## 🚀 How to Run

### Option 1: Direct File Opening
Double-click `index.html` or open `C:\Users\eliza\.gemini\antigravity\scratch\anatomy-grader-mvp\index.html` in Google Chrome, Microsoft Edge, Safari, or Firefox.

### Option 2: PowerShell HTTP Server
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
This automatically hosts the app on `http://localhost:8080` and opens it in your browser.

---

## 📁 Project Structure

```
anatomy-grader-mvp/
├── index.html            # Main single-page web app container
├── serve.ps1             # Local PowerShell HTTP server & launcher
├── README.md             # Documentation & guide
├── css/
│   ├── main.css          # Core design system & medical slate tokens
│   ├── capture.css       # Camera viewfinder & paper viewer styles
│   ├── review.css        # Professor review hero card & checklist
│   ├── rubric.css        # Rubric builder & weight balancer styles
│   └── gradebook.css     # Gradebook table & analytics cards
└── js/
    ├── app.js            # Main application controller & loop
    ├── rubric.js         # Rubric manager & preset database
    ├── capture.js        # Camera & interactive viewer logic
    ├── samples.js        # Synthesized handwritten SVG papers
    ├── ai-service.js     # Gemini Vision API & offline NLP evaluator
    ├── review.js         # Review panel & interactive override toggles
    ├── gradebook.js      # Batch gradebook store & CSV exporter
    └── icons.js          # SVG icon assets
```

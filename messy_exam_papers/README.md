# Realistic Messy Student Exam Papers Test Suite

This folder contains authentic test papers demonstrating GradeCrow's multimodal OCR on hurried term-exam handwriting with realistic student errors, cross-outs, and corrections.

## Test Papers Included

1. **01_vikram_malhotra_cbse_rushed** (`.html`, `.svg`, `.pdf`)
   - **Student**: Vikram Malhotra (Roll: `CBSE-10-103`)
   - **Subject**: CBSE Class 10 Science (Physics & Chemistry)
   - **Handwriting Style**: Indian student cursive (Google Font: *Kalam*) in blue ballpoint ink (`#1e40af`).
   - **Messy Elements**:
     - Scribbled out inverted resistance formula: `~~R ∝ A~~ -> R ∝ 1/A`
     - Crossed-out formula: `~~R = rho * (A / L)~~ -> R = ρ * (L / A)`
     - Caret insertion: `^ Rusting requires BOTH Oxygen (O2) and Water/moisture (H2O)!`
   - **Ground Truth**: High-scoring paper (13.5 / 15.0) despite hurried scribbles.

2. **02_devika_sengupta_cs_ai_hurried** (`.html`, `.svg`, `.pdf`)
   - **Student**: Devika Sengupta (Roll: `CS-2026-004`)
   - **Subject**: Computer Science & AI Master Paper
   - **Handwriting Style**: Thin, fast pencil scrawl (Google Font: *Reenie Beanie*) in graphite grey (`#374151`).
   - **Messy Elements**:
     - QuickSort worst-case strikethrough: `~~Worst Time: O(N log N)~~ -> O(N^2)`
     - Modular inverse scribble: `~~e * d = 0 mod phi~~ -> e * d ≡ 1 mod phi(n)`
     - Fast calculus notation and derivation lines.
   - **Ground Truth**: Solid derivation (21.5 / 25.0).

3. **03_arjun_ramaswamy_anatomy_panic** (`.html`, `.svg`, `.pdf`)
   - **Student**: Arjun Ramaswamy (Roll: `MED-2024-006`)
   - **Subject**: Human Anatomy - Upper Limb & Axilla
   - **Handwriting Style**: Angular rush (Google Font: *Shadows Into Light*) in black rapid gel ink (`#111827`).
   - **Messy Elements**:
     - Scratched out nerve root cords: `~~Posterior cord gives ulnar nerve~~ -> Post cord gives Radial & Axillary nerves!`
     - Hurried bullet points and anatomical abbreviations.
   - **Ground Truth**: 4.5 / 5.0.

## How to Test

- **Print & Scan**: Print any of the `.pdf` files on A4 paper and test the Hands-Free Auto-Scan camera mode on your smartphone!
- **Upload**: Upload the `.pdf` or `.svg` directly in GradeCrow.
- **In-App Demo**: These papers are also available under the "Try Demo Paper" drawer with the `🔥 Rushed Term Exam` badge.

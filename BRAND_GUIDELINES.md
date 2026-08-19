# 🦅 GradeCrow AI — Brand Guidelines & Identity System

> **Domain**: `gradecrow.com`  
> **Tagline**: *"Sharp eyes. Fair marks. Zero grading fatigue."*  
> **Mission**: Empower educators with the world’s cleverest AI companion for grading handwritten exams.

---

## 1. The Brand Origin & Story

### Why the Crow?
In ornithology and cognitive science, the **Crow (Corvid)** is celebrated as the **smartest creature in the animal kingdom**—capable of crafting tools, recognizing human faces, and solving multi-step logical puzzles that stump other animals. 

In ancient lore (such as Odin’s ravens *Huginn* and *Muninn*), corvids represent **Thought** and **Memory**—constantly observing the world and retaining knowledge with total clarity.

### The Narrative Arc
Teachers and professors are drowning under mountains of handwritten exam papers. The process of grading is repetitive, exhausting, and prone to fatigue bias late at night.

When faced with a complex, repetitive challenge in nature, the crow doesn't just work harder—**it crafts a clever tool**. 

**GradeCrow** is that tool: a sharp-eyed, intelligent assistant perched on the teacher’s phone or laptop. It reads messy handwriting with acute vision, anchors every point to the professor's rubric, and delivers fair, instant evaluations in seconds—giving educators their weekends and evenings back.

---

## 2. Core Brand Pillars

| Pillar | Meaning | Proof in Product |
| :--- | :--- | :--- |
| **🦅 Acute Vision** | Catches every nuance in human handwriting. | Multimodal Vision OCR (Gemini 2.0 / 1.5 Flash) trained to read real medical, science, and humanities scripts. |
| **🧠 Deep Semantic Thought** | Grades concepts, not just robotic keyword matching. | Proximity-window concept resolver & AI justification citations. |
| **⚖️ Unwavering Fairness** | Objective, rubric-anchored marking with zero fatigue. | Strict point-by-point criteria checks with teacher override control. |
| **🛠️ Effortless Simplicity** | Designed for busy teachers, not machine learning engineers. | 2-step flow: Pick question $\rightarrow$ Snap photo $\rightarrow$ Done. |

---

## 3. Brand Voice & Tone

* **Clever & Insightful**: Speaks with clarity, intelligence, and sharp wit.
* **Supportive & Empathetic**: Acknowledges the immense dedication and fatigue teachers experience.
* **Precise & Objective**: Clear reasoning for every mark awarded.
* **Friendly & Accessible**: No intimidating AI jargon; welcoming and intuitive.

### Messaging & Taglines
* **Primary Tagline**: *"Sharp eyes. Fair marks. Zero grading fatigue."*
* **Secondary**: *"The cleverest way to grade handwritten exams."*
* **Action Hook**: *"Snap. Evaluate. Graded in seconds."*
* **Value Hook**: *"From handwritten ink to instant grades."*

---

## 4. Visual Identity & Color Palette

GradeCrow combines the focused authority of **Midnight Obsidian** with the vibrant, approachable freshness of **Somhi Mint Teal**.

```
┌────────────────────────────────────────────────────────┐
│  Primary Accent: Somhi Mint Teal   (#00A991)           │
│  Deep Contrast:  Midnight Obsidian (#1F252E)           │
│  Secondary Ink:  Slate Navy        (#5F6B7A)           │
│  Background:     Crisp Cloud       (#F5F7F9)           │
│  Surface:        Pure White        (#FFFFFF)           │
│  Border:         Soft Slate        (#E2E8F0)           │
└────────────────────────────────────────────────────────┘
```

### Color Codes
* **Somhi Mint Teal (`#00A991`)**: Primary buttons, badges, score accents, active states.
* **Teal Hover (`#009882`)**: Button hover states and interactive highlights.
* **Mint Tint (`#E6F7F5`)**: Soft alert backgrounds, selected cards, pill badges.
* **Midnight Obsidian (`#1F252E`)**: Main headers, hero text, logo emblem.
* **Slate Navy (`#5F6B7A`)**: Body text, secondary metadata, tool icons.
* **Emerald (`#10B981`)**: Full marks (`✓ Full`), pass pills, success toasts.
* **Amber (`#F59E0B`)**: Partial marks (`½ Half`), teacher override flags.
* **Rose (`#E11D48`)**: Missed criteria (`✕ 0`), delete actions.

---

## 5. Typography

* **Primary Interface Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Roboto`, `sans-serif`
* **Display / Brand Font**: `Plus Jakarta Sans` (Bold, 800 weight for headers and logo)
* **Handwriting Simulation**: `Caveat`, `cursive` (Used for realistic exam sheet demo rendering)

---

## 6. Logo & Mascot Specs

The **GradeCrow Mascot** is a sleek, minimalist geometric crow:
* Perched confidently with keen, intelligent posture.
* Wearing distinctive round academic spectacles (representing focus & precision).
* Crowned with a subtle mortarboard / graduation cap tassel.
* Rendered in crisp vector SVG for responsive scaling across mobile viewports, favicons, and banners.

---

## 7. Product Architecture & Storage Keys

* **App Title**: `GradeCrow AI`
* **Storage Keys**:
  * Active API Key: `gradecrow_gemini_api_key` *(Fallback: `gradepilot_*`, `anatomigrade_*`)*
  * Active Rubric: `gradecrow_current_rubric`
  * Custom Question Bank: `gradecrow_custom_rubrics`
  * Gradebook Session: `gradecrow_gradebook_records`
* **Export Filename**: `GradeCrow_YYYY-MM-DD.csv`

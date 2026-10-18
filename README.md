# PrepPilot AI – Smart Exam Preparation & 100-MCQ Scheduler

> **100% Pure Python Application** — React aur Node.js ki koi zaroorat nahi hai. Aap ise sirf Python se chala sakte hain!

**PrepPilot AI** is an intelligent, full-stack examination preparation platform engineered for students and aspirants preparing for competitive examinations (UGC NET, GATE, UPSC, Banking, State PSCs), university finals, and board exams.

---

## ⚡ Quick Start: Sirf Python Se Kaise Chalayein (No Node.js / No React)

Agar aapko **React** aur **Node.js** use nahi karna hai, aur sirf **Python** use karna hai:

### Windows:
1. Bas `run.bat` file par double-click karein:
   ```cmd
   run.bat
   ```
2. Ya terminal / command prompt me ye command run karein:
   ```cmd
   python main.py
   ```
3. Aapka browser automatic open ho jayega: **`http://localhost:5000`**

### Mac / Linux:
```bash
python3 main.py
# ya:
./run.sh
```

> **Note**: Iske liye koi `npm install`, koi `node`, ya koi `pip install` bhi nahi chahiye! Ye Python ki standard library (`http.server`, `urllib`, `json`, `hashlib`) par 100% standalone chalta hai.

---

## 🌟 Key Features & Capabilities

### 1. 100-Question MCQ Paper Generator (Full Mock Exams)
- **Preset Buttons**: Quick 1-click presets for `10 Qs`, `25 Qs`, `50 Qs`, and `100 Qs (Full Mock Exam)`.
- **High-Yield Syllabus Mapping**: Generates structured multiple-choice questions with 4 choices (A, B, C, D), correct answers, and thorough explanations.
- **Configurable Parameters**: Topic/chapter name, subject category, difficulty tier (*Easy*, *Medium*, *Hard*), and time limit.

### 2. Official Printable A4 PDF Layout by Default
- **Authentic Examination Header**:
  - Name of Candidate & Roll Number entry box.
  - Exam Center & Invigilator Signature lines.
  - Allowed Time (e.g. 120 Minutes), Maximum Marks (100 Marks), and Negative Marking (-0.25 Mark).
  - Official candidate instructions.
- **One-Click Print / PDF Export**: Click the **Print to PDF** button (`Ctrl + P` / `Cmd + P`) to generate a clean, official A4 examination paper without any website buttons or clutter.

### 3. Answer Protection & Interactive "See Answer" Buttons
- **Answers Hidden by Default**: During practice or mock test taking, answers and explanations are strictly hidden to ensure genuine self-evaluation.
- **Individual Question Toggle**: Each question has a dedicated button:
  `[ 👁️ Click to See Answer for Q... ]`
  Clicking reveals the correct option and detailed concept explanation for that specific question.
- **Master Reveal Button**: A top master button (`[ 👁️ Reveal All Answers ]`) allows candidates or instructors to reveal or hide all 100 answers at once.
- **Official Answer Key Matrix**: At the end of the paper, an official solution grid (Q1: B, Q2: C, etc.) is automatically generated for fast optical grading.

### 4. Dedicated Student Registration & Clean Database
- **Fresh Zero-Sample Database**: The application database (`prep_pilot_db.json`) is initialized with **zero sample data**.
- **Student Registration**: First-time users can register with their name, email, and password (securely hashed with SHA-256).
- **One-Click Database Purge / Reset**: In **Settings & Reset DB**, there is a prominent button to wipe and restore the database to an empty, pristine state whenever needed.

### 5. Interactive Timed Online Test Simulation
- **Live Countdown Timer**: Real-time test clock with automatic submission when time expires.
- **Instant Result & Scoring**: Calculates total score considering negative marking:
  $$\text{Total Score} = (\text{Correct} \times 1.0) - (\text{Incorrect} \times 0.25)$$
- Breakdown of Correct, Incorrect, Unattempted, and Percentage score.

### 6. Algorithmic Day-by-Day Study Scheduler
- Generates structured day-by-day learning tasks leading up to your target exam date.

---

## 📂 Project Architecture

```text
├── main.py                      # 100% Pure Python self-contained application (Zero Node/React)
├── run.bat                      # One-click Windows runner (runs python main.py)
├── run.sh                       # Linux/Mac runner
├── setup.bat                    # Environment check script
├── prep_pilot_db.json           # JSON database storage (Clean state, zero sample data)
├── README.md                    # Project documentation & instructions
│
├── app.py                       # Alternative Flask backend (for XAMPP/MySQL users)
├── config.py                    # Python configuration
├── requirements.txt             # Optional Flask dependencies
├── schema.sql                   # MySQL relational schema
│
├── server.ts                    # Full-stack Node.js server (AI Studio cloud preview engine)
├── src/                         # React/TypeScript source files (AI Studio web container)
├── package.json                 # Node.js manifest
└── vite.config.ts               # Vite configuration
```

---

## ⚙️ How It Works (Python Architecture)

When you run `python main.py`:
1. It initializes an HTTP server using Python's built-in `http.server` on port `5000`.
2. It loads/initializes `prep_pilot_db.json` with empty arrays for users, exams, question papers, and test attempts.
3. It serves the responsive user interface directly to your browser.
4. If a Google Gemini API key is configured in the environment (`GEMINI_API_KEY`), it calls Gemini via Python's built-in `urllib.request`. Otherwise, its built-in curriculum engine generates comprehensive mock examination questions deterministically.

---

## 💻 System Requirements

- **Python 3.10 or higher** installed and added to PATH.
- Any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
- **No Node.js or React required.**

---

## 📜 Creator & Copyright Signature

- **Project Creator & Lead Architect**: **atharvacybercafe**
- **Copyright**: © 2026 **atharvacybercafe**. All Rights Reserved.
- **Support & Inquiries**: atharvadhawane789@gmail.com


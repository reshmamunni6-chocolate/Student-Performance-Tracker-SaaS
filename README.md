# Student Performance Tracker SaaS

A responsive student performance dashboard made with **HTML, CSS, and vanilla JavaScript**. Enter subject marks, calculate percentages and grades, track performance, and export records to CSV.

## Features
- Add, edit, and delete student records
- Multiple subjects per student, each scored out of 100
- Automatic total marks, maximum marks, percentage, and grade calculations
- Passing check: each subject must have at least 35/100
- Dashboard: student count, average percentage, top performer, passing records
- Search students by name, roll number, class/course, or subject
- Filter by grade
- Performance bar chart for up to ten students
- Export records as a CSV file
- Responsive desktop, tablet, and mobile layout
- Browser Local Storage persistence

## Project files
- `index.html` — application structure
- `style.css` — styling and responsive layout
- `script.js` — calculations, student records, chart, filters, and CSV export
- `README.md` — project guide

## Run locally
1. Download and extract the ZIP.
2. Open the extracted folder.
3. Double-click `index.html` to open it in a modern browser.

No installation or build tools are needed. Google Fonts are optional; the app itself works without them.

## Example grading scale
- A+: 90% and above
- A: 80–89.99%
- B: 70–79.99%
- C: 60–69.99%
- D: 35–59.99%
- F: below 35%

The sample passing rule requires every subject to have at least 35 marks out of 100. Adjust the rules in `script.js` to match your institution's policy.

## Publish with GitHub Pages
1. Create a repository named `student-performance-tracker-saas`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then click **Save**.
6. When deployment finishes, the URL will usually be:
   `https://YOUR-GITHUB-USERNAME.github.io/student-performance-tracker-saas/`

Replace `YOUR-GITHUB-USERNAME` with your GitHub username.

## SaaS note
This is a SaaS-style frontend demo. Records are saved in the current browser and do not sync across devices or users. Real multi-user accounts, cloud storage, authentication, and subscription billing require a secure backend.

## Future improvements
- Secure student and teacher login
- Cloud database and multi-device synchronization
- Import marks from CSV
- Term-wise reports and downloadable report cards
- Configurable grading policies
- Teacher/classroom access controls

## License
You may use and modify this project for educational and student-project purposes.

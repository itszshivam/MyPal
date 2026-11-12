::: {align="center"}
# MyPal ONE

### One intelligent companion for clearer, safer digital payments.

**Understand your payments. Know what to do next.**

[![Watch the complete
demo](https://img.shields.io/badge/▶_WATCH_COMPLETE_PROJECT_DEMO-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](YOUR_YOUTUBE_VIDEO_URL)
[![Built with
React](https://img.shields.io/badge/Frontend-React_+_TypeScript-3178C6?style=flat-square&logo=react&logoColor=white)](#technology-stack)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](#technology-stack)

**Hackathon Submission \| Team: Shivam Kumar & Sahithi**
:::🎬 Full Project Walkthrough
Judges: Start here. The video below demonstrates the complete
application flow, including the main features and how to run the
project.

<!-- Replace YOUR_YOUTUBE_VIDEO_ID with the video ID from your YouTube URL. -->
::: {align="center"}
`<a href="YOUR_YOUTUBE_VIDEO_URL">`{=html}
`<img src="https://img.youtube.com/vi/YOUR_YOUTUBE_VIDEO_ID/maxresdefault.jpg" alt="Watch the complete MyPal ONE walkthrough" width="85%">`{=html}
`</a>`{=html} `<br>`{=html}
`<a href="YOUR_YOUTUBE_VIDEO_URL">`{=html}`<strong>`{=html}▶ Watch the
complete MyPal ONE demo on YouTube`</strong>`{=html}`</a>`{=html}
:::Video checklist: Show the app starting, dashboard, ONE Track, ONE
Resolve, ONE Assist, ONE Shield, ONE Cases, ONE Insights, ONE Access+,
and the Send/Receive + ONE Global demo flow. Include the terminal
commands used to start the frontend and backend.
💡 What is MyPal ONE?
Digital payments are fast and convenient, but when a transaction is
pending, fails, or looks unfamiliar, users can be left wondering:
- Did the payment go through?
- Why is it pending or failed?
- What should I do next?
- How can I identify a suspicious payment request?
- Where can I keep track of a complaint or support case?
MyPal ONE is a smart payment companion that brings payment tracking,
guided issue resolution, safety awareness, support management and
payment insights into one experience.

Rather than showing only a transaction status, MyPal ONE aims to help
users understand the situation and find a clear next step.
🎯 The Problem We Address
Payment experiences can become confusing when information is spread
across transaction histories, bank messages, support channels and help
pages. Users may not know how to interpret a status or where to begin
resolving an issue.
✨ Our Solution
MyPal ONE combines multiple payment-support capabilities in one
dashboard. It is designed around three ideas:
1. Clarity --- make payment information easier to understand.
2. Guidance --- bring useful next steps closer to the user.
3. Confidence --- help users notice potential risks and organize
   support information.
🚀 Key Features
  Module                              Purpose
  ONE Dashboard                   Central overview of the demo
account, balance and important
actions.

  ONE Track                       Follow payment records and
understand their current status.

  ONE Resolve                     Guided support experience for
payment issues, with Smart Journey
and Smart Alerts together in one
place.

  ONE Assist                      Conversational help using the
transaction context available to
the application.

  ONE Shield                      Basic safety-awareness checks for
suspicious messages and payment
requests.

  ONE Cases                       Organize support cases, references
and progress.

  ONE Insights                    View insights from the sample/demo
transaction data.

  ONE Access+                     Accessibility-focused options and
clearer guidance.

  ONE Wallet                      View the demo balance and try
simulated send/receive flows.
ONE Global                      Select supported currencies and
view exchange-rate estimates.
🧭 Typical User Journey
1. Open the dashboard and review the account overview.
2. Use ONE Track to inspect a payment.
3. If something needs attention, go to ONE Resolve for guided next
   steps.
4. Use ONE Assist for help understanding the available transaction
   context.
5. Use ONE Shield to review a suspicious message or payment
   request.
6. Keep a complaint organized in ONE Cases.
7. Review patterns through ONE Insights.
🏗️ Technology Stack
  Layer                Technologies
  Frontend             React, TypeScript, Vite
UI icons             Lucide React
Backend              Python, FastAPI
Exchange-rate data   Open ER API (open.er-api.com)
▶️ Run the Project Locally
Prerequisites
- Node.js and npm
- Python 3.10 or newer
- Git
1. Clone this repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
2. Start the backend
Open a terminal in the backend folder.
cd backend
Create and activate a virtual environment if your setup uses one, then
install dependencies:
pip install -r requirements.txt
Start the FastAPI server using the entry point configured in this
repository. For a typical main.py entry point:
uvicorn main:app --reload
The backend should be available at http://127.0.0.1:8000 unless
configured otherwise.
3. Start the frontend
Open a second terminal in the folder containing the frontend
package.json. In this project layout, that may be the frontend
folder:
cd frontend
npm install
npm run dev
Open the local URL printed by Vite in your terminal.
Repository layout note: Run the commands from the folders that
contain the relevant package.json, requirements.txt and FastAPI
entry point. If your local folder layout differs, use the
corresponding project directory.

🧪 Demo & Implementation Notes
- Wallet transfers are simulated. Send/Receive actions update the
  demo wallet and create local demo records; they do not transfer real
  money.
- Demo receipts are not payment confirmations. They are generated
  by the prototype for demonstration purposes.
- ONE Global provides exchange-rate estimates. Rates may change
  and depend on the external rate service being reachable.
- ONE Assist depends on the backend. Start the FastAPI service to
  use the configured assistant endpoint.
- The project should be evaluated as a hackathon prototype, not as a
  production banking or payment service.
👥 Team
::: {align="center"}
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Shivam                                                                                                                                     Sahithi
  ------------------------------------------------------------------------------------------------------------------------------------------ ---------------------------------------------------------------------------------------------------------------------------------------------
  Project Contributor                                                                                                                        Project Contributor

  [![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)](https://github.com/itszshivam)   [![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)](https://github.com/sahithi2424)
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
:::::: {align="center"}
### MyPal ONE

**Making digital payments easier to understand.**

Built with dedication by **Shivam Kumar & Sahithi** for the hackathon.
:::

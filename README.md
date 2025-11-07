<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bundled/ask_the_manual

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in a local env file (see `.env.example`) to your Gemini API key. Example file is `.env.local`.
   - Create a file named `.env.local` in the project root with the contents:

     VITE_GEMINI_API_KEY=your_gemini_api_key_here

3. Run the app:
   `npm run dev`

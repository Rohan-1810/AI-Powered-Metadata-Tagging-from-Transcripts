# AGENTS.MD — Development Rules & Operating Principles

This document defines the strict operating rules and architectural constraints for the **MetaMind AI** (AI-Powered Transcript Metadata Tagging Platform) hackathon project. All developers, agents, and subagents must strictly adhere to these rules without exception.

## Mandatory Operating Rules

1. **Technology Stack Preservation**: Never change or substitute the technology stack (React + Vite + Tailwind on Client, Node.js + Express + Mongoose on Backend, Python FastAPI + spaCy + NLTK VADER + Transformers + KeyBERT on AI Service) without explicit permission.
2. **Deterministic API Contracts**: Never invent API routes or alter existing route schemas. The AI service contract (`/analyze`) and Backend routes (`/api/auth/*`, `/api/transcripts/*`) must remain strictly synchronized with documentation.
3. **Database Integrity**: Never invent database fields or omit required schema fields. The database models (`User` and `Transcript`) must match the specified specifications precisely.
4. **Environment Variables**: Never invent arbitrary environment variable names. Use only designated variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `AI_SERVICE_URL`, `CLIENT_URL`, `HF_TOKEN`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `VITE_API_BASE_URL`). Provide `.env.example` templates.
5. **Security & Secrets**: Never hard-code credentials, passwords, or API keys in source files or frontend code. Passwords must always be hashed with bcrypt; JWT tokens must be signed securely.
6. **Integrity & Verification**: Never fabricate test results or fake API responses. Never claim success without running and verifying the application, endpoints, and test suites.
7. **Explicit Assumptions**: State all assumptions explicitly. If a requirement is ambiguous or underspecified, request clarification before making a breaking architectural decision.
8. **Incremental Evolution**: Make small, cohesive, incremental changes. Test each module thoroughly before advancing to dependent layers.
9. **Contract Synchronization**: Keep Frontend, Backend, and AI Service contracts strictly aligned at all times.
10. **Model Transparency**: Do not silently replace an unavailable library or model. If a model fails to load or cannot be downloaded, log and report the exact error with graceful degradation.
11. **Real Data Only**: Do not fabricate metadata in the UI or use dummy mock objects once backend/AI integration is present. Visualizations and tables must render actual pipeline output.
12. **Responsiveness & UX Standards**: The entire application must be fully responsive across mobile (360px–414px), tablet (768px–1024px), laptop (1280px–1440px), and desktop (1920px). No horizontal overflow, broken cards, or unreadable charts.
13. **Regression Prevention**: Maintain existing working functionality when adding new features or refactoring.

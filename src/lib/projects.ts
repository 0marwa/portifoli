import type { Project } from "@/types";

// Display order = array order.
export const PROJECTS: Project[] = [
  {
    id: "cittitrip",
    title: "CittiTrip",
    pitch: "AI travel planner",
    description:
      "AI-powered travel planner. Next.js + React Native frontend, TypeScript business logic, external API integrations. Designed and shipped the full stack autonomously.",
    role: "full-stack · AI agents",
    context: "Personal project",
    tags: ["Next.js", "React Native", "TypeScript"],
    image: "/images/projects/cittitrip.png",
    links: [{ label: "github", url: "https://github.com/0marwa/citti-trip" }],
  },
  {
    id: "rag-chatbot",
    title: "RAG Chatbot",
    pitch: "RAG document chatbot",
    description:
      "Drop in any documents, ask questions, get answers grounded solely in those docs, not from general knowledge. Built as a reusable skeleton: Next.js frontend, FastAPI backend, Supabase pgvector for cosine similarity search, sentence-transformers running privately on the backend, Groq LLM (swappable via env). Session-isolated, no fine-tuning required.",
    role: "full-stack · skeleton project",
    tags: ["Next.js", "FastAPI", "Supabase", "pgvector", "Python"],
    links: [
      { label: "github", url: "https://github.com/0marwa/rag-chatbot" },
      { label: "live demo", url: "https://rag-chatbot-seven-tan.vercel.app/" },
    ],
  },
  {
    id: "feedme",
    title: "FeedMe",
    pitch: "meal-sharing Android app",
    description:
      "Android app built in a 14-week SCRUM team project at EPFL (CS311). Allows you to scan ingredients and recognizes them (classification), then generates personalized meal recommendations. Covered ideation → Figma prototyping → Kotlin development → user testing → final demo. Awarded 2nd place at Battle of the Apps 2023.",
    role: "mobile · SCRUM team · EPFL",
    context: "EPFL CS311 · 14-week team project",
    outcome: "2nd place, Battle of the Apps 2023",
    tags: ["Kotlin", "Android Studio", "Figma", "SCRUM", "Machine Learning"],
    links: [{ label: "github", url: "https://github.com/feedme-swent-epfl/feedme-android" }],
  },
  {
    id: "scala-webapp",
    title: "Web App",
    pitch: "full-stack coursework",
    description:
      "Academic web application built for EPFL's Software Construction course. Focused on software architecture, clean separation of concerns, and UI implementation in Scala.",
    role: "EPFL · team",
    context: "EPFL Software Construction course",
    tags: ["Scala", "Web", "EPFL"],
    links: [{ label: "github", url: "https://github.com/0marwa" }],
  },
];

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  tag: string;
  image_url?: string | null;
}

export const defaultPosts: BlogPost[] = [
  {
    id: "pagal-basti",
    title: "Pagal Basti: Exploring Love, Ego, and Existential Madness",
    date: "July 21, 2026",
    excerpt: "Set against the scenic backdrops of Pokhara and the remote Himalayan village of Ghandruk, the narrative begins through the eyes of a curious journalist drawn to tales of an isolated, unconventional community. Sarubhakta uses an experimental storytelling structure: starting as a first-person journalistic account of a mysterious haven, the story gradually shifts into a deep, third-person psychological character study that breaks standard literary conventions.",
    tag: "Review of novel pagal-Basti",
  },
  {
    id: "building-rest-apis",
    title: "Building REST APIs with Node.js",
    date: "Feb 28, 2026",
    excerpt: "Step-by-step walkthrough of creating scalable RESTful APIs using Express.js and PostgreSQL.",
    tag: "Backend",
  },
  {
    id: "iot-journey",
    title: "My Journey into IoT with Arduino",
    date: "Jan 10, 2026",
    excerpt: "How I built my first IoT project — a smart sensor dashboard connected to the cloud.",
    tag: "IoT",
  },
];

export interface Project {
  id: string;
  title: string;
  tech: string;
  desc: string;
  github_url?: string | null;
  live_url?: string | null;
  image_url?: string | null;
  video_url?: string | null;
}

export const defaultProjects: Project[] = [
  {
    id: "attendance-prediction",
    title: "MACHINE LEARNING BASED EVENTS PARTICIPANTS PRESENCE PREDICTION SYSTEM WITH FACIAL ATTENDANCE",
    tech: "Python,Fullstack",
    desc: "ML based events participants presence prediction system with facial attendence where admin can view attendance of participants and also predict the participants if he/she comes or not on events.",
  },
  {
    id: "e-commerce-platform",
    title: "E-Commerce Platform",
    tech: "Full-stack (MERN)",
    desc: "Full-stack web application with payment integration, inventory management, and analytics dashboard. such as e-learning,ecommerce",
  },
  {
    id: "portfolio-blog-cms",
    title: "Portfolio & Blog CMS",
    tech: "Next.js · Tailwind · Supabase",
    desc: "Custom content management system with markdown support, SEO optimization, and dynamic theming.",
  },
  {
    id: "iot-smart-dashboard",
    title: "IoT Smart Dashboard",
    tech: "React · MQTT · Arduino",
    desc: "Web dashboard for monitoring IoT sensor data in real-time with alerts and data visualization.",
  },
];

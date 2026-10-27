export type Category = {
  name: string;
  icon: string;
  description: string;
  status: "active" | "planned";
};

// Full roadmap navigation. A category is marked active when sample entries exist;
// this does not mean the category's tools have been implemented.
export const categories: Category[] = [
  { name: "All tools", icon: "layout-grid", description: "Browse the complete tool library.", status: "active" },
  { name: "Popular tools", icon: "star", description: "Frequently used tools from across every category.", status: "active" },
  { name: "PDF Tools", icon: "file-text", description: "Convert, combine, compress, and manage PDF files.", status: "active" },
  { name: "Image & Design Tools", icon: "image", description: "Convert, resize, compress, and edit image files.", status: "active" },
  { name: "Text & Content Tools", icon: "type", description: "Format, count, and transform text.", status: "active" },
  { name: "Developer & Coding Tools", icon: "code-2", description: "Format data, encode strings, and work with code.", status: "active" },
  { name: "SEO & Webmaster Tools", icon: "search", description: "Create and inspect useful SEO assets.", status: "active" },
  { name: "Calculators & Daily Utilities", icon: "calculator", description: "Quick answers for everyday calculations.", status: "active" },
  { name: "Video & Audio Tools", icon: "audio-lines", description: "Trim and convert media files.", status: "active" },
  { name: "Network & IP Tools", icon: "network", description: "Inspect network and domain information.", status: "active" },
  { name: "Programming Language Compilers", icon: "terminal", description: "Write and run programs in popular languages directly in your browser where supported.", status: "active" },
  { name: "Financial & Business Tools", icon: "wallet", description: "Calculate fees, taxes, returns, and invoices.", status: "active" },
  { name: "Unit & Measurement Converters", icon: "ruler", description: "Convert common units and measurements.", status: "active" },
  { name: "UI/UX & Web Design Tools", icon: "palette", description: "Build CSS effects, layouts, color systems, and web UI design helpers.", status: "active" },
  { name: "Social Media & Marketing Tools", icon: "share-2", description: "Create links and prepare social content.", status: "active" },
  { name: "Security & Privacy Tools", icon: "shield-check", description: "Privacy-conscious helpers and security utilities.", status: "active" },
  { name: "AI & Trendy Tools", icon: "sparkles", description: "AI-assisted writing and prompt helpers.", status: "active" },
  { name: "Education & Student Tools", icon: "graduation-cap", description: "Study, citation, and academic helpers.", status: "active" },
  { name: "Health & Fitness Calculators", icon: "heart-pulse", description: "General wellness estimates and calculators.", status: "active" },
  { name: "E-Commerce & Dropshipping Tools", icon: "shopping-bag", description: "Estimate margins, fees, and campaign metrics.", status: "active" },
  { name: "YouTube & Content Creator Tools", icon: "clapperboard", description: "Utilities for video and content creators.", status: "active" },
  { name: "Fun, Gaming & Social Generators", icon: "gamepad-2", description: "Fun names, text, and social generators.", status: "active" },
  { name: "Productivity & Remote Work Tools", icon: "clock-3", description: "Timers, time zones, and focus helpers.", status: "active" },
];

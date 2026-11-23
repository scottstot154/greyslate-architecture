import { z } from "zod";

export const categories = ["Residential", "Commercial", "Institutional", "Interiors", "Renovation", "Master Planning"] as const;
export const stages = ["Concept", "Design Development", "Approvals", "Construction", "Completed"] as const;
export const imageKinds = ["Photograph", "Site photograph", "Rendering", "Drawing"] as const;

export const slugSchema = z.string().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imageSource = z.string().max(500).refine((value) =>
  /^\/images\/[a-z0-9.-]+\.(jpg|jpeg|webp|png|avif)$/.test(value) ||
  /^\/media\/[a-f0-9-]{36}\.(jpg|webp|png|avif)$/.test(value),
  "Upload an image before saving."
);
export const imageSchema = z.object({
  src: imageSource,
  alt: z.string().trim().min(1, "Add an image description.").max(200),
  credit: z.string().trim().max(160),
  kind: z.enum(imageKinds),
});
const updateDate = z.string().date();
export const projectSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(100),
  category: z.enum(categories),
  stage: z.enum(stages),
  location: z.string().trim().min(1).max(100),
  year: z.string().trim().regex(/^\d{4}$/),
  scope: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(350),
  story: z.string().trim().min(1).max(5000),
  cover: imageSchema,
  gallery: z.array(imageSchema).max(24),
  updates: z.array(z.object({
    date: updateDate,
    title: z.string().trim().min(1).max(120),
    note: z.string().trim().min(1).max(1800),
    image: imageSchema.optional(),
  })).max(30),
  comparison: z.object({ before: imageSchema, after: imageSchema }).optional(),
  featured: z.boolean(),
  demo: z.boolean(),
}).superRefine((project, ctx) => {
  if (project.comparison && (project.category !== "Renovation" || project.stage !== "Completed")) {
    ctx.addIssue({ code: "custom", path: ["comparison"], message: "Before and after is only available for completed renovations." });
  }
  if (project.comparison && !project.demo &&
      [project.comparison.before, project.comparison.after].some((photo) => photo.kind !== "Photograph" && photo.kind !== "Site photograph")) {
    ctx.addIssue({ code: "custom", path: ["comparison"], message: "A published comparison needs two photographs of the actual space." });
  }
  if (project.comparison && project.comparison.before.src === project.comparison.after.src) {
    ctx.addIssue({ code: "custom", path: ["comparison"], message: "Use different before and after images." });
  }
});

export const studioSchema = z.object({
  email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  location: z.string().trim().max(120),
  showSamples: z.boolean(),
});

export type Project = z.infer<typeof projectSchema>;
export type Photo = z.infer<typeof imageSchema>;
export type Studio = z.infer<typeof studioSchema>;
export type ProjectEntry = { project: Project; published: boolean; updatedAt: string | null };

export const defaultStudio: Studio = { email: "", location: "", showSamples: true };
export const demoCredit = "AI-generated illustration";

function sample(name: string, alt: string): Photo {
  return { src: `/images/${name}.jpg`, alt, credit: demoCredit, kind: "Rendering" };
}

export const samples: Project[] = [
  {
    slug: "courtyard-house", title: "Courtyard House", category: "Residential", stage: "Completed",
    location: "Bengaluru", year: "2025", scope: "Architecture and interiors",
    summary: "A quiet family residence arranged around an existing tree and a series of shaded outdoor rooms.",
    story: "An existing tree became the starting point for the plan. Living spaces wrap around its canopy, with doors that open to a sheltered stone terrace. Board-formed concrete and timber give the house a simple material palette, while deep overhangs temper direct sun and monsoon rain.\n\nThe courtyard brings daylight and fresh air into the center of the house. Its edges offer places to sit, work or play at different times of day.",
    cover: sample("courtyard", "Concrete and timber residence framing a planted courtyard"),
    gallery: [sample("courtyard-interior", "Full-height windows look onto a sunlit courtyard")],
    updates: [], featured: true, demo: true,
  },
  {
    slug: "terracotta-works", title: "Terracotta Works", category: "Commercial", stage: "Completed",
    location: "Bengaluru", year: "2025", scope: "Workplace architecture",
    summary: "A workplace with a terracotta screen that shades meeting rooms and gives the street a distinct rhythm.",
    story: "Designed for a compact urban plot, the building sets out a simple distinction: active shared spaces face the street, while quieter work areas sit deeper in plan. A terra-cotta screen filters afternoon sun and gives the building a second layer of depth.\n\nAt street level, a recessed entrance creates a sheltered threshold between the city and the workplace.",
    cover: sample("terracotta", "Terracotta fins across a contemporary concrete workplace"),
    gallery: [], updates: [], featured: false, demo: true,
  },
  {
    slug: "the-learning-court", title: "The Learning Court", category: "Institutional", stage: "Construction",
    location: "Mysuru", year: "2026", scope: "Campus architecture",
    summary: "A learning pavilion that opens into a sequence of outdoor classrooms and shaded gathering spaces.",
    story: "The project uses the covered walkway as its organizing element. Rather than treating circulation as leftover space, the plan widens it in places for pin-up walls, group work and informal conversation. Brick and timber carry through from inside to out.",
    cover: sample("learning-court", "Brick learning pavilion with a timber roof under construction"),
    gallery: [],
    updates: [
      { date: "2026-10-08", title: "Roof structure takes shape", note: "The main roof frame is in place. Work now moves to the sheltered walkway and the edges of the outdoor classrooms.", image: sample("learning-court", "Brick pavilion and partially assembled roof structure") },
      { date: "2026-06-12", title: "Work begins on site", note: "Groundworks have started. The first setting-out marked the retained trees and the footprint of the central court." },
    ],
    featured: false, demo: true,
  },
  {
    slug: "verandah-house", title: "Verandah House", category: "Renovation", stage: "Completed",
    location: "Bengaluru", year: "2024", scope: "Adaptive reuse and interiors",
    summary: "A bungalow renovation that restores the timber roof and gives an overlooked living room a second life.",
    story: "The renovation started with a survey of what could stay. The timber trusses and shutters were repaired, the wall finishes were renewed, and the floor was repaired in a tone that picks up the original red-oxide palette.\n\nKeeping the plan largely intact made it possible to focus attention on daylight, cross-ventilation and the relationship between the room and its verandah.",
    cover: sample("verandah", "Renovated bungalow with exposed timber trusses and white walls"),
    gallery: [], updates: [], featured: false, demo: true,
    comparison: {
      before: sample("verandah-before", "Bungalow living room with worn floor and faded wall finishes"),
      after: sample("verandah-after", "The same bungalow room with restored timber and renewed wall and floor finishes"),
    },
  },
];

export function projectDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {timeZone: "UTC", day: "numeric", month: "short", year: "numeric"}).format(new Date(date));
}

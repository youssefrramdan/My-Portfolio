import SkillCategory from "../../src/modules/skills/skillCategory.model.js";
import SkillsSection from "../../src/modules/skills/skillsSection.model.js";
import { assetByName, uploadAsset } from "../lib/uploadAsset.js";

const FOLDER = "skills";

/**
 * Copy and chips taken exactly from the Figma "Tools & Stack" section (node 616:13929). The Figma icons are emoji,
 * kept as small SVGs so the card renders them like any uploaded icon.
 */
const CATEGORIES = [
  {
    title: "Backend Stack",
    icon: "skill-backend",
    items: ["Node.js", "NestJS", "TypeScript", "Python", "Go", "Express", "GraphQL", "Django"],
  },
  {
    title: "Data & Storage",
    icon: "skill-data",
    items: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Prisma ORM", "Kafka", "Elasticsearch"],
  },
  {
    title: "Cloud & DevOps",
    icon: "skill-cloud",
    items: ["Docker", "Kubernetes", "AWS", "CI/CD", "Nginx", "Linux", "GitHub Actions"],
  },
  {
    title: "Soft Skills",
    icon: "skill-soft-skills",
    items: ["Communication", "Problem Solving", "Ownership", "Collaboration"],
  },
];

export default async function seedSkills({ force }) {
  await SkillsSection.findOneAndReplace(
    {},
    { badge: "My Stack", title: { plain: "Tools &", highlight: "Stack." } },
    { upsert: true, runValidators: true },
  );

  const icons = await Promise.all(
    CATEGORIES.map(({ title, icon }) =>
      uploadAsset(assetByName("skills", icon), {
        folder: FOLDER,
        name: icon,
        alt: `${title} icon`,
        force,
      }),
    ),
  );

  // Categories are matched by title, so re-running updates them instead of adding duplicates.
  await Promise.all(
    CATEGORIES.map(({ title, items }, order) =>
      SkillCategory.findOneAndReplace(
        { title },
        { title, icon: icons[order], items, order, status: "published", draft: null, publishedAt: new Date() },
        { upsert: true, runValidators: true },
      ),
    ),
  );

  return SkillCategory.countDocuments();
}

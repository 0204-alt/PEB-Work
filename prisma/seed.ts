import { PrismaClient } from "../packages/database/generated/client/index.js";

const prisma = new PrismaClient();

const STANDARDS = [
  { code: "IS 800", title: "General Construction in Steel — Code of Practice" },
  { code: "IS 875 (Part 1)", title: "Code of Practice for Design Loads — Dead Loads" },
  { code: "IS 875 (Part 2)", title: "Code of Practice for Design Loads — Imposed Loads" },
  { code: "IS 875 (Part 3)", title: "Code of Practice for Design Loads — Wind Loads" },
  { code: "IS 875 (Part 4)", title: "Code of Practice for Design Loads — Snow Loads" },
  { code: "IS 875 (Part 5)", title: "Code of Practice for Design Loads — Special Loads and Combinations" },
  { code: "IS 1893", title: "Criteria for Earthquake Resistant Design of Structures" },
  { code: "NBC 2016", title: "National Building Code of India" },
];

async function main() {
  for (const s of STANDARDS) {
    await prisma.standard.upsert({
      where: { code: s.code },
      update: { title: s.title },
      create: {
        code: s.code,
        title: s.title,
        versions: {
          create: {
            edition: "TO_BE_CONFIRMED",
            notes: "Edition must be confirmed per project. No clauses are seeded as formulas.",
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Starting LaunchHub database reset (preserving categories and admin)...");

  try {
    // 1. Delete dependent user interactions
    console.log("Deleting reports, comments, views, votes, favorites...");
    await prisma.report.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.projectView.deleteMany({});
    await prisma.projectVote.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.notification.deleteMany({});

    // 2. Delete project relationships & projects
    console.log("Deleting project technologies, tags and projects...");
    await prisma.projectTechnology.deleteMany({});
    await prisma.projectTag.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.project.deleteMany({});

    // 3. Delete non-admin demo users & follows
    console.log("Deleting demo follows and non-admin demo users...");
    await prisma.follow.deleteMany({});
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: { not: "ADMIN" },
      },
    });

    console.log(`✅ Removed ${deletedUsers.count} demo users.`);
    console.log("🛡️ Admin account(s) and categories/technologies were preserved.");
    console.log("✨ Database successfully cleaned! Ready for real submissions.");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();

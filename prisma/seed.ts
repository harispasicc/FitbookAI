import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function atTime(base: Date, hours: number, minutes: number) {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function main() {
  await prisma.trainerAvailabilitySlot.deleteMany();
  await prisma.trainerWeeklyAvailability.deleteMany();
  await prisma.trainerReview.deleteMany();
  await prisma.trainerService.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  const trainerUser = await prisma.user.create({
    data: {
      email: "amina.trainer@fitbook.ai",
      role: UserRole.TRAINER,
      trainerProfile: {
        create: {
          fullName: "Amina Hadžić",
          bio: "Certified personal trainer focused on strength, mobility and sustainable fitness.",
          specialty: "Strength Training",
          services: {
            create: [
              {
                title: "1-on-1 Coaching",
                description: "Personalized online coaching session.",
                durationMinutes: 60,
                priceCents: 5000,
                sortOrder: 0,
              },
              {
                title: "Workout Plan",
                description: "Custom weekly workout plan.",
                durationMinutes: 30,
                priceCents: 2500,
                sortOrder: 1,
              },
            ],
          },
          reviews: {
            create: [
              {
                authorName: "Demo Client",
                rating: 5,
                comment: "Great coach, very clear and motivating.",
              },
              {
                authorName: "Marko S.",
                rating: 5,
                comment: "Sessions are structured and progress is easy to track.",
              },
            ],
          },
          weeklyAvailability: {
            create: [
              { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
              { dayOfWeek: 5, startTime: "09:00", endTime: "14:00" },
            ],
          },
        },
      },
    },
    include: { trainerProfile: true },
  });

  const trainerId = trainerUser.trainerProfile!.id;
  const now = new Date();

  await prisma.trainerAvailabilitySlot.createMany({
    data: [
      {
        trainerProfileId: trainerId,
        startsAt: atTime(addDays(now, 2), 7, 30),
        endsAt: atTime(addDays(now, 2), 8, 30),
      },
      {
        trainerProfileId: trainerId,
        startsAt: atTime(addDays(now, 3), 12, 0),
        endsAt: atTime(addDays(now, 3), 13, 0),
      },
      {
        trainerProfileId: trainerId,
        startsAt: atTime(addDays(now, 4), 18, 15),
        endsAt: atTime(addDays(now, 4), 19, 15),
      },
      {
        trainerProfileId: trainerId,
        startsAt: atTime(addDays(now, 6), 10, 0),
        endsAt: atTime(addDays(now, 6), 11, 0),
      },
    ],
  });

  console.log("Seed completed:", trainerUser.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

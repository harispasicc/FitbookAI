import "dotenv/config";
import bcrypt from "bcryptjs";
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

function buildDemoAvailabilitySlots(
  now: Date,
  trainerProfileId: string,
  primaryServiceId: string,
  secondaryServiceId: string | undefined,
) {
  const plan: {
    dayOffset: number;
    hour: number;
    minute: number;
    durationMin: number;
    useSecondary?: boolean;
  }[] = [
    { dayOffset: 2, hour: 9, minute: 30, durationMin: 60 },
    { dayOffset: 2, hour: 14, minute: 0, durationMin: 60 },
    { dayOffset: 3, hour: 12, minute: 0, durationMin: 60 },
    { dayOffset: 4, hour: 18, minute: 15, durationMin: 60 },
    { dayOffset: 5, hour: 10, minute: 0, durationMin: 60 },
    { dayOffset: 7, hour: 11, minute: 0, durationMin: 60 },
    { dayOffset: 10, hour: 9, minute: 0, durationMin: 60 },
    { dayOffset: 10, hour: 15, minute: 30, durationMin: 60 },
    { dayOffset: 14, hour: 13, minute: 0, durationMin: 60 },
    { dayOffset: 21, hour: 10, minute: 0, durationMin: 60, useSecondary: true },
    { dayOffset: 28, hour: 16, minute: 0, durationMin: 30, useSecondary: true },
  ];

  const minStart = now.getTime() + 36 * 60 * 60 * 1000;

  return plan
    .map((entry) => {
      const serviceId =
        entry.useSecondary && secondaryServiceId
          ? secondaryServiceId
          : primaryServiceId;
      const dayBase = addDays(now, entry.dayOffset);
      const startsAt = atTime(dayBase, entry.hour, entry.minute);
      const endsAt = new Date(startsAt.getTime() + entry.durationMin * 60 * 1000);
      return {
        trainerProfileId,
        serviceId,
        startsAt,
        endsAt,
        isBooked: false,
      };
    })
    .filter((slot) => slot.startsAt.getTime() >= minStart);
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.clientNotification.deleteMany();
  await prisma.clientWorkout.deleteMany();
  await prisma.clientGoals.deleteMany();
  await prisma.trainerAvailabilitySlot.deleteMany();
  await prisma.trainerWeeklyAvailability.deleteMany();
  await prisma.trainerReview.deleteMany();
  await prisma.trainerService.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  const clientPasswordHash = await bcrypt.hash("demo1234", 10);

  const trainerUser = await prisma.user.create({
    data: {
      email: "amina.trainer@fitbook.ai",
      password: await bcrypt.hash("demo1234", 10),
      role: UserRole.TRAINER,
      trainerProfile: {
        create: {
          fullName: "Amina Hadžić",
          bio: "Certified personal trainer focused on strength, mobility and sustainable fitness.",
          specialty: "Strength Training",
          yearsExperience: 8,
          plan: "PRO",
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

  const demoServices = await prisma.trainerService.findMany({
    where: { trainerProfileId: trainerId },
    orderBy: { sortOrder: "asc" },
  });
  const primaryServiceId = demoServices[0]?.id;
  const secondaryServiceId = demoServices[1]?.id;

  if (!primaryServiceId) {
    throw new Error("Seed failed: trainer has no services");
  }

  const slotData = buildDemoAvailabilitySlots(
    now,
    trainerId,
    primaryServiceId,
    secondaryServiceId,
  );

  if (slotData.length < 6) {
    throw new Error("Seed failed: not enough future availability slots generated");
  }

  const { count: slotCount } = await prisma.trainerAvailabilitySlot.createMany({
    data: slotData,
  });

  await prisma.user.create({
    data: {
      email: "marko.client@fitbook.ai",
      password: clientPasswordHash,
      role: UserRole.CLIENT,
      clientProfile: {
        create: {
          fullName: "Marko S.",
          headline: "Building strength 3× per week",
          city: "Sarajevo",
          timezone: "Europe/Sarajevo",
          bio: "Prefer morning sessions and compound lifts.",
          selectedTrainerProfileId: trainerId,
          goals: {
            create: {
              activeGoal: "CONDITIONING",
              pctLose: 34,
              pctMuscle: 52,
              pctConditioning: 68,
              pctRehab: 41,
            },
          },
          workouts: {
            create: [
              {
                workoutDate: atTime(addDays(now, -9), 18, 0),
                type: "Lower strength",
                durationMin: 58,
                calories: 412,
                trainerNote:
                  "Depth looked solid. Add 2.5kg next week if RPE stays ≤8.",
              },
              {
                workoutDate: atTime(addDays(now, -11), 17, 30),
                type: "Conditioning",
                durationMin: 42,
                calories: 498,
                trainerNote: "Hold 85% on the bike. Great pacing in round 3.",
              },
              {
                workoutDate: atTime(addDays(now, -14), 10, 0),
                type: "Mobility + core",
                durationMin: 35,
                calories: 180,
                trainerNote: "Hip capsule work 2× weekly until next check-in.",
              },
            ],
          },
          notifications: {
            create: [
              {
                title: "Session tomorrow",
                body: "Lower-body strength at 18:00. Bring lifting shoes if you have them.",
                tone: "INFO",
                createdAt: addDays(now, 0),
              },
              {
                title: "New plan uploaded",
                body: "Your trainer added Week 4 conditioning blocks to your program.",
                tone: "SUCCESS",
                createdAt: addDays(now, -1),
              },
              {
                title: "Workout assigned",
                body: "Tempo squats + bike intervals. Estimated 52 min.",
                tone: "NEUTRAL",
                createdAt: addDays(now, -3),
              },
            ],
          },
        },
      },
    },
  });

  console.log("Seed completed:");
  console.log("  Trainer:", trainerUser.email, "(password: demo1234)");
  console.log("  Client:  marko.client@fitbook.ai (password: demo1234)");
  console.log(`  Availability: ${slotCount} future slots (all unbooked)`);
  console.log("  Bookings: 0 — use the booking wizard to create demo sessions");
  console.log("  Reset demo: npm run db:reset  (or ./scripts/reset-demo.sh)");
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

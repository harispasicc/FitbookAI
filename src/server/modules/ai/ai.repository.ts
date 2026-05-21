import { prisma } from "@/lib/prisma";
import { buildClientKnowledgeBase } from "@/server/modules/ai/client-knowledge";

export const aiRepository = {
  getClientContext: buildClientKnowledgeBase,

  async getTrainerContext(userId: string) {
    const profile = await prisma.trainerProfile.findUnique({
      where: { userId },
      select: { id: true, fullName: true, specialty: true },
    });

    if (!profile) {
      return null;
    }

    const bookings = await prisma.booking.findMany({
      where: { trainerProfileId: profile.id },
      orderBy: { startsAt: "desc" },
      take: 15,
      include: {
        service: { select: { title: true } },
        clientUser: {
          select: {
            email: true,
            clientProfile: { select: { fullName: true } },
          },
        },
      },
    });

    return {
      coachName: profile.fullName,
      specialty: profile.specialty,
      recentBookings: bookings.map((b) => ({
        status: b.status.toLowerCase(),
        startsAt: b.startsAt.toISOString(),
        service: b.service.title,
        client:
          b.clientUser.clientProfile?.fullName ??
          b.clientUser.email.split("@")[0],
      })),
    };
  },
};

import { prisma } from "@/lib/prisma";

export const reviewsRepository = {
  findByBookingId(bookingId: string) {
    return prisma.trainerReview.findUnique({
      where: { bookingId },
    });
  },

  create(data: {
    trainerProfileId: string;
    clientUserId: string;
    bookingId: string;
    authorName: string;
    rating: number;
    comment: string | null;
  }) {
    return prisma.trainerReview.create({ data });
  },
};

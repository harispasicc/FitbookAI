"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BusyDots } from "@/components/ui/busy-dots";
import { ModalShell } from "@/components/ui/modal-shell";
import { apiSubmitBookingReview } from "@/lib/bookings-api";
import { BOOKINGS_UPDATE_EVENT } from "@/lib/demo-data-events";
import { productUi } from "@/lib/product-ui";
import { cn } from "@/lib/utils";

type BookingReviewDialogProps = {
  bookingId: string;
  coachName: string;
  serviceTitle: string;
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function BookingReviewDialog({
  bookingId,
  coachName,
  serviceTitle,
  open,
  onClose,
  onSubmitted,
}: BookingReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await apiSubmitBookingReview(bookingId, {
      rating,
      comment: comment.trim() || undefined,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    window.dispatchEvent(new Event(BOOKINGS_UPDATE_EVENT));
    onSubmitted?.();
    onClose();
    setComment("");
    setRating(5);
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Rate your session"
      titleId="review-dialog-title"
      description={
        <>
          {coachName} · {serviceTitle}
        </>
      }
      maxHeight="min(90dvh,28rem)"
      footer={
        <>
          {error ? (
            <p className="w-full text-sm text-destructive sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className={productUi.touchTarget}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={productUi.touchTarget}
            onClick={() => void submit()}
            disabled={saving}
          >
            {saving ? <BusyDots size="sm" className="mr-2" /> : null}
            Submit review
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Rating</Label>
          <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "rounded-lg p-1 transition-transform duration-150 hover:scale-110",
                  productUi.touchTarget,
                )}
                onMouseEnter={() => setHover(value)}
                onClick={() => setRating(value)}
                aria-label={`${value} stars`}
              >
                <Star
                  className={cn(
                    "size-8",
                    (hover || rating) >= value
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-comment" className="text-sm font-medium">
            Comment (optional)
          </Label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="What went well? Would you recommend this coach?"
            className="flex w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </ModalShell>
  );
}

import {
  mapTrainerProfileFromApi,
  type ApiTrainerProfile,
} from "@/lib/map-trainer-from-api";
import type { MockTrainer } from "@/lib/mock-trainers";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function loadCoaches(): Promise<{
  coaches: MockTrainer[];
  loadError: string | null;
}> {
  try {
    const res = await fetch(`${getAppUrl()}/api/coaches`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to load coaches (${res.status})`);
    }

    const result = (await res.json()) as { data: ApiTrainerProfile[] };
    return {
      coaches: result.data.map(mapTrainerProfileFromApi),
      loadError: null,
    };
  } catch (error) {
    return {
      coaches: [],
      loadError:
        error instanceof Error ? error.message : "Failed to load coaches",
    };
  }
}

export async function loadCoachById(id: string): Promise<MockTrainer | null> {
  try {
    const res = await fetch(`${getAppUrl()}/api/coaches/${id}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to load coach (${res.status})`);
    }

    const result = (await res.json()) as { data: ApiTrainerProfile };
    return mapTrainerProfileFromApi(result.data);
  } catch {
    return null;
  }
}

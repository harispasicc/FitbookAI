import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { createTrainerServiceBodySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const services = await trainerPortalService.listServices();
    return jsonOk(services);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, createTrainerServiceBodySchema);
    const service = await trainerPortalService.createService(body);
    return jsonOk(service);
  });
}

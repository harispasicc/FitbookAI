import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { clientAssistantBodySchema } from "@/server/modules/ai/ai.schemas";
import { aiService } from "@/server/ai/ai.service";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, clientAssistantBodySchema);
    const result = await aiService.clientAssistant(body);
    return jsonOk(result);
  });
}

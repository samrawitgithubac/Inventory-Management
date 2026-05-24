import {
  itemBodySchema,
  itemIdParamSchema,
  itemPayloadSchema,
  type ItemPayload,
} from "@/lib/validators/item-schema";

export type { ItemPayload } from "@/lib/validators/item-schema";

type ValidationResult =
  | { success: true; data: ItemPayload }
  | { success: false; error: string; status: number };

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Validation failed";
}

export function parseItemId(id: string): number | null {
  const result = itemIdParamSchema.safeParse(id);
  return result.success ? result.data : null;
}

export function validateItemBody(body: unknown): ValidationResult {
  const parsed = itemBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      error: formatZodError(parsed.error),
      status: 400,
    };
  }

  const payload = itemPayloadSchema.safeParse(parsed.data);
  if (!payload.success) {
    return {
      success: false,
      error: formatZodError(payload.error),
      status: 400,
    };
  }

  return { success: true, data: payload.data };
}

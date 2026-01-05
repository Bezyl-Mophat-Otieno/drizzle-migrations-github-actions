import {z} from "zod"
export function jsonResponse(success: boolean, message: string, data?: any) {
  return {
    success,
    message,
    ...(data && { data }),
  }
}

export const jsonResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string(),
  data: z.any().optional(),
});
export type JsonResponse = z.infer<typeof jsonResponseSchema>;

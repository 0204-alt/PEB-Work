import { z } from "zod";

export const executeDesignSchema = z.object({
  projectId: z.string().uuid(),
});

export type ExecuteDesignRequest = z.infer<typeof executeDesignSchema>;

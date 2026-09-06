import { z } from "zod";

export const commentSchema = z.object({
  projectId: z.string().min(1, "ID de proyecto requerido"),
  parentId: z.string().optional(),
  body: z
    .string()
    .min(3, "El comentario debe tener al menos 3 caracteres")
    .max(2000, "El comentario no puede exceder los 2000 caracteres"),
});

export type CommentInput = z.infer<typeof commentSchema>;

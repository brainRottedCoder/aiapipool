import { z } from "zod";

export const MessageSchema = z
  .object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().max(102400),
  })
  .strict();

export const OpenAIChatRequestSchema = z
  .object({
    model: z.string().min(1),
    messages: z.array(MessageSchema).max(1000),
    stream: z.boolean().optional().default(false),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().min(1).max(32000).optional(),
    top_p: z.number().min(0).max(1).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
    stop: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .strict();

export const OpenAIChatResponseSchema = z
  .object({
    id: z.string(),
    object: z.literal("chat.completion"),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        index: z.number(),
        message: MessageSchema,
        finish_reason: z.string().nullable(),
      })
    ),
    usage: z.object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    }),
  })
  .strict();

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export const RegisterRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    email: z
      .string()
      .email("Invalid email address")
      .max(255)
      .transform((e) => e.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const VerifyEmailRequestSchema = z
  .object({
    email: z.string().email("Invalid email address").transform((e) => e.toLowerCase().trim()),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
  })
  .strict();

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export const OpenAIStreamChunkSchema = z
  .object({
    id: z.string(),
    object: z.literal("chat.completion.chunk"),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        index: z.number(),
        delta: z.object({
          role: z.enum(["system", "user", "assistant"]).optional(),
          content: z.string().optional(),
        }),
        finish_reason: z.string().nullable().optional(),
      })
    ),
  })
  .strict();

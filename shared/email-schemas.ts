import { z } from "zod";

export const smtpConfigSchema = z.object({
  provider: z.literal("smtp"),
  email: z.string().email(),
  displayName: z.string().optional(),
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUsername: z.string().min(1),
  smtpPassword: z.string().min(1),
  smtpSecurity: z.enum(["ssl", "tls", "none"]),
  imapHost: z.string().min(1),
  imapPort: z.number().int().min(1).max(65535),
  imapUsername: z.string().min(1),
  imapPassword: z.string().min(1),
  imapSecurity: z.enum(["ssl", "tls", "none"]),
});

export type SMTPConfig = z.infer<typeof smtpConfigSchema>;
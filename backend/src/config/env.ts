import { z } from "zod";

function trimEnv(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function trimDatabaseUrl(value: unknown) {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^["']|["']$/g, "");
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.preprocess(
    trimEnv,
    z
      .string()
      .min(1)
      .default("http://localhost:3000")
      .refine(
        (value) =>
          value.split(",").every((url) => {
            try {
              new URL(url.trim());
              return true;
            } catch {
              return false;
            }
          }),
        { message: "FRONTEND_URL must be one or more comma-separated URLs" },
      ),
  ),
  DATABASE_URL: z.preprocess(trimDatabaseUrl, z.string().min(1)),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
});

export const env = envSchema.parse(process.env);

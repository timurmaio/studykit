import { z } from "zod";

const payloadSchema = z.object({
  solutionId: z.number().int().positive(),
  code: z.string(),
  initialCode: z.string().optional(),
  solutionCode: z.string().optional(),
  checkFunction: z.string().optional(),
});

const raw = process.argv[2];

if (!raw) {
  console.error(JSON.stringify({ error: "Missing payload" }));
  process.exit(1);
}

const parsed = payloadSchema.safeParse(JSON.parse(raw));

if (!parsed.success) {
  console.error(JSON.stringify({ error: "Invalid payload" }));
  process.exit(1);
}

const succeed = parsed.data.code.trim().toLowerCase().startsWith("select");

console.log(
  JSON.stringify({
    solutionId: parsed.data.solutionId,
    succeed,
  })
);

import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@peb/database";
import { ROLES, type Role } from "@peb/shared";
import { loadEnv } from "../../config.js";
import { HttpError } from "../../httpError.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthToken = {
  sub: string;
  email: string;
};

export function signToken(payload: AuthToken): string {
  const env = loadEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new HttpError(401, "Authentication required"));
    return;
  }
  try {
    const env = loadEnv();
    const decoded = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthToken;
    (req as Request & { auth: AuthToken }).auth = decoded;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function getAuth(req: Request): AuthToken {
  const auth = (req as Request & { auth?: AuthToken }).auth;
  if (!auth) throw new HttpError(401, "Authentication required");
  return auth;
}

export async function requireProjectRole(
  userId: string,
  projectId: string,
  allowed: Role[],
): Promise<void> {
  const membership = await prisma.projectUser.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership || !allowed.includes(membership.role)) {
    throw new HttpError(403, "Insufficient project role");
  }
}

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new HttpError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash },
    });
    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");
    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

export { ROLES };

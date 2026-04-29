import { Request } from "express";
import type { UserModel } from "../../generated/prisma/models";

export interface AuthRequest extends Request {
  user?: UserModel;
}
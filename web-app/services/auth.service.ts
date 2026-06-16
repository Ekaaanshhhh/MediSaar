import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { IndividualProfile } from "../models/IndividualProfile";
import { DoctorProfile } from "../models/DoctorProfile";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { AuditLog } from "../models/AuditLog";
import { generateMediSaarId } from "../utils/generateMediSaarId";
import { generateToken, JwtPayload } from "../lib/jwt";
import { ApiError } from "../lib/apiError";
import { SignupPayload, LoginPayload } from "../validators/auth.validator";
import { UserRole, UserStatus } from "../types/user.types";

interface AuditContext {
  ip?: string;
  userAgent?: string;
}

export class AuthService {
  static async registerUser(payload: SignupPayload, auditCtx: AuditContext) {
    const existingUser = await User.findOne({ email: payload.email }).lean();
    if (existingUser) {
      throw new ApiError("Email is already registered", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create Base User
      const [user] = await User.create(
        [
          {
            name: payload.name,
            email: payload.email,
            passwordHash,
            role: payload.role,
            status: UserStatus.ACTIVE,
          },
        ],
        { session }
      );

      let profileId: mongoose.Types.ObjectId;

      // 2. Create Role Profile
      if (payload.role === UserRole.INDIVIDUAL) {
        const mediSaarId = await generateMediSaarId(); // Note: ID generation is not part of the transaction to avoid lock contention, but it's fine here
        const [profile] = await IndividualProfile.create(
          [
            {
              userId: user._id,
              mediSaarId,
            },
          ],
          { session }
        );
        profileId = profile._id as mongoose.Types.ObjectId;
      } else if (payload.role === UserRole.DOCTOR) {
        const [profile] = await DoctorProfile.create(
          [
            {
              userId: user._id,
              // Setup dummy required fields for now, or just bypass strict schema for creation
              // In production, these should be omitted here and required later, or we update the Schema to allow empty on creation.
              // Wait, the Mongoose schema for DoctorProfile has required fields! 
              // Let's provide placeholder values so it doesn't crash, since "Keep Signup Minimal" was requested.
              specialization: "Pending",
              licenseNumber: `PENDING-${user._id.toString().substring(18, 24)}`,
              qualification: "Pending",
              yearsOfExperience: 0,
            },
          ],
          { session }
        );
        profileId = profile._id as mongoose.Types.ObjectId;
      } else if (payload.role === UserRole.INSTITUTION) {
        const [profile] = await InstitutionProfile.create(
          [
            {
              userId: user._id,
              institutionName: payload.name,
              institutionType: "CLINIC", // default placeholder
              address: "Pending",
              contactEmail: payload.email,
              contactPhone: "Pending",
            },
          ],
          { session }
        );
        profileId = profile._id as mongoose.Types.ObjectId;
      } else {
        throw new ApiError("Invalid role", 400);
      }

      // 3. Link Profile to User
      user.profileId = profileId;
      await user.save({ session });

      // 4. Audit Log
      await AuditLog.create(
        [
          {
            userId: user._id,
            action: "USER_SIGNUP",
            entityType: "User",
            entityId: user._id,
            metadata: {
              role: user.role,
              ip: auditCtx.ip,
              userAgent: auditCtx.userAgent,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // 5. Generate JWT
      const token = generateToken({ userId: user._id.toString(), role: user.role });

      return { user, token };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async loginUser(payload: LoginPayload, auditCtx: AuditContext) {
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError("Invalid email or password", 401);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ApiError("Account is suspended. Please contact support.", 403);
    }

    // Generate JWT
    const token = generateToken({ userId: user._id.toString(), role: user.role });

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user._id,
      metadata: {
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
      },
    });

    return { user, token };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select("-passwordHash").lean();
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    let profile = null;
    if (user.role === UserRole.INDIVIDUAL) {
      profile = await IndividualProfile.findOne({ userId }).lean();
    } else if (user.role === UserRole.DOCTOR) {
      profile = await DoctorProfile.findOne({ userId }).lean();
    } else if (user.role === UserRole.INSTITUTION) {
      profile = await InstitutionProfile.findOne({ userId }).lean();
    }

    return { user, profile };
  }

  static async logLogout(userId: string, auditCtx: AuditContext) {
    await AuditLog.create({
      userId,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: userId, // Ensure entityId is provided and of type ObjectId/string
      metadata: {
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
      },
    });
  }

  static async changePassword(userId: string, payload: any, auditCtx: AuditContext) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ApiError("Incorrect current password", 401);
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(payload.newPassword, salt);

    user.passwordHash = newPasswordHash;
    user.mustChangePassword = false; // reset in case they were forced
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "USER_PASSWORD_CHANGE",
      entityType: "User",
      entityId: user._id,
      metadata: {
        ip: auditCtx.ip,
        userAgent: auditCtx.userAgent,
      },
    });

    return { success: true };
  }
}

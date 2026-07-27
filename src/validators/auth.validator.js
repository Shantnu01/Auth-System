const {z}=require("zod")

const userValidator=z.object({
  name:z.string().transform(val => val.trim()),
  email:z.string().toLowerCase().email({ message: "Give a legit email." }).transform(val => val.trim()),
  password:z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least one uppercase letter" })
  .regex(/^(?=.*[a-z])/, { message: "Password must contain at least one lowercase letter" })
  .regex(/^(?=.*\d)/, { message: "Password must contain at least one number" })
  .regex(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: "Password must contain at least one special character" })
})


const refreshTokenValidator = z.object({
  userID: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  refreshToken: z.string().min(1, "Refresh token is required"),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceName: z.string().optional(),
  lastUsedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date()
});
module.exports={userValidator,refreshTokenValidator};
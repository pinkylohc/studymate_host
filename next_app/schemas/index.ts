import * as z from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(1, {
        message: "Name cannot be blank",
    }),

    email: z.string()
    .min(1, {
        message: "Email cannot be blank",
    })
    .email({
        message: "Invalid email address",
    }),

    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
});

export const LoginSchema = z.object({
    email: z.string()
    .min(1, {
        message: "Email cannot be blank",
    })
    .email({
        message: "Invalid email address",
    }),
    
    password: z.string().min(1, {
        message: "Password is required",
    })
});

export const ResetSchema = z.object({
    email: z.string()
    .min(1, {
        message: "Email cannot be blank",
    })
    .email({
        message: "Invalid email address",
    }),
});

export const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
});
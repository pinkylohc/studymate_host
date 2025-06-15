"use server"

import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { getUserByEmail } from "@/db/user";
import { sendResetEmail } from "@/lib/verify_mail";
import { generatePasswordResetToken } from "@/lib/generate_token";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values);

    if(!validatedFields.success){ return { error: "Invalid email!"}; }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser.password) return { error: "Email registered with providers"}

    if(!existingUser) return { error: "Email not found!"}

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
    );

    return {success: "Reset email sent!"}
}
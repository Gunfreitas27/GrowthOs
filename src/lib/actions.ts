'use server'

import { signIn, auth } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        // Handling credentials login
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error // Re-throw to handle redirect
    }
}

const SignupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(
    prevState: string | undefined,
    formData: FormData,
) {
    const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors.email?.[0]
            || validatedFields.error.flatten().fieldErrors.password?.[0]
            || validatedFields.error.flatten().fieldErrors.name?.[0]
            || "Invalid input";
    }

    const { name, email, password } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return "User with this email already exists.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: "USER"
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        return "Failed to create account. Please try again.";
    }

    // After success, we can either redirect to login or sign in directly
    // For better DX, we sign in directly
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            return "Account created, but failed to log in automatically. Please log in manually.";
        }
        throw error;
    }
}

const CreateOrgSchema = z.object({
    orgName: z.string().min(2, {
        message: "Organization name must be at least 2 characters.",
    }),
});

export async function createOrganization(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const validatedFields = CreateOrgSchema.safeParse({
        orgName: formData.get("orgName"),
    });

    if (!validatedFields.success) {
        // In a real app, we'd return state to display errors.
        // For MVP, we'll just throw or return simple error string.
        // Form handling with useFormState is better for errors.
        throw new Error("Invalid input");
    }

    const { orgName } = validatedFields.data;

    try {
        // Transaction to create org and update user
        await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: orgName,
                }
            });

            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    organizationId: org.id,
                    role: "OWNER", // First user is Admin/Owner
                },
            });
        });

    } catch (error) {
        console.error("Failed to create organization:", error);
        throw new Error("Database Error: Failed to Create Organization.");
    }

    redirect("/dashboard");
}

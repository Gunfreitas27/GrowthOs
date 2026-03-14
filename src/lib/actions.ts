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
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'E-mail ou senha incorretos.'
                default:
                    return 'Ocorreu um erro. Tente novamente.'
            }
        }
        throw error
    }
}

const SignupSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
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
            return "Já existe uma conta com este e-mail.";
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
        return "Erro ao criar conta. Tente novamente.";
    }

    // After success, we can either redirect to login or sign in directly
    // For better DX, we sign in directly
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            return "Conta criada! Faça login para continuar.";
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

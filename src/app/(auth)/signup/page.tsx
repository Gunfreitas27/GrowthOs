'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { registerUser } from '@/lib/actions'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

export default function SignupPage() {
    const [errorMessage, dispatch] = useActionState(registerUser, undefined);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
                <CardDescription>
                    Crie sua conta para começar a usar o Velox
                </CardDescription>
            </CardHeader>
            <form action={dispatch}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="João Silva"
                            required
                            minLength={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nome@empresa.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                        />
                    </div>
                    {errorMessage && (
                        <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <SubmitButton />
                    <p className="text-sm text-center text-gray-500">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Entrar
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Criando conta..." : "Criar conta"}
        </Button>
    )
}

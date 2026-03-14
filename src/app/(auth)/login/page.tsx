'use client'

import { authenticate } from '@/lib/actions'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function LoginButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Entrando...' : 'Entrar'}
        </Button>
    )
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Entrar</CardTitle>
                <CardDescription>
                    Insira seu e-mail e senha para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="nome@empresa.com"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" name="password" required />
                    </div>
                    {errorMessage && (
                        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        </div>
                    )}
                    <LoginButton />
                </form>
            </CardContent>
            <CardFooter>
                <div className="mt-4 text-center text-sm w-full">
                    Não tem uma conta?{" "}
                    <Link href="/signup" className="underline">
                        Cadastre-se
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}

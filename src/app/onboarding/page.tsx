import { createOrganization } from "@/lib/actions"; // We'll add this action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function OnboardingPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Welcome to GrowthOS</CardTitle>
                    <CardDescription>Create your organization to get started.</CardDescription>
                </CardHeader>
                <form action={createOrganization}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input id="orgName" name="orgName" placeholder="Acme Inc." required />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Create Organization</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

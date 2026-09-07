"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/AUTH/auth-client";
export default function SignIn(){
    
    const [name,setName] = useState('');
        const [email,setEmail] = useState('');
        const [password,setPassword] = useState('');
    
        const router = useRouter();
        const [error,setError] = useState('');
        const [loading,setLoading] = useState(false);
    
        async function handleSubmit(e: React.FormEvent){
            e.preventDefault();
            setError("");
            setLoading(true);
    
            try{
                const result = await signIn.email({
                    email,
                    password,
                })
                if(result.error){
                    setError(result.error.message ?? "Failed to sign up.");
                }else{
                    router.push("/dashboard");
                }
            } catch(err){
                setError("An unexpected error occurred. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
            <Card className="w-full max-w-md border-gray-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-black">Sign In</CardTitle>
                    <CardDescription className="text-gray-600">Sign in to your account.</CardDescription>
                </CardHeader>
                <form className = "space-y-4" onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" required className="border-gray-300 focus:border-primary focus:ring-primary" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" required className="border-gray-300 focus:border-primary focus:ring-primary" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{" "} <Link href="/sign-up" className="font-medium text-primary hover:underline">Sign up</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

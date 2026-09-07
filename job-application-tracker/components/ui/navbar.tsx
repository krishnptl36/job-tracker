'use client';

import Link from "next/link";
import { BriefcaseIcon } from "lucide-react";
import Button from "./button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "@/lib/AUTH/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
   const { data: session } = useSession();
   const router = useRouter();
  return (
   
    <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center px-4 justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary/69">
                <BriefcaseIcon /> Job Tracker    
            </Link>
            <div className="flex items-center gap-4">
                {session?.user ? (
                    <>
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-gray-700 hover:text-pink-500"> 
                            Dashboard
                        </Button>
                    </Link>
                    <DropdownMenu>
                       <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-pink-500">
                            <Avatar>
                                <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User"} />
                                <AvatarFallback>{session?.user?.name?.[0] ?? "?"}</AvatarFallback>
                            </Avatar>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent>
                         <DropdownMenuGroup>
                           <DropdownMenuLabel>
                               {session?.user?.name ?? "User"}
                               {session?.user?.email && <div>{session?.user?.email}</div>}
                           </DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => signOut({}, { onSuccess: () => router.push("/") })}>
                               Sign Out
                           </DropdownMenuItem>
                         </DropdownMenuGroup>
                       </DropdownMenuContent>
                    </DropdownMenu>
                    </>
                ) : (
                    <>
                        <Link href="/sign-in">
                            <Button variant="ghost" className="text-gray-700 hover:text-pink-500"> 
                                Log In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="text-pink-500 hover:bg-pink/50">
                                Start for Free
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    </nav>
  );
}
import { Button } from "@/components/ui/button";
import LogOut from "@/module/components/logout";
import { requireAuth } from "@/module/utils/auth-utils";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  await requireAuth();

  return redirect('/dashboard');
}

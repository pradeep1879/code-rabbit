import { Button } from "@/components/ui/button";
import LogOut from "@/module/components/logout";
import { requireAuth } from "@/module/utils/auth-utils";
import Image from "next/image";

export default async function Home() {
  await requireAuth();
  return (
    <div className="underline">
      <LogOut>
      <Button>Logout</Button>
      </LogOut>
    </div>
  );
}

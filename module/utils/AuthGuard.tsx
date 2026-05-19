// import { headers } from "next/headers";
// import { redirect } from "next/navigation";

// import { auth } from "@/lib/auth";

// const AuthGuard = async ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     redirect("/login");
//   }

//   return <>{children}</>;
// };

// export default AuthGuard;
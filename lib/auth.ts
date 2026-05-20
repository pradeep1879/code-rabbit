import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polarClient } from "@/module/payment/config/polar";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth"
import { updatePolarCustomerId, updateUserTier } from "@/module/payment/lib/subscription";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
      provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders:({
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope:["repo"]
    },
  }),
  plugins: [
    polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
            checkout({
                products: [
                  {
                    productId: "62ef4929-f9d7-4bdb-91f3-aa51f74fa49c",
                    slug: "New CodeRabbit" // Custom slug for easy reference in Checkout URL, e.g. /checkout/CodeRabbit
                  }
                ],
                successUrl: process.env.POLAR_SUCCESS_URL,
                authenticatedUsersOnly: true
            }),
            portal({
              returnUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000/dashboard"
            }),
            usage(),
            webhooks({
              secret: process.env.POLAR_WEBHOOK_SECRET!,
              onSubscriptionActive: async (payload) => {
                const customerId = payload.data.customerId

                const user = await prisma.user.findFirst({
                  where:{
                    polarCustomerId: customerId
                  }
                });

                if(user){
                  await updateUserTier(user.id, "PRO", "ACTIVE", payload.data.id)
                }
              },
              onSubscriptionCanceled:async (payload) => {
                const customerId = payload.data.customerId

                const user = await prisma.user.findFirst({
                  where:{
                    polarCustomerId: customerId
                  }
                });

                if(user){
                  await updateUserTier(user.id, user.subscriptionTier as any , "CANCELED")
                }

              },
              onSubscriptionRevoked: async (payload) => {
                const customerId = payload.data.customerId

                const user = await prisma.user.findFirst({
                  where:{
                    polarCustomerId: customerId
                  }
                });

                if(user){
                  await updateUserTier(user.id, "FREE", "EXPIRED")
                }

              },
              onOrderPaid: async () => {},
              onCustomerCreated: async (payload) => {
                const user = await prisma.user.findUnique({
                  where:{
                    email: payload.data.email!
                  }
                });

                if(user){
                  await updatePolarCustomerId(user.id, payload.data.id)
                }
              }
            })
        ],
    })
  ]
})
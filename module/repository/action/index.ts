"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createWebhook, getRepositories } from "@/module/github/lib/github";
import { inngest } from "@/inngest/client";
import { canConnectRepository, incrementRepositoryCount } from "@/module/payment/lib/subscription";

export const fetchRepositories = async (
  page: number = 1,
  perPage: number = 10
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const githubRepos = await getRepositories(page, perPage);

  const dbRepo = await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const connectedRepoIds = new Set(
    dbRepo.map((repo) => repo.githubId.toString())
  );

  return githubRepos.map((repo: any) => ({
    ...repo,
    isConnected: connectedRepoIds.has(repo.id.toString()),
  }));
};


export const connectRepository = async(owner:string, repo:string, githubId:number) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // TODO: check if user can connect more repo
    const canConnect = await canConnectRepository(session.user.id);

      if(!canConnect){
        throw new Error("Repository limit reached. Please upgrade to Pro for unlimited repositories."); 
      }

  const webhook = await createWebhook(owner, repo);

  if(webhook){
      await prisma.repository.create({
        data:{
          githubId: BigInt(githubId),
          name:repo,
          owner,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`,
          userId: session.user.id
        }
      })
    

    //: increament repository count for usage tracking

      await incrementRepositoryCount(session.user.id)

    //Trigger repository indexing for RAG
    try {
      await inngest.send({
        name:"repository.connected",
        data:{
          owner, 
          repo,
          userId: session.user.id,
        }
      })
    } catch (error) {
      console.log(error)
    }
}
  return webhook
}
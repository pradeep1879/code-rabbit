"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createWebhook, getRepositories } from "@/module/github/lib/github";

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
  }

  //TODO: increament repository count for usage tracking
  //TODO: Trigger repository indexing for RAG

  return webhook
}
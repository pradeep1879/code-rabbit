import { Octokit } from "octokit";

import { headers } from "next/headers";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error(
      "No GitHub access token found"
    );
  }

  return account.accessToken;
};

interface ContributionCalendar {
  totalContributions: number;

  weeks: {
    contributionDays: {
      contributionCount: number;
      date: string;
      color: string;
    }[];
  }[];
}

interface ContributionResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
}

export const fetchUserContribution = async (
  token: string,
  username: string
): Promise<ContributionCalendar | null> => {
  const octokit = new Octokit({
    auth: token,
  });

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;
  try {
    const response =
      await octokit.graphql<ContributionResponse>(
        query,
        {
          username,
        }
      );

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error(
      "GitHub Contribution Fetch Error:",
      error
    );

    return null;
  }
};


export const getRepositories = async (page: number = 1, perPage:number= 10) => {
  const token = await getGithubToken();
  const octokit = new Octokit({auth:token});

  const {data} = await octokit.rest.repos.listForAuthenticatedUser({
    sort:"updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page
  })
  return data;
}


export const createWebhook = async (owner:string, repo:string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({
    auth: token
  });

  const webHookUrl = `${process.env.BETTER_AUTH_URL}/api/webhook/github`

  const {data:hooks} = await octokit.rest.repos.listWebhooks({
    owner,
    repo
  });

  const existingHook = hooks.find(hook => hook.config.url === webHookUrl);
  if(existingHook){
    return existingHook
  }

  const {data} = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webHookUrl,
      content_type: "json"
    },
    events: ["pull_request"]
  })
  return data;
}


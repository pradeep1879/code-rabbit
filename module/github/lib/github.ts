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
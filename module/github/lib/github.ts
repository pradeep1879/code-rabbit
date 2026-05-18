import { Octokit } from "octokit";
import { auth } from '@/lib/auth'
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { DateFnsMonth } from "react-day-picker";


export const getGithubToken = async() =>{
  const session = await auth.api.getSession({headers: await headers()})

  if(!session){
    throw new Error("Unauthorized")
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github"
    }
  });
  if(!account?.accessToken){
    throw new Error("No github access token found")
  }

  return account.accessToken
}

export const fetchUserContribution = async (token:string, username: string) => {
  const octokit = new Octokit({auth: token});

  const query = `
  query($username:String!){
    user(login:$username){
      contributionCollection{
        contributionCalendar{
          totalContributions
            weeks{
              contributionDays{
                contributionCount
                data
                color
              }
            }
        }
      }
    }
  }
  `

  // interface ContributionData{
  //   user: {
  //     contributionCollection: {
  //       contributionCalendar: {
  //         totalcontribution: number,
  //           weeks: {
  //             contributionCount: number,
  //             data: string | Date,
  //             color: string
  //           }
  //       }
  //     }
  //   }
  // }

  try {
    const response: any = await octokit.graphql(query, {
      username
    })

    return response.user.contributionCollection.contributionCalendar

  } catch (error) {
    
  }
}
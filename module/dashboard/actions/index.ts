"use server"

import { auth } from "@/lib/auth"
import { fetchUserContribution, getGithubToken } from "@/module/github/lib/github";
import { da } from "date-fns/locale";
import { headers } from "next/headers"
import { Octokit } from "octokit";

export const getDashboardStats = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session?.user){
      throw new Error("Unauthorized")
    }

    const token = await getGithubToken();
    const octokit = new Octokit({auth: token});

    // get users github username

    const {data: user} =  await octokit.rest.users.getAuthenticated();

    // Todo: fetch total connected repo from db;
    const totalRepo = 30;

    const calendar = await fetchUserContribution(token, user.login);
    const totalCommit = calendar?.totalcontribution || 0;


    // count pr from db or github
    const {data: prs} = await octokit.rest.search.issuesAndPullRequests({
      q: `author: ${user.login} type: pr` ,
      per_page: 1
    });

    const totalPrs = prs.total_count

    // count ai reviews from db;
    const totalReviews = 44;

    return {
      totalCommit,
      totalPrs, 
      totalReviews, 
      totalRepo
    }
  } catch (error) {
    console.log(error);
    return {
      totalCommit: 0,
      totalPrs: 0, 
      totalReviews: 0, 
      totalRepo: 0
    }
  }
}


export const getMonthlyActivity = async() => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session?.user){
      throw new Error("Unauthorized")
    }

    const token = await getGithubToken();
    const octokit = new Octokit({auth: token});

    const {data: user} =  await octokit.rest.users.getAuthenticated();

    const calendar = await fetchUserContribution(token, user.login)
    if(!calendar){
      return [];
    }

    const monthlyData: {
      [key:string]: {commits:number, prs:number, reviews: number}
    } = {}

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]


    const now = new Date();
    for(let i = 5; i>=0; i--){
      const data = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[data.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0}
    }

    calendar.weeks.forEach((week:any) => {
      week.contributionDays.forEach((day: any) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];

        if(monthlyData[monthKey]){
          monthlyData[monthKey].commits += day.contributionCount;
        }
      })
    })

    // fetch reviews from db for last 6 months
    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    // todo: reviews real data
    const generateSampleReviews = () => {
      const sampleReviews = [];
      const now = new Date();

      /// generate radom reviews for last  6 months
      for(let i = 0; i < 45; i++){
        const randoDaysAgo = Math.floor(Math.random() * 180); // random days in last 6 month
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randoDaysAgo);

        sampleReviews.push({
          createdAt: reviewDate
        });
      }
      return sampleReviews;
    }

    const reviews = generateSampleReviews();
    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if(monthlyData[monthKey]){
        monthlyData[monthKey].reviews += 1;
      }
    });

    const {data:prs} = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${user.login} type:pr created:> ${
        sixMonthAgo.toISOString().split("T")[0]
      }`,
      per_page: 100
    })


    prs.items.forEach((pr: any) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];
      if(monthlyData[monthKey]){
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name]
    }))
  } catch (error) {
    console.log(error)
  }
}
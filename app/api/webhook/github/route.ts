import { reviewPullRequest } from "@/module/ai/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Webhook working",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    console.log(body);

    if (event === "ping") {
      return NextResponse.json({
        message: "pong",
      });
    }

    if (event === "pull_request") {
        const action = body.action;

        const repo =
          body.repository.full_name;

        const prNumber = body.number;

        const [owner, repoName] =
          repo.split("/");

        if (
          action === "opened" ||
          action === "synchronize"
        ) {
          try {
            await reviewPullRequest(
              owner,
              repoName,
              prNumber
            );

            console.log(
              `Review queued for ${repo} #${prNumber}`
            );
          } catch (error) {
            console.error(
              `Review failed for ${repo} #${prNumber}`,
              error
            );
          }
        }
      }

    return NextResponse.json({
      message: "Event processed",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
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
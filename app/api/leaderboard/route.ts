import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/db-service"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const category = searchParams.get("category") || "total_resources"
    const period = searchParams.get("period") || "all_time"

    const leaderboard = await getLeaderboard(category, period)

    if (!leaderboard) {
      return NextResponse.json({
        category,
        period,
        rankings: [],
      })
    }

    return NextResponse.json(leaderboard)
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch leaderboard" }, { status: 500 })
  }
}

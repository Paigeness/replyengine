import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/supabase-admin"
export async function GET() {
  try {
    const admin = getAdmin()
    const { data, error } = await admin.auth.admin.createUser({
      email: "paigehmattke@yahoo.com",
      password: "Apple2026$$",
      email_confirm: true,
      user_metadata: { role: "owner" }
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: "Account created! Try logging in." })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

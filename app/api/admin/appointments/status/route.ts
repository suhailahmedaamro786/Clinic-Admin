import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedStatuses = new Set([
  "pending", "confirmed", "reschedule_requested", "cancelled", "completed", "no_show",
]);

export async function PATCH(request: Request) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!url || !serviceKey || !token) {
    return NextResponse.json({ error: "Not authenticated or server is not configured." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const appointmentId = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(appointmentId)) {
      return NextResponse.json({ error: "A valid appointment ID is required." }, { status: 400 });
    }
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Choose a valid appointment status." }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userResult, error: authError } = await admin.auth.getUser(token);
    const user = userResult.user;
    if (authError || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const { data: adminRecord, error: roleError } = await admin
      .from("admin_users").select("role").eq("auth_user_id", user.id).maybeSingle();
    if (roleError || !adminRecord) {
      return NextResponse.json({ error: "This account is not authorised as a clinic admin." }, { status: 403 });
    }

    const { data, error } = await admin.from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", appointmentId)
      .select("id,status,confirmation_code")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    return NextResponse.json({ ok: true, appointment: data });
  } catch (error) {
    console.error("Admin appointment update failed", error);
    return NextResponse.json({ error: "Could not update appointment status." }, { status: 500 });
  }
}

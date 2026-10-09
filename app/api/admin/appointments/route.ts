import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!url || !serviceKey || !token) return NextResponse.json({ error: "Not authenticated or server is not configured." }, { status: 401 });
  try {
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userResult, error: authError } = await admin.auth.getUser(token);
    const user = userResult.user;
    if (authError || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const { data: adminRecord, error: roleError } = await admin.from("admin_users").select("role").eq("auth_user_id", user.id).maybeSingle();
    if (roleError || !adminRecord) return NextResponse.json({ error: "This account is not authorised as a clinic admin." }, { status: 403 });
    const { data, error } = await admin.from("appointments").select("id,confirmation_code,patient_name,patient_phone,patient_email,service_name,starts_at,ends_at,status,created_at,doctors(full_name)").order("starts_at", { ascending: false }).limit(200);
    if (error) throw error;
    return NextResponse.json({ appointments: data ?? [], role: adminRecord.role });
  } catch (error) {
    console.error("Admin appointments API error", error);
    return NextResponse.json({ error: "Could not load appointments." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
    // 1. Get the current authenticated user via the server client (cookie-based session)
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "You'll need to sign in before we can do that." }, { status: 401 });
    }

    // 2. Delete profile data first (RLS allows users to delete their own rows)
    await supabase.from("profiles").delete().eq("id", user.id);

    // 3. Use admin client (service_role) to hard-delete the auth user
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json(
            { error: "Account deletion isn't available right now. Please reach out to support." },
            { status: 503 }
        );
    }

    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
        return NextResponse.json({ error: "Something went wrong while deleting your account. Please try again or contact support." }, { status: 500 });
    }

    // 4. Sign the user out of the current session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
}

import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const file = fs.existsSync(".env.local") ? ".env.local" : ".env";
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function profileFromClerkUser(user) {
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.email_addresses?.[0]?.email_address?.split("@")[0] ||
    "Customer";
  return {
    full_name: fullName,
    phone: user.phone_numbers?.[0]?.phone_number || null,
    email: user.email_addresses?.[0]?.email_address || null
  };
}

async function fetchAllClerkUsers(secretKey) {
  const users = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(`https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    if (!response.ok) {
      throw new Error(`Clerk API error ${response.status}: ${await response.text()}`);
    }
    const batch = await response.json();
    if (!Array.isArray(batch) || !batch.length) break;
    users.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return users;
}

async function main() {
  const env = loadEnv();
  const clerkSecret = env.CLERK_SECRET_KEY;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clerkSecret || !supabaseUrl || !serviceRole) {
    throw new Error("Missing CLERK_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  const clerkUsers = await fetchAllClerkUsers(clerkSecret);

  let inserted = 0;
  let updated = 0;
  let preserved = 0;
  let failed = 0;

  for (const user of clerkUsers) {
    const profile = profileFromClerkUser(user);
    const { data: existing } = await supabase.from("users").select("id, role").eq("id", user.id).maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          email: profile.email
        })
        .eq("id", user.id);

      if (error) {
        failed += 1;
        console.error(`Update failed for ${user.id}:`, error.message);
      } else {
        updated += 1;
        if (["super_admin", "admin", "staff"].includes(existing.role)) preserved += 1;
      }
      continue;
    }

    const createdAt = user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString();
    const { error } = await supabase.from("users").insert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      email: profile.email,
      role: "customer",
      is_active: true,
      created_at: createdAt
    });

    if (error) {
      failed += 1;
      console.error(`Insert failed for ${user.id}:`, error.message);
    } else {
      inserted += 1;
    }
  }

  console.log(JSON.stringify({
    clerkUsers: clerkUsers.length,
    inserted,
    updated,
    preservedPrivilegedRoles: preserved,
    failed
  }, null, 2));
}

main().catch((error) => {
  console.error("Backfill failed:", error.message);
  process.exit(1);
});

/**
 * Verification script for Supabase and Storage connections
 * Run this in the browser console or as a server action to verify configuration
 * 
 * Usage:
 * 1. Import this file where needed
 * 2. Call verifySupabaseConnections() to test
 * 3. Check console for detailed logs
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { business } from "@/lib/data";

export interface VerificationResult {
  service: string;
  status: "ok" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

export async function verifySupabaseConnections(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // Check environment variables
  console.log("🔍 Checking environment variables...");
  
  const envChecks = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    { key: "SUPABASE_SERVICE_ROLE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY },
    { key: "RESEND_API_KEY", value: process.env.RESEND_API_KEY },
    { key: "ADMIN_EMAIL", value: process.env.ADMIN_EMAIL },
  ];

  envChecks.forEach(({ key, value }) => {
    if (value) {
      results.push({
        service: `Env: ${key}`,
        status: "ok",
        message: `✅ ${key} is configured`
      });
    } else {
      results.push({
        service: `Env: ${key}`,
        status: "error",
        message: `❌ ${key} is not configured`
      });
    }
  });

  // Test Admin Client
  console.log("🔍 Testing Admin Supabase Client...");
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      // Try a simple query to verify connection
      const { data, error } = await adminClient.from("orders").select("count()", { count: "exact" }).limit(1);
      if (error) {
        results.push({
          service: "Supabase Admin Client",
          status: "error",
          message: `❌ Admin client connection failed: ${error.message}`,
          details: { error: error.code }
        });
      } else {
        results.push({
          service: "Supabase Admin Client",
          status: "ok",
          message: "✅ Admin client connected successfully"
        });
      }
    } else {
      results.push({
        service: "Supabase Admin Client",
        status: "error",
        message: "❌ Admin client could not be initialized - missing credentials"
      });
    }
  } catch (e) {
    results.push({
      service: "Supabase Admin Client",
      status: "error",
      message: `❌ Admin client test failed: ${e instanceof Error ? e.message : String(e)}`
    });
  }

  // Test Browser Client (if in browser context)
  if (typeof window !== "undefined") {
    console.log("🔍 Testing Browser Supabase Client...");
    try {
      const browserClient = createBrowserSupabaseClient();
      if (browserClient) {
        // Try to get current user
        const { data, error } = await browserClient.auth.getUser();
        if (error && error.status !== 400) {
          results.push({
            service: "Supabase Browser Client",
            status: "warning",
            message: `⚠️ Browser client connection warning: ${error.message}`
          });
        } else {
          results.push({
            service: "Supabase Browser Client",
            status: "ok",
            message: "✅ Browser client connected successfully"
          });
        }
      } else {
        results.push({
          service: "Supabase Browser Client",
          status: "error",
          message: "❌ Browser client could not be initialized - missing credentials"
        });
      }
    } catch (e) {
      results.push({
        service: "Supabase Browser Client",
        status: "error",
        message: `❌ Browser client test failed: ${e instanceof Error ? e.message : String(e)}`
      });
    }
  }

  // Test Supabase Tables
  console.log("🔍 Testing Supabase Tables...");
  const tablesToTest = ["products", "orders", "contact_inquiries", "newsletter_subscribers"];
  const adminClient = createAdminClient();

  if (adminClient) {
    for (const table of tablesToTest) {
      try {
        const { error } = await adminClient.from(table).select("count()", { count: "exact" }).limit(1);
        if (error) {
          results.push({
            service: `Table: ${table}`,
            status: "error",
            message: `❌ Table access failed: ${error.message}`,
            details: { errorCode: error.code }
          });
        } else {
          results.push({
            service: `Table: ${table}`,
            status: "ok",
            message: `✅ Table ${table} is accessible`
          });
        }
      } catch (e) {
        results.push({
          service: `Table: ${table}`,
          status: "error",
          message: `❌ Table test failed: ${e instanceof Error ? e.message : String(e)}`
        });
      }
    }
  }

  // Test Storage Buckets
  console.log("🔍 Testing Storage Buckets...");
  if (adminClient) {
    try {
      const { data, error } = await adminClient.storage.listBuckets();
      if (error) {
        results.push({
          service: "Storage Buckets",
          status: "error",
          message: `❌ Storage list failed: ${error.message}`
        });
      } else {
        results.push({
          service: "Storage Buckets",
          status: "ok",
          message: `✅ Storage accessible - ${data.length} bucket(s) found`,
          details: { buckets: data.map(b => b.name) }
        });
      }
    } catch (e) {
      results.push({
        service: "Storage Buckets",
        status: "error",
        message: `❌ Storage test failed: ${e instanceof Error ? e.message : String(e)}`
      });
    }
  }

  // Print summary
  console.log("\n📊 Verification Summary:");
  console.log("=".repeat(60));
  results.forEach(result => {
    const icon = result.status === "ok" ? "✅" : result.status === "warning" ? "⚠️" : "❌";
    console.log(`${icon} ${result.service}: ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });

  const errorCount = results.filter(r => r.status === "error").length;
  const warningCount = results.filter(r => r.status === "warning").length;
  console.log("=".repeat(60));
  console.log(`✅ OK: ${results.filter(r => r.status === "ok").length} | ⚠️ Warnings: ${warningCount} | ❌ Errors: ${errorCount}`);

  return results;
}

/**
 * Server action to run verification on the backend
 * Usage: call this from a client component button
 */
export async function runVerificationCheck() {
  console.log("🚀 Running backend verification...");
  try {
    const results = await verifySupabaseConnections();
    return {
      success: true,
      results,
      errors: results.filter(r => r.status === "error")
    };
  } catch (e) {
    console.error("Verification failed:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e)
    };
  }
}

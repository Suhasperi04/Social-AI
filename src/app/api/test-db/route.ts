import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // We will attempt to query the database to verify the connection is alive.
    // If you haven't run the schema.sql yet, this will return a specific "relation does not exist" error,
    // which actually PROVES the connection is working successfully!
    const { data, error } = await supabase.from("instagram_accounts").select("*").limit(1);

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ 
          status: "SUCCESS - CONNECTION VERIFIED!", 
          message: "Your Supabase credentials are perfect and connected! However, you have not created your tables yet.",
          nextStep: "Go to the Supabase SQL Editor and paste the contents of schema.sql to create your tables."
        });
      }
      
      return NextResponse.json({ 
        status: "ERROR", 
        message: "Connected to Supabase, but encountered an unexpected error.",
        error: error 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      status: "SUCCESS - FULLY OPERATIONAL!", 
      message: "Your Supabase is connected AND your tables exist!",
      data: data
    });

  } catch (error: any) {
    console.error("Test DB Error:", error);
    return NextResponse.json({ 
      status: "FAILED TO CONNECT", 
      message: "Check your API keys in .env.local. The connection was refused.",
      error: error.message || error.toString()
    }, { status: 500 });
  }
}

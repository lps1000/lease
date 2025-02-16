import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar"
import { Users, Bike, StickyNote, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="w-[calc(100%-16rem)] flex-shrink-0 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-full">
          {/* Header met verbeterde styling */}
          <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex h-16 items-center px-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notities
              </h1>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
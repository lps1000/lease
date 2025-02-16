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

  // Haal het aantal leaserijders op
  const { count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' });

  const totalRiders = count || 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="w-[calc(100%-16rem)] flex-shrink-0 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-full">
          {/* Header met verbeterde styling */}
          <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex h-16 items-center px-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Main content met verbeterde card styling */}
          <div className="space-y-8 p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Totaal Leaserijders
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRiders}</div>
                  <p className="text-xs text-muted-foreground">
                    Actieve leaserijders
                  </p>
                </CardContent>
              </Card>
             
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Onderhoud Deze Week
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    3 meer dan vorige week
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Openstaande Notities
                  </CardTitle>
                  <StickyNote className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    Laatste 30 dagen
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-primary">Recente Leaserijders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Jan Jansen - Muon Ease",
                      "Marie Peters - Muon Ease",
                      "Pieter de Vries - Muon Strive",
                      "Sophie van Dijk - Muon Ease",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                      >
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{item}</p>
                          <p className="text-xs text-muted-foreground">
                            Toegevoegd {index + 1} dagen geleden
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-primary">Aankomend Onderhoud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Accu vervangen - VanDijck Juno",
                      "Tanwielen vervangen - Muon Ease",
                      "Onderhoudsbeurt - Muon Strive",
                      "Voorvork vervangen - Muon Ease",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                      >
                        <Bike className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{item}</p>
                          <p className="text-xs text-muted-foreground">
                            Gepland over {index + 2} dagen
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
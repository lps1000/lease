import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TeamleaderAuthButton } from "@/components/teamleader/auth-button"
import { Sidebar } from "@/components/sidebar"

// Server Component
export default function SnelAPIPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Teamleader API Beheer</CardTitle>
            <CardDescription>
              Beheer hier de Teamleader API authenticatie en tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TeamleaderAuthButton />
            
            <div className="prose dark:prose-invert">
              <h3>Instructies</h3>
              <ul>
                <li>Gebruik &quot;Start Teamleader Autorisatie&quot; om een nieuwe authenticatie te starten</li>
                <li>Gebruik &quot;Ververs Token&quot; om een verlopen token te vernieuwen</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Chooseadnotificationpage = () => {
  const navigate = useNavigate()

  return (
    <div className="p-6 max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Notify All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Send a push notification to all users
          </p>
          <Button onClick={() => navigate("/advertisement/notification/all")}>Notify All</Button>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Notify All Users (Web Push)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Send a web push notification to all users
          </p>
          <Button onClick={() => navigate("/advertisement/notification/webpushall")}>Notify All</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export { Chooseadnotificationpage }

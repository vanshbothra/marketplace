import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, ShoppingBag, Utensils, GraduationCap } from "lucide-react";
import { UserNav } from "@/components/user-nav";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ashoka Marketplace
            </h1>
          </div>
          <UserNav user={session.user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome to the Ashoka Marketplace</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Buy, sell, and trade with fellow Ashokans
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/marketplace">Browse Listings</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">My Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ShoppingBag className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Products</CardTitle>
              <CardDescription>Second-hand goods, textbooks, and more</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Store className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Merchandise</CardTitle>
              <CardDescription>T-shirts, hoodies, and custom items</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Services</CardTitle>
              <CardDescription>Tutoring, design, and other services</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Utensils className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Food</CardTitle>
              <CardDescription>Homemade meals and snacks</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Here's how to make the most of the marketplace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">1</Badge>
              <div>
                <h3 className="font-semibold mb-1">Create a Business Account</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your business profile to start selling. You can create up to 5 businesses.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">2</Badge>
              <div>
                <h3 className="font-semibold mb-1">Wait for Approval</h3>
                <p className="text-sm text-muted-foreground">
                  Admin will review your business account. This usually takes 1-2 days.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">3</Badge>
              <div>
                <h3 className="font-semibold mb-1">Add Your Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Once approved, create listings for products, services, or food items.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">4</Badge>
              <div>
                <h3 className="font-semibold mb-1">Connect with Buyers</h3>
                <p className="text-sm text-muted-foreground">
                  Buyers will reach out to you directly. Most transactions are peer-to-peer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

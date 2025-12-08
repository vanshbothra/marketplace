import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, ShoppingBag, GraduationCap } from "lucide-react";
import { UserNav } from "@/components/user-nav";

export default async function Home() {
  const session = await auth();
  // Proxy middleware guarantees authentication, so session is never null

  return (
    <div className="min-h-screen bg-gradient-soft">

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light mb-6 text-foreground dark:text-foreground">Welcome to Ashoka Marketplace</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy, sell, and trade with fellow Ashokans
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="rounded-2xl bg-black hover:bg-gray-800 text-white px-8">
              <Link href="/marketplace">Browse Listings</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-2xl glass-light px-8">
              <Link href="/dashboard">My Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Link href="/marketplace?type=PRODUCT" className="group">
            <div className="glass-card rounded-3xl p-8 hover:shadow-soft-lg transition-all duration-300 border-0">
              <div className="p-4 rounded-2xl bg-blue-50 w-fit mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">Products</h3>
              <p className="text-muted-foreground">Second-hand goods, textbooks, and more</p>
            </div>
          </Link>
          <Link href="/marketplace?type=PRODUCT" className="group">
            <div className="glass-card rounded-3xl p-8 hover:shadow-soft-lg transition-all duration-300 border-0">
              <div className="p-4 rounded-2xl bg-purple-50 w-fit mb-4">
                <Store className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">Merchandise</h3>
              <p className="text-muted-foreground">T-shirts, hoodies, and custom items</p>
            </div>
          </Link>
          <Link href="/marketplace?type=SERVICE" className="group">
            <div className="glass-card rounded-3xl p-8 hover:shadow-soft-lg transition-all duration-300 border-0">
              <div className="p-4 rounded-2xl bg-green-50 w-fit mb-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">Services</h3>
              <p className="text-muted-foreground">Tutoring, design, and other services</p>
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
          <h3 className="text-3xl font-light mb-2 text-foreground dark:text-foreground">Getting Started</h3>
          <p className="text-muted-foreground mb-8">Here's how to make the most of the marketplace</p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1 glass">1</Badge>
              <div>
                <h3 className="font-semibold mb-1">Create a Vendor Account</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your vendor profile to start selling. You can create up to 5 vendors.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1 glass">2</Badge>
              <div>
                <h3 className="font-semibold mb-1">Wait for Approval</h3>
                <p className="text-sm text-muted-foreground">
                  Admin will review your vendor account. This usually takes 1-2 days.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1 glass">3</Badge>
              <div>
                <h3 className="font-semibold mb-1">Add Your Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Once approved, create listings for products or services.
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
          </div>
        </div>
      </main>
    </div>
  );
}

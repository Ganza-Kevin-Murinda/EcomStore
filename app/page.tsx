import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Users, CreditCard, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Your Complete
            <span className="text-indigo-600"> E-Commerce</span> Solution
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Buy and sell shoes, clothes, and electronics with ease. Secure payments, seamless experience across all
            devices.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="text-center">
                <ShoppingBag className="h-12 w-12 text-indigo-600 mx-auto" />
                <CardTitle>Multi-Category Store</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Shop shoes, clothes, and electronics all in one place
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CreditCard className="h-12 w-12 text-indigo-600 mx-auto" />
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Safe and secure payment processing with bank cards
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-indigo-600 mx-auto" />
                <CardTitle>Seller Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Easy-to-use seller dashboard to manage your inventory
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-indigo-600 mx-auto" />
                <CardTitle>Verified Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Email verification with OTP for secure account creation
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

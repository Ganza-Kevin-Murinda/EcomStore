"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useProducts } from "@/components/products/product-context"
import { useAuth } from "@/components/auth/auth-context"
import ProtectedRoute from "@/components/navigation/protected-route"
import { ShoppingCart, CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

interface BillingData {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const { cart, getCartTotal, getCartItemsCount, clearCart } = useProducts()
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1) // 1: Review, 2: Payment, 3: Processing, 4: Success
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const [billingData, setBillingData] = useState<BillingData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
    if (cart.length === 0) {
      router.push("/cart")
    }
  }, [user, cart, router])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const validatePayment = () => {
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, "").length < 13) {
      setError("Please enter a valid card number")
      return false
    }
    if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
      setError("Please enter a valid expiry date")
      return false
    }
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      setError("Please enter a valid CVV")
      return false
    }
    if (!paymentData.cardholderName.trim()) {
      setError("Please enter the cardholder name")
      return false
    }
    return true
  }

  const validateBilling = () => {
    const required = ["firstName", "lastName", "email", "address", "city", "state", "zipCode"]
    for (const field of required) {
      if (!billingData[field as keyof BillingData].trim()) {
        setError(`Please fill in all required fields`)
        return false
      }
    }
    return true
  }

  const handlePayment = async () => {
    setError("")

    if (!validateBilling() || !validatePayment()) {
      return
    }

    setIsProcessing(true)
    setStep(3)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate payment success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      // Clear cart and show success
      clearCart()
      setStep(4)
    } else {
      setError("Payment failed. Please try again or use a different card.")
      setStep(2)
    }

    setIsProcessing(false)
  }

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <ProtectedRoute requireRole="customer">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">EcomStore</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Secure Checkout</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link href="/cart" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-600">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Enter your billing details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={billingData.firstName}
                        onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={billingData.lastName}
                        onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingData.email}
                      onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={billingData.address}
                      onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={billingData.city}
                        onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={billingData.state}
                        onChange={(e) => setBillingData({ ...billingData, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={billingData.zipCode}
                        onChange={(e) => setBillingData({ ...billingData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={billingData.country}
                        onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>Enter your payment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      id="cardholderName"
                      value={paymentData.cardholderName}
                      onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, expiryDate: formatExpiryDate(e.target.value) })
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">Demo Payment Information:</p>
                    <p className="text-xs text-blue-600">Use any card number (e.g., 4111 1111 1111 1111)</p>
                    <p className="text-xs text-blue-600">Any future expiry date and 3-4 digit CVV</p>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>{getCartItemsCount()} items in your order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                  </Button>

                  <div className="text-center text-xs text-gray-500">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Your payment information is secure and encrypted
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      {step === 4 && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>Your order has been confirmed and will be processed shortly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-2xl font-bold">${(getCartTotal() * 1.08).toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push("/dashboard")}>
                  View Order Status
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/products")}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {step === 3 && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              </div>
              <CardTitle>Processing Payment</CardTitle>
              <CardDescription>Please wait while we process your payment securely...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  )
}

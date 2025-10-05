"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Loader2, IndianRupee, ArrowUpRight, ArrowDownRight, QrCode } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import QRCode from "qrcode";
import Image from "next/image";

interface WalletData {
  id: number;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  walletId: number;
  userId: string;
  type: string;
  amount: number;
  description: string | null;
  bookingId: number | null;
  status: string;
  createdAt: string;
}

export default function WalletCard() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);

  // Fetch wallet data
  const fetchWallet = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/wallet?user_id=${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        // Wallet doesn't exist, create one
        await createWallet();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch wallet");
      }

      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to load wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Create wallet
  const createWallet = async () => {
    if (!session?.user?.id) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: session.user.id,
          balance: 0,
          currency: "INR",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create wallet");
      }

      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create wallet");
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoadingTransactions(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/wallet/transactions?user_id=${session.user.id}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Generate QR code for payment
  const generateQRCode = async (paymentAmount: number) => {
    try {
      // Create UPI payment string
      const upiString = `upi://pay?pa=nammaparking@upi&pn=NammaParking&am=${paymentAmount}&cu=INR&tn=Add money to wallet`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      
      setQrCodeUrl(qrDataUrl);
      setShowQrCode(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  // Add money to wallet
  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Show QR code for payment
    await generateQRCode(amountNum);
  };

  // Confirm payment after scanning QR code
  const confirmPayment = async () => {
    if (!session?.user?.id) return;

    const amountNum = parseFloat(amount);
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/wallet/add-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: session.user.id,
          amount: amountNum,
          description: "Money added to wallet via QR",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add money");
      }

      const data = await response.json();
      setWallet(data.wallet);
      toast.success(`Successfully added ₹${amountNum} to wallet`);
      setAmount("");
      setShowQrCode(false);
      setIsAddMoneyOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error adding money:", error);
      toast.error("Failed to add money to wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load wallet on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchWallet();
      fetchTransactions();
    }
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "add_money":
      case "credit":
      case "refund":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "booking_payment":
      case "debit":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <IndianRupee className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "add_money":
      case "credit":
      case "refund":
        return "text-green-600";
      case "booking_payment":
      case "debit":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card className="manga-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">E-Wallet</CardTitle>
              <CardDescription>Quick one-click booking</CardDescription>
            </div>
          </div>
          <Dialog open={isAddMoneyOpen} onOpenChange={(open) => {
            setIsAddMoneyOpen(open);
            if (!open) {
              setShowQrCode(false);
              setAmount("");
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Money
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-primary">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Add Money to Wallet
                </DialogTitle>
                <DialogDescription>
                  {showQrCode 
                    ? "Scan QR code to complete payment" 
                    : "Enter amount and generate QR code for payment"}
                </DialogDescription>
              </DialogHeader>
              
              {!showQrCode ? (
                <form onSubmit={handleAddMoney} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    {[100, 500, 1000, 2000].map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(preset.toString())}
                        className="flex-1 border-2"
                      >
                        ₹{preset}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsAddMoneyOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary">
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-6 rounded-lg flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <Image
                        src={qrCodeUrl}
                        alt="Payment QR Code"
                        width={300}
                        height={300}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-primary">₹{amount}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Scan with any UPI app to pay
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-accent/20 p-3 rounded-lg border-2 border-accent">
                    <p className="text-sm font-medium text-center">
                      💡 After payment, click "Payment Complete" below
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowQrCode(false);
                        setAmount("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={confirmPayment} 
                      className="flex-1 bg-primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Payment Complete"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Balance */}
        <div className="bg-primary text-primary-foreground p-6 rounded-lg">
          <div className="text-sm opacity-80 mb-2">Available Balance</div>
          <div className="text-4xl font-black">₹{wallet?.balance.toFixed(2) || "0.00"}</div>
        </div>

        {/* Transactions */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="credit">Credit</TabsTrigger>
            <TabsTrigger value="debit">Debit</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-3 mt-4">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border-2 border-black dark:border-white rounded">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.description || transaction.type.replace("_", " ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === "add_money" || transaction.type === "credit" || transaction.type === "refund" ? "+" : "-"}
                      ₹{transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="credit" className="space-y-3 mt-4">
            {transactions.filter(t => ["add_money", "credit", "refund"].includes(t.type)).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No credit transactions yet
              </div>
            ) : (
              transactions.filter(t => ["add_money", "credit", "refund"].includes(t.type)).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border-2 border-black dark:border-white rounded">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.description || transaction.type.replace("_", " ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      +₹{transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="debit" className="space-y-3 mt-4">
            {transactions.filter(t => ["booking_payment", "debit"].includes(t.type)).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No debit transactions yet
              </div>
            ) : (
              transactions.filter(t => ["booking_payment", "debit"].includes(t.type)).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border-2 border-black dark:border-white rounded">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.description || transaction.type.replace("_", " ")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      -₹{transaction.amount.toFixed(2)}
                    </div>
                    <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
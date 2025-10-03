"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UPIPaymentProps {
  upiId: string;
  amount: number;
  payeeName?: string;
  transactionNote?: string;
  onPaymentComplete?: () => void;
}

export const UPIPayment = ({
  upiId,
  amount,
  payeeName = "Parking Payment",
  transactionNote = "Parking Booking",
  onPaymentComplete,
}: UPIPaymentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate UPI payment link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        upiLink,
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error);
            toast.error("Failed to generate QR code");
          } else {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [upiLink]);

  const handleCopyUPIId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentComplete = () => {
    setIsProcessing(true);
    // Simulate payment verification
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment initiated successfully");
      onPaymentComplete?.();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="h-5 w-5" />
            Scan QR Code to Pay
          </CardTitle>
          <CardDescription>
            Use any UPI app to scan and complete payment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!qrGenerated && (
            <div className="flex items-center justify-center w-[280px] h-[280px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`border-4 border-muted rounded-lg ${!qrGenerated ? "hidden" : ""}`}
          />
          
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">₹{amount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Amount to be paid</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">UPI ID Details</CardTitle>
          <CardDescription>
            Or pay manually using this UPI ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="upiId"
                value={upiId}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUPIId}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label>Payee Name</Label>
            <Input value={payeeName} readOnly className="mt-2" />
          </div>

          <div>
            <Label>Amount</Label>
            <Input value={`₹${amount.toFixed(2)}`} readOnly className="mt-2 font-bold" />
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2 text-sm">Payment Instructions:</h4>
        <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
          <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>Scan the QR code or enter the UPI ID manually</li>
          <li>Verify the amount of ₹{amount.toFixed(2)}</li>
          <li>Complete the payment</li>
          <li>Click "I've Completed Payment" below after payment</li>
        </ol>
      </div>

      <Button 
        className="w-full" 
        size="lg"
        onClick={handlePaymentComplete}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying Payment...
          </>
        ) : (
          "I've Completed Payment"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Note: Your booking will be confirmed once the payment is verified
      </p>
    </div>
  );
};
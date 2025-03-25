import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useVerifyPhoneMutation, useResendOTPMutation } from "@/features/api/authApi";

const AccountVerification = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30); // 30 second cooldown for resend
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const verificationMethod = location.state?.method || "both"; // "email", "phone", or "both"

  const [verifyPhone, { isLoading, isSuccess: verifySuccess, error: verifyError }] = useVerifyPhoneMutation();
  const [resendOTP, { isLoading: isResending, isSuccess: resendSuccess, error: resendError }] = useResendOTPMutation();

  // Initialize resend timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (verifySuccess) {
      toast.success("Account verified successfully");
      navigate("/login");
    }
    if (verifyError) {
      toast.error(verifyError?.data?.message || "Verification failed");
    }
  }, [verifySuccess, verifyError, navigate]);

  useEffect(() => {
    if (resendSuccess) {
      toast.success(`Verification code sent to your ${getVerificationMethodText()}`);
      // Reset timer after successful resend
      setTimer(30);
      setCanResend(false);
    }
    if (resendError) {
      toast.error(resendError?.data?.message || "Failed to resend verification code");
    }
  }, [resendSuccess, resendError]);

  // Get text for verification method
  const getVerificationMethodText = () => {
    switch(verificationMethod) {
      case "email": return "email";
      case "phone": return "phone";
      default: return "email and phone";
    }
  };

  const handleVerification = async () => {
    if (otp.length !== 6) return;
    await verifyPhone({ userId, otp });
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    await resendOTP({ userId });
  };

  if (!userId) return null;

  return (
    <div className="flex items-center justify-center mt-20">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Account Verification</CardTitle>
          <CardDescription>
            Please enter the verification code sent to your {getVerificationMethodText()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          
          {/* Email verification notice */}
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <div className="flex gap-2">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-blue-800">Check Your Email</h4>
                <p className="text-xs mt-1 text-blue-700">
                  We&apos;ve sent a 6-digit verification code to your email address. If you don&apos;t see it, check your spam folder.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleVerification}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={isResending || !canResend}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resending
                </>
              ) : !canResend ? (
                `Resend Code (${timer}s)`
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountVerification; 
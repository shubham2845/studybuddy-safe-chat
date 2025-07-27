import React, { useState, useEffect } from 'react';
import { Lock, Shield, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface OTPLockScreenProps {
  onUnlock: () => void;
  parentEmail: string;
}

export const OTPLockScreen: React.FC<OTPLockScreenProps> = ({ onUnlock, parentEmail }) => {
  const [otpInput, setOtpInput] = useState('');
  const [correctOtp, setCorrectOtp] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const { toast } = useToast();

  useEffect(() => {
    // Generate a random 6-digit OTP (in real app, this would be sent via email)
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCorrectOtp(newOtp);
    
    // In development, show the OTP in console (remove in production)
    console.log(`Generated OTP: ${newOtp} (This would be sent to ${parentEmail})`);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [parentEmail]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpSubmit = () => {
    if (otpInput === correctOtp) {
      toast({
        title: "Access Granted",
        description: "OTP verified successfully. App unlocked.",
        variant: "default"
      });
      onUnlock();
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please check the code sent to your parent's email.",
        variant: "destructive"
      });
      setOtpInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOtpSubmit();
    }
  };

  const requestNewOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCorrectOtp(newOtp);
    setTimeRemaining(300);
    console.log(`New OTP: ${newOtp} (This would be sent to ${parentEmail})`);
    
    toast({
      title: "New OTP Sent",
      description: "A new verification code has been sent to your parent.",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-locked-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-locked-border border-2">
        <div className="text-center space-y-6">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="bg-destructive/10 p-4 rounded-full">
              <Lock className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">App Locked</h1>
            <p className="text-muted-foreground">
              Inappropriate content was detected. A verification code has been sent to your parent.
            </p>
          </div>

          {/* Parent Email Display */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Code sent to:</span>
              <span className="font-medium">{parentEmail}</span>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-warning">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                Enter 6-digit verification code:
              </label>
              <Input
                id="otp"
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
              />
            </div>

            <Button 
              onClick={handleOtpSubmit} 
              className="w-full"
              disabled={otpInput.length !== 6}
            >
              Unlock App
            </Button>
          </div>

          {/* Request New OTP */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={requestNewOtp}
              className="w-full"
              disabled={timeRemaining > 240} // Allow new OTP after 1 minute
            >
              Send New Code
            </Button>
            <p className="text-xs text-muted-foreground">
              You can request a new code after 1 minute
            </p>
          </div>

          {/* Safety Message */}
          <div className="bg-accent/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-accent-foreground mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-accent-foreground">Safety Reminder</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This app is designed to keep you safe while learning. Always use appropriate language and stay focused on your studies.
                </p>
              </div>
            </div>
          </div>

          {/* Development Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Development Mode:</strong> Check console for OTP code
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
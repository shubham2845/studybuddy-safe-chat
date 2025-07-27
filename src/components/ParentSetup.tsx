import React, { useState } from 'react';
import { BookOpen, Shield, Mail, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ParentSetupProps {
  onSetup: (email: string) => void;
}

export const ParentSetup: React.FC<ParentSetupProps> = ({ onSetup }) => {
  const [parentEmail, setParentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setParentEmail(email);
    setIsValid(validateEmail(email) && studentName.trim().length > 0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStudentName(name);
    setIsValid(validateEmail(parentEmail) && name.trim().length > 0);
  };

  const handleSetup = () => {
    if (!isValid) {
      toast({
        title: "Invalid Information",
        description: "Please enter a valid email and student name.",
        variant: "destructive"
      });
      return;
    }

    // Store student name in localStorage for future use
    localStorage.setItem('studentName', studentName);
    localStorage.setItem('parentEmail', parentEmail);

    toast({
      title: "Setup Complete",
      description: `Study Buddy is now configured for ${studentName}!`,
      variant: "default"
    });

    onSetup(parentEmail);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study Buddy</h1>
            <p className="text-muted-foreground">Safe Learning Assistant for Students</p>
          </div>

          {/* Safety Features */}
          <div className="bg-accent/10 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-accent-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Features
            </h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Content filtering for inappropriate language</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Automatic app lock with parental notification</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Study-focused conversation topics only</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-success" />
                <span>Age-appropriate educational content</span>
              </div>
            </div>
          </div>

          {/* Setup Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-foreground mb-2">
                Student Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={handleNameChange}
                  placeholder="Enter student's name"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-foreground mb-2">
                Parent/Guardian Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={handleEmailChange}
                  placeholder="parent@example.com"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This email will receive notifications if inappropriate content is detected
              </p>
            </div>
          </div>

          {/* Setup Button */}
          <Button 
            onClick={handleSetup} 
            className="w-full"
            disabled={!isValid}
          >
            Start Learning Safely
          </Button>

          {/* Age Restriction Notice */}
          <div className="bg-warning/10 p-3 rounded-lg">
            <p className="text-xs text-warning-foreground">
              <strong>Age Restriction:</strong> This app is designed for students under 20 years old for educational purposes only.
            </p>
          </div>

          {/* Terms Notice */}
          <p className="text-xs text-muted-foreground">
            By continuing, you agree that this app will monitor conversations for safety and educational purposes. 
            Inappropriate content will result in temporary app lock and parental notification.
          </p>
        </div>
      </Card>
    </div>
  );
};
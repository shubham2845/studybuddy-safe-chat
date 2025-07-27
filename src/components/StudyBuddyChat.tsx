import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ContentFilter } from './ContentFilter';
import { OTPLockScreen } from './OTPLockScreen';
import { ParentSetup } from './ParentSetup';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface StudyBuddyChatProps {
  studentName?: string;
}

export const StudyBuddyChat: React.FC<StudyBuddyChatProps> = ({ studentName = "Student" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${studentName}! I'm your study buddy! 📚 Ask me about math, science, history, literature, or any other subject you're learning. How can I help you study today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [showParentSetup, setShowParentSetup] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleParentSetup = (email: string) => {
    setParentEmail(email);
    setShowParentSetup(false);
    toast({
      title: "Setup Complete",
      description: "Parent email configured. Study buddy is ready!",
      variant: "default"
    });
  };

  const handleInappropriateContent = (message: string) => {
    setIsLocked(true);
    // In a real app, this would send an email via backend
    toast({
      title: "App Locked",
      description: "Inappropriate content detected. OTP sent to parent.",
      variant: "destructive"
    });
    console.log(`OTP should be sent to: ${parentEmail} for message: "${message}"`);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    toast({
      title: "App Unlocked",
      description: "Welcome back! Remember to keep conversations study-focused.",
      variant: "default"
    });
  };

  const generateStudyResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Math responses
    if (message.includes('math') || message.includes('algebra') || message.includes('geometry')) {
      return "Great! Math is such an important subject! 🧮 What specific math topic are you working on? I can help with algebra, geometry, fractions, or any other math concepts!";
    }
    
    // Science responses
    if (message.includes('science') || message.includes('biology') || message.includes('chemistry') || message.includes('physics')) {
      return "Science is fascinating! 🔬 Are you studying biology, chemistry, physics, or earth science? I'd love to help you understand any scientific concepts!";
    }
    
    // History responses
    if (message.includes('history') || message.includes('historical')) {
      return "History helps us understand our world! 📜 What time period or historical events are you studying? I can help with world history, American history, or any specific historical topics!";
    }
    
    // Literature responses
    if (message.includes('literature') || message.includes('reading') || message.includes('book')) {
      return "Reading and literature are wonderful! 📖 Are you working on a specific book, poem, or writing assignment? I can help with comprehension, analysis, or writing techniques!";
    }
    
    // Study tips
    if (message.includes('study') || message.includes('learn') || message.includes('homework')) {
      return "Here are some great study tips! 📝 1) Take breaks every 30 minutes, 2) Make flashcards for key concepts, 3) Teach someone else what you learned, 4) Practice problems regularly. What subject do you need help studying?";
    }
    
    // Encouragement for effort
    if (message.includes('difficult') || message.includes('hard') || message.includes('confused')) {
      return "Don't worry! Learning can be challenging, and that's totally normal! 💪 Every expert was once a beginner. Let's break down what you're finding difficult into smaller, easier steps. What specific part is confusing you?";
    }
    
    // Default educational response
    return `That's an interesting question! Let me help you learn about that. 🌟 Could you tell me more about what specific aspect you'd like to understand better? I'm here to make learning fun and easy!`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Check for inappropriate content
    if (ContentFilter.isInappropriate(inputValue)) {
      handleInappropriateContent(inputValue);
      setInputValue('');
      return;
    }

    // Generate bot response
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: generateStudyResponse(inputValue),
      isUser: false,
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (showParentSetup) {
    return <ParentSetup onSetup={handleParentSetup} />;
  }

  if (isLocked) {
    return <OTPLockScreen onUnlock={handleUnlock} parentEmail={parentEmail} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Study Buddy</h1>
              <p className="text-sm text-muted-foreground">Safe Learning Assistant for {studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-success">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Protected</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-chat-bg p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-xs md:max-w-md p-3 ${
                  message.isUser
                    ? 'bg-chat-user text-white'
                    : 'bg-chat-bot text-foreground border'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your studies..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="px-6">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2 max-w-4xl mx-auto">
          Remember: Keep conversations focused on learning and studying. Inappropriate content will lock the app.
        </p>
      </div>
    </div>
  );
};
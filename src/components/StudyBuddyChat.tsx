import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Shield, Lock, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ContentFilter } from './ContentFilter';
import { OTPLockScreen } from './OTPLockScreen';
import { ParentSetup } from './ParentSetup';
import { ApiKeySetup } from './ApiKeySetup';

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
  const [apiKey, setApiKey] = useState(localStorage.getItem('deepseek_api_key') || '');
  const [showApiSetup, setShowApiSetup] = useState(!localStorage.getItem('deepseek_api_key'));
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateStudyResponse = async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      return "Please set up your Deepseek API key to get personalized study responses! 🔑";
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Study Buddy',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            {
              role: 'system',
              content: `You are a helpful, encouraging study buddy for students. Your responses should be:
              - Educational and supportive
              - Age-appropriate and safe
              - Encouraging and positive
              - Focused on helping with studies
              - Include relevant emojis to make learning fun
              - Keep responses concise but informative
              - Always encourage learning and curiosity
              
              If asked about non-educational topics, gently redirect to studies.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Deepseek');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again! 🤔";
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm having trouble connecting right now. Please check your API key and try again! 🔧";
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
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
    const responseText = await generateStudyResponse(inputValue);
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
    setInputValue('');
  };

  const handleApiKeySetup = (key: string) => {
    setApiKey(key);
    localStorage.setItem('deepseek_api_key', key);
    setShowApiSetup(false);
    toast({
      title: "API Key Saved",
      description: "Deepseek API key configured. Study buddy is ready!",
      variant: "default"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (showParentSetup) {
    return <ParentSetup onSetup={handleParentSetup} />;
  }

  if (showApiSetup) {
    return <ApiKeySetup onSetup={handleApiKeySetup} />;
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
          <Button onClick={handleSendMessage} className="px-6" disabled={isGenerating}>
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2 max-w-4xl mx-auto">
          Remember: Keep conversations focused on learning and studying. Inappropriate content will lock the app.
        </p>
      </div>
    </div>
  );
};
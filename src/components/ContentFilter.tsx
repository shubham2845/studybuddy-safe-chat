export class ContentFilter {
  private static inappropriateWords = [
    // Basic inappropriate content
    'violence', 'violent', 'kill', 'death', 'drug', 'drugs', 'alcohol', 'beer', 'wine',
    'gambling', 'casino', 'bet', 'suicide', 'harm', 'hurt', 'weapon', 'gun', 'knife',
    'hate', 'racist', 'discrimination', 'bully', 'bullying', 'sexual', 'inappropriate',
    'naked', 'nude', 'porn', 'adult', 'mature', 'dating', 'romance', 'boyfriend', 'girlfriend',
    // Social media and non-study content
    'instagram', 'tiktok', 'snapchat', 'facebook', 'youtube', 'gaming', 'game', 'party',
    'skip school', 'skip class', 'cheat', 'cheating', 'copy homework', 'answers key',
    // Profanity (mild examples - in real app would be more comprehensive)
    'stupid', 'dumb', 'idiot', 'shut up', 'hate you',
    // Money/commercial content
    'buy', 'sell', 'money', 'credit card', 'purchase', 'shopping', 'expensive',
  ];

  private static studyKeywords = [
    'homework', 'study', 'learn', 'school', 'class', 'teacher', 'student', 'education',
    'math', 'science', 'history', 'english', 'literature', 'reading', 'writing',
    'algebra', 'geometry', 'biology', 'chemistry', 'physics', 'geography',
    'assignment', 'project', 'test', 'exam', 'quiz', 'practice', 'exercise',
    'help', 'explain', 'understand', 'question', 'answer', 'solve', 'calculate',
    'research', 'book', 'chapter', 'lesson', 'topic', 'subject', 'course'
  ];

  static isInappropriate(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Check for inappropriate words
    const hasInappropriateContent = this.inappropriateWords.some(word => 
      lowerMessage.includes(word)
    );

    // Check if message is too far from study topics
    const hasStudyContent = this.studyKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );

    // If message contains inappropriate content, it's flagged
    if (hasInappropriateContent) {
      return true;
    }

    // If message is longer than 10 words and has no study-related content, flag it
    const wordCount = lowerMessage.split(' ').length;
    if (wordCount > 10 && !hasStudyContent) {
      // Additional check for questions or educational intent
      const hasEducationalIntent = 
        lowerMessage.includes('?') || 
        lowerMessage.includes('how') || 
        lowerMessage.includes('what') ||
        lowerMessage.includes('why') ||
        lowerMessage.includes('when') ||
        lowerMessage.includes('where') ||
        lowerMessage.includes('explain') ||
        lowerMessage.includes('help');
      
      return !hasEducationalIntent;
    }

    return false;
  }

  static getFilterReason(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    const foundInappropriate = this.inappropriateWords.find(word => 
      lowerMessage.includes(word)
    );

    if (foundInappropriate) {
      return `Inappropriate content detected: "${foundInappropriate}"`;
    }

    const hasStudyContent = this.studyKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );

    if (!hasStudyContent) {
      return "Message not related to studying or education";
    }

    return "Content appears appropriate";
  }
}
import { StudyBuddyChat } from '@/components/StudyBuddyChat';

const Index = () => {
  // Get student name from localStorage if available
  const studentName = localStorage.getItem('studentName') || undefined;

  return <StudyBuddyChat studentName={studentName} />;
};

export default Index;

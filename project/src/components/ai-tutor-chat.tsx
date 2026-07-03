'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Clock, Calendar, BookOpen, Globe, ExternalLink, Search, FileText, Video, Play } from 'lucide-react';
import { supabase, type ComprehensiveSubject, type UserExam, type OnlineResource } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  resources?: OnlineResource[];
}

interface AITutorChatProps {
  selectedCategory?: string | null;
  selectedSubject?: ComprehensiveSubject | null;
  upcomingExam?: UserExam | null;
}

export function AITutorChat({ selectedCategory, selectedSubject, upcomingExam }: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [subjects, setSubjects] = useState<ComprehensiveSubject[]>([]);
  const [userExams, setUserExams] = useState<UserExam[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setInitialGreeting = useCallback(() => {
    let greeting = 'Hello! I\'m your AI tutor. I can help you with:';

    if (upcomingExam) {
      const daysUntil = Math.ceil((new Date(upcomingExam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const reviewDay = daysUntil <= upcomingExam.days_before_exam_for_review;

      greeting = `Hello! I see you have **${upcomingExam.exam_name}** in ${daysUntil} days.${reviewDay ? '\n\n🚨 **REVIEW PERIOD ACTIVE** - I\'ll help you prepare with focused revision!' : ''}

I can help you:
• Create a study plan based on your exam date
• Find online resources for your subjects
• Practice with quizzes and flashcards
• Review key concepts the day before your exam`;
    } else if (selectedSubject) {
      greeting = `Welcome! You're studying **${selectedSubject.name}**.${selectedSubject.topics?.length ? `\n\nTopics covered: ${selectedSubject.topics.slice(0, 5).join(', ')}${selectedSubject.topics.length > 5 ? '...' : ''}` : ''}

I can help you:
• Explain concepts from your study materials
• Find online resources when you don't have materials
• Create practice exercises
• Track your mastery progress`;
    } else {
      greeting = `Hello! I'm your AI tutor. I can help you with:

• **Study Materials**: Use your own PDFs, images, notes, or I can fetch resources from the internet
• **Exam Preparation**: Set your exam date and I'll create a study plan, preparing you one day before
• **25+ Subjects**: Math, Physics, Chemistry, Biology, History, Economics, CS, Languages (German, Spanish, French), Psychology, Philosophy, and more

How can I help you today?`;
    }

    setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
  }, [selectedSubject, upcomingExam]);

  useEffect(() => {
    fetchData();
    setInitialGreeting();
  }, [setInitialGreeting]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async () => {
    const [subjectsRes, examsRes] = await Promise.all([
      supabase.from('comprehensive_subjects').select('*'),
      supabase.from('user_exams').select('*').eq('preparation_status', 'in_progress'),
    ]);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (examsRes.data) setUserExams(examsRes.data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Generate AI response based on context
    setTimeout(() => {
      let response = '';
      let resources: OnlineResource[] = [];

      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('exam') && (lowerInput.includes('when') || lowerInput.includes('date'))) {
        if (userExams.length > 0) {
          const exam = userExams[0];
          const daysUntil = Math.ceil((new Date(exam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          response = `Your **${exam.exam_name}** is scheduled for **${new Date(exam.exam_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}**.

📅 **${daysUntil} days remaining**

${daysUntil <= exam.days_before_exam_for_review ? '⚠️ **You\'re in the review period!** Let\'s focus on revision and key concepts.' : 'Keep up your preparation! I\'ll remind you when it\'s time for final review.'}`;
        } else {
          response = 'You haven\'t scheduled any exams yet. Would you like to add an exam date? Go to the Exam Scheduler to set your exam, and I\'ll help you prepare one day before!';
        }
      } else if (lowerInput.includes('online') || lowerInput.includes('internet') || lowerInput.includes('resource')) {
        const subject = selectedSubject?.name || 'your subject';
        response = `Great! I can fetch online resources for **${subject}** from various educational platforms:

📚 **Available Online Sources:**
• Khan Academy - Free video lessons and exercises
• YouTube - Educational channels (Crash Course, TED-Ed)
• Wikipedia - Reference articles
• Coursera - University-level courses
• OpenStax - Free textbooks
• MIT OpenCourseWare - University materials

I'll curate the best resources based on your topic. Just tell me which specific topic you want to learn!`;
      } else if (lowerInput.includes('prepare') || lowerInput.includes('study plan')) {
        if (upcomingExam) {
          const daysUntil = Math.ceil((new Date(upcomingExam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const topic = upcomingExam.target_subject || selectedSubject?.name || 'your subjects';
          const reviewDays = upcomingExam.days_before_exam_for_review;

          response = `**Study Plan for ${upcomingExam.exam_name}**

🎯 **Goal**: Score ${upcomingExam.target_score}% on the exam
📚 **Subject Focus**: ${topic}
📅 **Days Left**: ${daysUntil}
⚡ **Review Period**: Last ${reviewDays} day(s) before exam

**Recommended Schedule:**
1. **Foundation Phase** (${Math.max(1, daysUntil - reviewDays - 3)} days): Learn core concepts
2. **Practice Phase** (${Math.min(3, daysUntil - reviewDays)} days): Solve problems, take quizzes
3. **Review Phase** (${reviewDays} days before exam): Final revision with AI guidance

${upcomingExam.current_readiness < 50 ? '⚠️ **Action needed**: Your readiness is below target. Let\'s increase your study time!' : '✅ You\'re on track. Keep up the good work!'}`;
        } else {
          response = 'To create a personalized study plan, please:\n\n1. Go to **Exam Scheduler**\n2. Add your exam date and subject\n3. I\'ll create a custom plan and prepare you one day before!\n\nMeanwhile, select a subject from the category browser and I can help you study.';
        }
      } else if (lowerInput.includes('topic') || lowerInput.includes('explain') || lowerInput.includes('learn')) {
        const subject = selectedSubject || subjects[0];
        if (subject) {
          const topicList = subject.topics?.slice(0, 3) || ['Basics', 'Fundamentals', 'Advanced concepts'];
          response = `Let me explain **${subject.name}** for you:

📖 **${subject.name} Overview**
${subject.description || 'This subject covers important concepts for your academic success.'}

**Key Topics:**
${topicList.map((t, i) => `${i + 1}. ${t}`).join('\n')}

**I can help you learn this by:**
• Searching online for the best tutorials and videos
• Creating custom practice exercises
• Explaining concepts step by step
• Testing your knowledge with flashcards

Would you like me to explain a specific topic? Type the topic name and I'll fetch resources!`;
        } else {
          response = 'I can explain any topic you\'re interested in! Just type the subject or topic name, and I\'ll:\n\n1. Search online educational resources\n2. Provide clear explanations\n3. Create practice questions\n4. Help you track your progress';
        }
      } else if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
        response = `**Here's how I can help you succeed:**

📚 **Study Materials**
• Use your own PDFs, images, and notes
• If you don't have materials, I fetch from Khan Academy, YouTube, Coursera, etc.

📅 **Exam Preparation**
• Set your exam date in the scheduler
• I create a personalized study plan
• AI reviews with you one day before the exam

🎯 **Progress Tracking**
• Visual dashboards show % mastered
• Daily goals and streaks
• Unlocked stages and achievements

📖 **Subjects Covered**
• Math, Physics, Chemistry, Biology
• History, Economics, Political Science
• Computer Science, Geography
• Languages: German, Spanish, French, Hindi, Sanskrit
• Psychology, Philosophy
• And more competitive exam topics!`;
      } else {
        // Default contextual response
        const contextTopic = selectedSubject?.name || selectedCategory || 'your studies';
        response = `I understand you're asking about "${input.trim()}".

Let me help you with **${contextTopic}**:

1. **Do you have study materials?** Upload PDFs, images, or notes, and I'll extract key information.
   - Don't have materials? I'll search online resources for you!

2. **Need a study plan?** If you have an exam coming up, I can create a schedule and review with you the day before.

3. **Want to practice?** I can generate quizzes and flashcards based on your topic.

Just let me know how you'd like to proceed!`;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        resources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const quickActions = [
    { icon: Calendar, label: 'When is my exam?', prompt: 'When is my exam?' },
    { icon: Globe, label: 'Find online resources', prompt: 'Find online resources for my subject' },
    { icon: BookOpen, label: 'Create study plan', prompt: 'Create a study plan for me' },
    { icon: Search, label: 'Explain a topic', prompt: 'Explain a topic to me' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">AI Tutor</h3>
            <p className="text-xs text-slate-500">Powered by online resources & your materials</p>
          </div>
          {upcomingExam && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium">
              {Math.ceil((new Date(upcomingExam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days to exam
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">AI Tutor</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('•')) {
                    return <p key={i} className="ml-2">{line}</p>;
                  }
                  return <p key={i}>{line}</p>;
                })}
              </div>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Online Resources */}
              {message.resources && message.resources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  {message.resources.map((resource, rIndex) => (
                    <a
                      key={rIndex}
                      href={resource.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100"
                    >
                      {resource.resource_type === 'video' ? (
                        <Video className="w-4 h-4 text-red-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-xs text-slate-600">{resource.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1 text-emerald-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">AI Tutor is searching...</span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action.prompt)}
              className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-50 whitespace-nowrap transition-colors"
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any topic, exam prep, or study materials..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

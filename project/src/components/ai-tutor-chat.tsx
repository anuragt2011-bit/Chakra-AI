'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles, Calendar, BookOpen, Globe, ExternalLink, Search, FileText, Video, UploadCloud, Wand2, Trophy, Mic2, Volume2, Layers, Download, HelpCircle } from 'lucide-react';
import { supabase, type ComprehensiveSubject, type UserExam, type OnlineResource } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  resources?: OnlineResource[];
}

type StudentProfile = {
  name: string;
  phone: string;
  email: string;
  authMethod: 'phone' | 'google' | 'email';
  classLevel: string;
  improvementSubjects: string[];
};

type StudyMaterial = {
  id: string;
  name: string;
  type: string;
  size: number;
  subject: string;
  note: string;
  addedAt: string;
};

interface AITutorChatProps {
  selectedCategory?: string | null;
  selectedSubject?: ComprehensiveSubject | null;
  upcomingExam?: UserExam | null;
  studentProfile?: StudentProfile | null;
  studyMaterials?: StudyMaterial[];
  onNavigate?: (tab: 'dashboard' | 'subjects' | 'exams' | 'materials' | 'ai-tutor') => void;
}

export function AITutorChat({ selectedCategory, selectedSubject, upcomingExam, studentProfile, studyMaterials = [], onNavigate }: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [subjects, setSubjects] = useState<ComprehensiveSubject[]>([]);
  const [userExams, setUserExams] = useState<UserExam[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
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

${studentProfile ? `\nStudent profile: ${studentProfile.name}, ${studentProfile.classLevel}, focusing on ${studentProfile.improvementSubjects.join(', ')}.` : ''}
${studyMaterials.length ? `\nI can already use ${studyMaterials.length} uploaded material(s): ${studyMaterials.slice(0, 3).map((m) => m.name).join(', ')}.` : ''}

How can I help you today?`;
    }

    setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
  }, [selectedSubject, upcomingExam, studentProfile, studyMaterials]);

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

  const speak = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#•]/g, ''));
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
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

      if (lowerInput.includes('flashcard') || lowerInput.includes('flash card')) {
        const source = studyMaterials[0]?.name || selectedSubject?.name || 'your current chapter';
        response = `**Flashcards from ${source}**\n\n1. Front: What is the main concept?\n   Back: Define it in one sentence, then add one example from your notes.\n\n2. Front: Which formula/rule is used most?\n   Back: Write the formula, meaning of each term, and one solved step.\n\n3. Front: What mistake should I avoid?\n   Back: Check units, signs, keywords, and final answer reasonableness.\n\n4. Front: How can this appear in an exam?\n   Back: As a definition, short answer, MCQ, numerical, or diagram-based question.\n\nUse **My Materials** to upload a specific chapter, then ask: "Make 20 flashcards from this file."`;
      } else if (lowerInput.includes('download') || lowerInput.includes('resource') || lowerInput.includes('online')) {
        const subject = selectedSubject?.name || studentProfile?.improvementSubjects[0] || 'your subject';
        response = `**Downloadable and online resources for ${subject}**\n\n• OpenStax / NCERT-style textbook notes for theory\n• Khan Academy practice for foundation concepts\n• MIT OCW / university notes for advanced topics\n• YouTube explainers for visual learning\n• Previous-year questions and formula sheets for exam practice\n\nChakra-AI plan: tell me your exact chapter and I will organize resources into **Watch → Read → Practice → Revise** with flashcards and a quiz.`;
      } else if (lowerInput.includes('material') || lowerInput.includes('upload') || lowerInput.includes('notes') || lowerInput.includes('pdf')) {
        if (studyMaterials.length > 0) {
          const materialList = studyMaterials.slice(0, 5).map((material, index) => `${index + 1}. ${material.name} (${material.subject})${material.note ? ` - ${material.note}` : ''}`).join('\n');
          response = `I found your uploaded study materials and will use them as the center of your learning plan:

${materialList}

**Material-aware help I can provide:**
• Summarize each file into easy revision notes
• Create chapter-wise practice questions
• Solve questions step by step using your notes
• Make flashcards and quick quizzes from the uploaded material

Ask me: "Create a quiz from my notes" or paste a question from your file.`;
        } else {
          onNavigate?.('materials');
          response = 'I am opening **My Materials** for you. Upload your PDFs, notes, images, worksheets, or question papers there. After that, I can summarize them, create quizzes, and solve questions according to your own material.';
        }
      } else if (lowerInput.includes('solve') || lowerInput.includes('answer') || lowerInput.includes('question')) {
        const focus = selectedSubject?.name || studentProfile?.improvementSubjects[0] || 'the topic';
        response = `Let's solve it together for **${focus}**.

**Step-by-step solution method:**
1. Identify what the question is asking.
2. List the given information from the problem.
3. Choose the correct formula, concept, or rule.
4. Work through each step clearly.
5. Check the final answer and explain why it makes sense.

Paste the full question (or upload its image/material in **My Materials**) and I will provide a complete, student-friendly solution with practice follow-ups.`;
      } else if (lowerInput.includes('quiz') || lowerInput.includes('practice')) {
        const focusSubjects = studentProfile?.improvementSubjects.join(', ') || selectedSubject?.name || 'your subject';
        const materialName = studyMaterials[0]?.name;
        response = `**Chakra-AI Quiz Builder: ${focusSubjects}**\n\n${materialName ? `Using your uploaded material: **${materialName}**` : 'Upload a material to make this quiz match your notes exactly.'}\n\n**Section A — Quick Recall**\n1. Define the most important term from this chapter.\n2. List two facts/formulas you must remember.\n\n**Section B — Application**\n3. Solve one example using the main rule or formula.\n4. Explain why each step is valid.\n\n**Section C — Exam Challenge**\n5. A tricky question will mix two concepts. Identify both and solve slowly.\n\nReply with your answers. I will grade them, explain mistakes, update readiness, and turn weak points into flashcards.`;
      } else if (lowerInput.includes('exam') && (lowerInput.includes('when') || lowerInput.includes('date'))) {
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
      speak(response);
      setIsTyping(false);
    }, 1000);
  };

  const quickActions = [
    { icon: Calendar, label: 'When is my exam?', prompt: 'When is my exam?' },
    { icon: Globe, label: 'Find online resources', prompt: 'Find online resources for my subject' },
    { icon: BookOpen, label: 'Create study plan', prompt: 'Create a study plan for me' },
    { icon: Search, label: 'Explain a topic', prompt: 'Explain a topic to me' },
    { icon: UploadCloud, label: 'Use my materials', prompt: 'Use my uploaded materials to help me study' },
    { icon: Wand2, label: 'Practice quiz', prompt: 'Create a practice quiz using my uploaded materials' },
    { icon: Layers, label: 'Flashcards', prompt: 'Create flashcards from my materials' },
    { icon: Download, label: 'Downloads', prompt: 'Find downloadable online resources for my subject' },
    { icon: HelpCircle, label: 'Solve book question', prompt: 'Solve this book question step by step' },
  ];

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-emerald-50 to-slate-50">
      {/* Header */}
      <div className="border-b border-emerald-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">Chakra-AI Command Tutor for {studentProfile?.classLevel || 'Students'}</h3>
            <p className="text-xs text-slate-500">Controls quizzes, flashcards, resources, question solving & voice explanations</p>
          </div>
          <button onClick={() => setVoiceEnabled((current) => !current)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${voiceEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {voiceEnabled ? <Volume2 className="mr-1 inline h-4 w-4" /> : <Mic2 className="mr-1 inline h-4 w-4" />}Voice {voiceEnabled ? 'on' : 'off'}
          </button>
          {upcomingExam && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium">
              {Math.ceil((new Date(upcomingExam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days to exam
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-emerald-100 bg-white/70 px-4 py-3">
        {studentProfile?.improvementSubjects.map((subject) => (
          <span key={subject} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"><Trophy className="mr-1 inline h-3 w-3" />{subject}</span>
        ))}
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">{studyMaterials.length} material(s) uploaded</span>
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

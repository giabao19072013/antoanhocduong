import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertCircle, 
  MessageSquare, 
  BookOpen, 
  Bell, 
  Send, 
  User, 
  ChevronRight, 
  ChevronLeft,
  LogOut,
  PhoneCall, 
  Info,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocFromServer, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from './firebase';
import { Report, SafetyMessage, LawEntry } from './types';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Mock Data ---
const LAW_DATA: LawEntry[] = [
  {
    id: '1',
    title: 'Quyền được bảo vệ',
    category: 'Quyền trẻ em',
    content: 'Trẻ em có quyền được bảo vệ dưới mọi hình thức để không bị bạo lực, bỏ rơi, bỏ mặc, bị xâm hại tình dục, bị khai thác sức lao động.'
  },
  {
    id: '2',
    title: 'Nghĩa vụ tôn trọng bạn bè',
    category: 'Nghĩa vụ học sinh',
    content: 'Học sinh có nghĩa vụ tôn trọng nhân phẩm, danh dự, thân thể của giáo viên, cán bộ, nhân viên nhà trường và các học sinh khác.'
  },
  {
    id: '3',
    title: 'Xử lý hành vi bạo lực',
    category: 'Pháp luật 2026',
    content: 'Các hành vi bạo lực học đường tùy theo mức độ sẽ bị xử lý kỷ luật theo quy định của nhà trường hoặc xử phạt hành chính, thậm chí truy cứu trách nhiệm hình sự.'
  },
  {
    id: '4',
    title: 'Quyền được tham gia',
    category: 'Quyền trẻ em',
    content: 'Trẻ em có quyền được bày tỏ ý kiến, nguyện vọng về các vấn đề liên quan đến mình; được nhà trường và xã hội lắng nghe, tôn trọng.'
  },
  {
    id: '5',
    title: 'Quyền bí mật đời tư',
    category: 'Quyền trẻ em',
    content: 'Trẻ em có quyền bất khả xâm phạm về đời sống riêng tư, bí mật cá nhân và bí mật gia đình vì lợi ích tốt nhất của trẻ em.'
  },
  {
    id: '6',
    title: 'Trách nhiệm của Nhà trường',
    category: 'Luật Giáo dục',
    content: 'Nhà trường có trách nhiệm xây dựng môi trường giáo dục an toàn, lành mạnh, thân thiện, phòng chống bạo lực học đường.'
  },
  {
    id: '7',
    title: 'Hành vi bị nghiêm cấm',
    category: 'Luật Trẻ em',
    content: 'Nghiêm cấm các hành vi bạo lực, bóc lột, xâm hại, bỏ rơi, bỏ mặc trẻ em; xúc phạm nhân phẩm, danh dự của trẻ em.'
  }
];

const INITIAL_SAFETY_MESSAGES: SafetyMessage[] = [
  {
    id: '1',
    title: 'Lan tỏa yêu thương',
    content: 'Hãy bắt đầu ngày mới bằng một lời chào và nụ cười với bạn bè xung quanh.',
    author: 'Ban Giám Hiệu',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Dừng lại bạo lực mạng',
    content: 'Suy nghĩ kỹ trước khi bình luận hoặc chia sẻ thông tin về người khác trên mạng xã hội.',
    author: 'Đội Thiếu Niên',
    timestamp: new Date().toISOString()
  }
];

const ADMIN_EMAILS = ['nguyenbao22013@gmail.com', 'nguyenbao42013@gmail.com'];

// --- Components ---

const SOSSection = () => {
  const [calling, setCalling] = useState(false);

  const handleSOS = () => {
    setCalling(true);
    // Thực hiện cuộc gọi thật qua giao thức tel:
    window.location.href = 'tel:111';
    
    setTimeout(() => {
      setCalling(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <button
          onClick={handleSOS}
          disabled={calling}
          className={cn(
            "w-48 h-48 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl hover:bg-red-700 transition-colors z-10 relative",
            calling && "animate-pulse"
          )}
        >
          <PhoneCall size={64} className="mb-2" />
          <span className="text-3xl font-black italic">SOS 111</span>
        </button>
        <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping" />
      </motion.div>
      
      <div className="text-center max-w-md px-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Cần trợ giúp khẩn cấp?</h3>
        <p className="text-gray-600">
          Nhấn nút để kết nối trực tiếp với Tổng đài Quốc gia Bảo vệ Trẻ em 111. 
          Chúng tôi luôn lắng nghe và bảo vệ bạn 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="font-semibold">Bảo mật tuyệt đối</h4>
            <p className="text-sm text-gray-500">Cuộc gọi của bạn được giữ bí mật hoàn toàn.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-3">
          <div className="bg-green-100 p-2 rounded-lg text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="font-semibold">Hỗ trợ kịp thời</h4>
            <p className="text-sm text-gray-500">Chuyên gia tâm lý và pháp luật sẽ hỗ trợ bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportSection = () => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        content,
        location,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      setSuccess(true);
      setContent('');
      setLocation('');
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Có lỗi xảy ra khi gửi tố giác. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center px-6"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Gửi tố giác thành công!</h3>
        <p className="text-gray-600 mb-8">
          Thông tin của bạn đã được gửi ẩn danh đến Ban Giám Hiệu. 
          Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          Gửi tố giác khác
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cổng tố giác ẩn danh</h2>
        <p className="text-gray-600 italic">
          "Sự im lặng là đồng lõa với cái ác." Hãy dũng cảm lên tiếng để bảo vệ chính mình và bạn bè. 
          Danh tính của bạn sẽ được bảo mật 100%.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Nội dung sự việc
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mô tả chi tiết sự việc bạo lực hoặc bắt nạt bạn đã chứng kiến hoặc trải qua..."
            className="w-full h-40 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Địa điểm (Không bắt buộc)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ví dụ: Sau nhà xe, Hành lang tầng 2, Trên mạng xã hội..."
            className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start space-x-3">
          <Info className="text-amber-600 shrink-0" size={20} />
          <p className="text-sm text-amber-800">
            Hệ thống không lưu trữ địa chỉ IP hay bất kỳ thông tin cá nhân nào của bạn. 
            Bạn hoàn toàn an toàn khi gửi thông tin tại đây.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} />
              <span>GỬI TỐ GIÁC ẨN DANH</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const MentorAI = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Chào bạn! Mình là Mentor AI, người bạn đồng hành của học sinh trường Lý Tự Trọng. Bạn đang gặp vấn đề gì hay cần lời khuyên về tâm lý học đường không? Mình luôn ở đây để lắng nghe.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "Bạn là Mentor AI, một chuyên gia tư vấn tâm lý học đường thân thiện, thấu cảm dành cho học sinh trường THCS Lý Tự Trọng. Nhiệm vụ của bạn là lắng nghe, đưa ra lời khuyên về cách ứng xử khi bị bạo lực học đường, cách giải tỏa căng thẳng và khuyến khích học sinh tìm kiếm sự giúp đỡ từ giáo viên hoặc người thân. Hãy sử dụng ngôn ngữ gần gũi với học sinh trung học cơ sở. Nếu học sinh đang gặp nguy hiểm thực sự, hãy nhắc các em nhấn nút SOS 111 hoặc báo ngay cho thầy cô."
        }
      });

      const response = await model;
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'Xin lỗi, mình đang gặp chút trục trặc. Bạn có thể hỏi lại được không?' }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Mình gặp lỗi kết nối rồi. Hãy thử lại sau nhé!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mx-4 md:mx-0">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center space-x-3">
        <div className="bg-white/20 p-2 rounded-xl">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="font-bold">Trợ lý Mentor AI</h3>
          <p className="text-xs opacity-80">Luôn lắng nghe & thấu hiểu</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
            )}>
              <div className="prose prose-sm max-w-none">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-tl-none flex space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhắn tin cho Mentor AI..."
          className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh sách tố giác</h2>
        <p className="text-gray-600">Chỉ quản trị viên mới có quyền xem danh sách này.</p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400">Chưa có tố giác nào được gửi.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                  report.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                )}>
                  {report.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(report.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="text-gray-800 mb-4 whitespace-pre-wrap">{report.content}</p>
              {report.location && (
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                  <Info size={16} className="mr-2" />
                  <span>Địa điểm: {report.location}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const LibrarySection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLaw = LAW_DATA.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pháp điển số 2026</h2>
        <p className="text-gray-600">Tìm hiểu về quyền lợi và trách nhiệm của bạn thông qua ngôn ngữ đơn giản.</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm quy định, quyền lợi..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredLaw.map((item) => (
          <motion.div 
            layout
            key={item.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {item.category}
              </span>
              <BookOpen size={20} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HomeSection = () => {
  const [messages, setMessages] = useState<SafetyMessage[]>(INITIAL_SAFETY_MESSAGES);

  useEffect(() => {
    const q = query(collection(db, 'safety_messages'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SafetyMessage));
      if (msgs.length > 0) setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10 py-6 px-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Vì một trường học <br />
            <span className="text-blue-300 italic underline decoration-wavy underline-offset-8">An toàn & Thân thiện</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 font-medium">
            Chào mừng bạn đến với hệ thống hỗ trợ học sinh trường THCS Lý Tự Trọng. 
            Chúng mình ở đây để bảo vệ và lắng nghe bạn.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center space-x-2">
              <Shield size={18} />
              <span className="text-sm font-semibold">Bảo mật 100%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center space-x-2">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">Trợ lý AI 24/7</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Safety Messages */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Bell className="text-blue-600" />
            <span>Thông điệp an toàn</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={msg.id} 
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{msg.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{msg.content}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{msg.author}</span>
                <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleDateString('vi-VN')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center space-y-2">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <PhoneCall size={24} />
          </div>
          <h4 className="font-bold text-red-900">SOS 111</h4>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertCircle size={24} />
          </div>
          <h4 className="font-bold text-indigo-900">Tố giác</h4>
        </div>
        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 text-center space-y-2">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Sparkles size={24} />
          </div>
          <h4 className="font-bold text-purple-900">Mentor AI</h4>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <BookOpen size={24} />
          </div>
          <h4 className="font-bold text-emerald-900">Pháp điển</h4>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'sos' | 'report' | 'mentor' | 'library' | 'admin'>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase configuration error.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setActiveTab('home');
      setShowLogout(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Shield },
    { id: 'sos', label: 'SOS 111', icon: AlertCircle, color: 'text-red-600' },
    { id: 'report', label: 'Tố giác', icon: MessageSquare },
    { id: 'mentor', label: 'Mentor AI', icon: Sparkles },
    { id: 'library', label: 'Pháp điển', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin', label: 'Quản trị', icon: Shield, color: 'text-purple-600' }] : []),
  ];

  return (
    <div className={cn(
      "min-h-screen bg-[#F8FAFC] font-sans text-gray-900 pb-24 md:pb-0 transition-all duration-300",
      isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
    )}>
      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 flex-col transition-all duration-300 z-40",
        isSidebarCollapsed ? "w-20 p-4" : "w-64 p-6"
      )}>
        <div className={cn(
          "flex items-center mb-10 px-2",
          isSidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-blue-600 p-2 rounded-xl text-white shrink-0">
              <Shield size={24} />
            </div>
            {!isSidebarCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black tracking-tight text-blue-900 whitespace-nowrap"
              >
                SafeSchool
              </motion.h1>
            )}
          </div>
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center rounded-2xl transition-all font-semibold",
                isSidebarCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-3",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={isSidebarCollapsed ? item.label : ""}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-blue-600" : item.color || "text-gray-400")} />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-50">
          {authLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <div className="relative">
              <AnimatePresence>
                {showLogout && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={handleLogout}
                    className={cn(
                      "absolute bottom-full left-0 right-0 mb-2 bg-red-50 text-red-600 p-3 rounded-2xl border border-red-100 flex items-center font-bold text-sm hover:bg-red-100 transition-all z-50",
                      isSidebarCollapsed ? "justify-center" : "space-x-2"
                    )}
                  >
                    <LogOut size={18} />
                    {!isSidebarCollapsed && <span>Đăng xuất</span>}
                  </motion.button>
                )}
              </AnimatePresence>
              
              <button 
                onClick={() => setShowLogout(!showLogout)}
                className={cn(
                  "w-full flex items-center px-2 py-2 rounded-2xl hover:bg-gray-50 transition-all",
                  isSidebarCollapsed ? "justify-center" : "space-x-3"
                )}
              >
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-blue-100 shrink-0" />
                {!isSidebarCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 overflow-hidden text-left"
                  >
                    <p className="text-sm font-bold truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">Học sinh</p>
                  </motion.div>
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className={cn(
                "w-full bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center",
                isSidebarCollapsed ? "p-3" : "py-3 space-x-2"
              )}
              title={isSidebarCollapsed ? "Đăng nhập" : ""}
            >
              <User size={18} />
              {!isSidebarCollapsed && <span>Đăng nhập</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Header (Mobile) */}
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md border-bottom border-gray-100 p-4 flex items-center justify-between z-40">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Shield size={18} />
          </div>
          <h1 className="font-black text-blue-900">SafeSchool</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-100 shadow-xl z-30 p-4 space-y-2"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold",
                  activeTab === item.id ? "bg-blue-50 text-blue-600" : "text-gray-600"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-4 mt-2 border-t border-gray-100">
              {authLoading ? (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-blue-100" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">{user.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">Học sinh</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all"
                  >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all"
                >
                  <User size={20} />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <HomeSection />}
            {activeTab === 'sos' && <SOSSection />}
            {activeTab === 'report' && <ReportSection />}
            {activeTab === 'mentor' && <MentorAI />}
            {activeTab === 'library' && <LibrarySection />}
            {activeTab === 'admin' && isAdmin && <AdminReports />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-2 py-3 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "flex flex-col items-center space-y-1 px-3 py-1 rounded-xl transition-all",
              activeTab === item.id ? "text-blue-600" : "text-gray-400"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id && "scale-110")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

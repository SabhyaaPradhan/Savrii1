import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { Navbar } from "@/components/ui/navbar";
import ReviewsSection from "@/components/ui/reviews-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  MessageSquare, 
  Clock, 
  Users, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Camera,
  Send,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ThreeCube from "@/components/ThreeCube";
import ThreeCone from "@/components/ThreeCone";
import ThreeSphere from "@/components/ThreeSphere";
import { SEOHead } from "@/components/SEOHead";
import aiGreen1 from "@assets/ai_green_1.jpg";
import aiGreen2 from "@assets/ai_green_2.jpg";
import aiGreen3 from "@assets/ai_green_3.jpg";
import aiGreen4 from "@assets/ai_green_4.jpg";
import aiRed1 from "@assets/ai_red_1.jpg";
import aiRed2 from "@assets/ai_red_2.jpg";
import aiRed3 from "@assets/ai_red_3.jpg";
import aiRed4 from "@assets/ai_red_4.jpg";

const integrations = [
  { name: "Zapier", logo: "https://img.icons8.com/color/48/zapier.png" },
  { name: "WhatsApp", logo: "https://img.icons8.com/color/48/whatsapp.png" },
  { name: "Meta", logo: "https://img.icons8.com/color/48/meta.png" },
  { name: "Slack", logo: "https://img.icons8.com/color/48/slack-new.png" },
  { name: "Discord", logo: "https://img.icons8.com/color/48/discord-new-logo.png" },
  { name: "Telegram", logo: "https://img.icons8.com/color/48/telegram-app.png" }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Coach",
    company: "Mindful Growth Coaching",
    content: "Savrii has transformed how I handle client inquiries. I can respond to 5x more queries while maintaining my personal touch.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "E-commerce Store Owner", 
    company: "TechGadgets Pro",
    content: "Customer satisfaction increased by 40% since implementing Savrii. It handles complex product questions instantly.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Consultant",
    company: "Digital Strategy Studio",
    content: "Perfect for maintaining consistent communication. My clients love the quick, professional responses.",
    rating: 5
  },
  {
    name: "David Park",
    role: "Marketing Director",
    company: "Growth Labs Inc",
    content: "The AI responses are so natural that our customers often don't realize they're talking to an automated system. Incredible technology!",
    rating: 5
  },
  {
    name: "Jennifer Walsh",
    role: "Customer Success Manager",
    company: "CloudTech Solutions",
    content: "Response time went from hours to seconds. Our customer satisfaction scores have never been higher since implementing Savrii.",
    rating: 5
  },
  {
    name: "Alex Thompson",
    role: "Startup Founder",
    company: "InnovateLab",
    content: "As a small team, Savrii helps us punch above our weight. We can handle enterprise-level customer support with just 3 people.",
    rating: 5
  },
  {
    name: "Rachel Martinez",
    role: "Real Estate Agent",
    company: "Premier Properties",
    content: "Savrii handles all my property inquiries professionally while I focus on closing deals. My leads never wait for responses anymore.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "SaaS Founder",
    company: "DataFlow Systems",
    content: "Our support ticket volume dropped by 60% after implementing Savrii. It resolves most customer questions before they escalate.",
    rating: 5
  },
  {
    name: "Lisa Chang",
    role: "Fitness Coach",
    company: "Elite Training Studio",
    content: "My clients get instant answers about workouts and nutrition. Savrii understands fitness terminology perfectly and provides accurate guidance.",
    rating: 5
  },
  {
    name: "Robert Taylor",
    role: "Legal Consultant",
    company: "Taylor Law Firm",
    content: "Savrii helps with initial client consultations and document explanations. It saves me hours while maintaining professional standards.",
    rating: 5
  },
  {
    name: "Amanda Foster",
    role: "Event Planner",
    company: "Elegant Events Co",
    content: "Planning inquiries are handled instantly with accurate venue and pricing information. My conversion rate increased significantly.",
    rating: 5
  },
  {
    name: "Carlos Mendez",
    role: "Digital Marketer",
    company: "Boost Media",
    content: "Client reporting and campaign questions are answered immediately. Savrii understands complex marketing metrics and explains them clearly.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Healthcare Administrator",
    company: "WellCare Medical",
    content: "<p>Patient appointment scheduling and basic health inquiries are handled seamlessly. Our staff can now focus on more critical tasks.</p>",
    rating: 5
  },
  {
    name: "Thomas Anderson",
    role: "Financial Advisor",
    company: "Secure Wealth Planning",
    content: "Investment questions and portfolio updates are communicated clearly to clients. Savrii maintains the professional tone I require.",
    rating: 5
  },
  {
    name: "Sophie Laurent",
    role: "Travel Agent",
    company: "Wanderlust Travel",
    content: "Travel inquiries, booking confirmations, and destination questions are handled perfectly. My clients appreciate the instant responses.",
    rating: 5
  },
  {
    name: "Kevin Brown",
    role: "IT Consultant",
    company: "TechSolutions Pro",
    content: "Technical support queries are resolved efficiently while maintaining accuracy. Savrii understands complex IT terminology and solutions.",
    rating: 5
  },
  {
    name: "Maria Gonzalez",
    role: "Restaurant Owner",
    company: "Bella Vista Bistro",
    content: "Reservation inquiries and menu questions are handled perfectly. Savrii knows our specials and dietary options, making customer service seamless.",
    rating: 5
  },
  {
    name: "Daniel Lee",
    role: "Online Course Creator",
    company: "SkillMaster Academy",
    content: "Student questions about course content and enrollment are answered instantly. My course completion rates improved significantly with faster support.",
    rating: 5
  }
];

const features = [
  {
    icon: Leaf,
    title: "Smart Responses",
    description: "Advanced technology that understands context and provides intelligent, personalized responses to customer queries."
  },
  {
    icon: MessageSquare,
    title: "Custom Prompts",
    description: "Supply your own prompts and knowledge base to ensure responses match your brand voice and expertise."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Never miss a customer inquiry. Savrii works around the clock to engage your audience instantly."
  },
  {
    icon: Users,
    title: "Multi-Channel Support",
    description: "Integrate with WhatsApp, email, website chat, and more for seamless customer communication."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Respond to customer queries in under 2 seconds with accurate, contextual information."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime to keep your customer communications safe."
  }
];

const faqs = [
  {
    question: "How does Savrii understand my business?",
    answer: "You provide prompts, knowledge base content, and product information. Savrii learns from this to give accurate responses that match your expertise and brand voice."
  },
  {
    question: "Can I customize the responses?",
    answer: "Absolutely! You have full control over the AI's knowledge base, tone, and response style. You can update prompts anytime to refine the responses."
  },
  {
    question: "What platforms does Savrii integrate with?",
    answer: "Savrii works with WhatsApp, email, website chat widgets, Zapier, Meta platforms, and many more through our API."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Start with our Starter plan which includes 100 free queries per month. No credit card required."
  },
  {
    question: "How accurate are the AI responses?",
    answer: "With properly configured prompts, Savrii achieves 95%+ accuracy. The AI learns from your corrections to continuously improve."
  }
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<number>(0);

  // Dynamic interface content for each feature
  const featureInterfaces = [
    {
      title: "AI Response Generator",
      content: (
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-emerald-700">AI Suggestions</span>
            </div>
            <p className="text-sm text-gray-700">Hi! Thank you for reaching out. I'd be happy to help you with your pricing inquiry...</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">Alternative Response</span>
            </div>
            <p className="text-sm text-gray-700">Thanks for your interest! Let me provide you with detailed pricing information...</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-full">Use Response</button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Edit</button>
          </div>
        </div>
      )
    },
    {
      title: "Smart Tone Adapter",
      content: (
        <div className="space-y-4">
          <div className="flex gap-2 mb-3">
            <button className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-full">Professional</button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Friendly</button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Casual</button>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 mb-2">Original: "Hey, what's the price?"</p>
            <div className="border-t pt-2">
              <p className="text-xs text-emerald-600 font-medium">Professional Tone:</p>
              <p className="text-sm text-gray-700">"Good day! I would appreciate information regarding your pricing structure."</p>
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700">Tone adapted successfully</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Context Analysis",
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 mb-3">"I'm frustrated with the delayed shipment and need immediate assistance!"</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700">Emotion: Frustrated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-orange-700">Priority: High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700">Topic: Shipping Issue</span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <p className="text-xs text-emerald-700 font-medium">Recommended Response Style:</p>
            <p className="text-sm text-emerald-700">Empathetic, Solution-focused, Urgent</p>
          </div>
        </div>
      )
    },
    {
      title: "Multi-Channel Hub",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
              <MessageSquare className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-700">WhatsApp</p>
              <p className="text-xs text-gray-600">12 messages</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
              <MessageCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-blue-700">Messenger</p>
              <p className="text-xs text-gray-600">8 messages</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-purple-700">Teams</p>
              <p className="text-xs text-gray-600">3 messages</p>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 text-center">
              <Camera className="w-5 h-5 text-pink-600 mx-auto mb-1" />
              <p className="text-xs text-pink-700">Instagram</p>
              <p className="text-xs text-gray-600">5 messages</p>
            </div>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg text-center">
            <p className="text-xs text-emerald-700 font-medium">All platforms synchronized</p>
          </div>
        </div>
      )
    },
    {
      title: "Real-Time Analytics",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <p className="text-lg font-bold text-emerald-600">94%</p>
              <p className="text-xs text-gray-600">Response Quality</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
              <p className="text-lg font-bold text-blue-600">2.3s</p>
              <p className="text-xs text-gray-600">Avg Response Time</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-lg text-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Live Performance</span>
            </div>
            <p className="text-xs opacity-90">Customer satisfaction increased by 23% this week</p>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Today: 47 responses</span>
            <span className="text-emerald-600">↑ 12% vs yesterday</span>
          </div>
        </div>
      )
    }
  ];

  // Chat messages for dynamic demo (default state)
  const chatMessages = [
    { text: "Hi! I need help with choosing the right plan for my business.", isUser: true },
    { text: "I'd be happy to help! Can you tell me about your business size and main communication needs?", isUser: false },
    { text: "We're a small consultancy firm with about 15 clients. We mainly use email and WhatsApp.", isUser: true },
    { text: "Perfect! Based on your needs, I'd recommend our Pro plan. It includes unlimited responses, multi-channel support, and team collaboration features. Would you like me to show you a quick demo?", isUser: false, typing: true }
  ];

  // Animation functions for feature section
  const animateFeatureHover = (index: number, isHovering: boolean) => {
    const element = featureItemsRef.current[index];
    if (!element) return;

    if (isHovering) {
      gsap.to(element, {
        scale: 1.02,
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };
  
  // Responsive testimonials per slide
  const testimonialsPerSlide = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);
  
  // Debug log to check if component is mounting
  console.log('Landing component mounted, isAuthenticated:', isAuthenticated);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const revealBlockRef = useRef<HTMLDivElement>(null);
  const revealer1Ref = useRef<HTMLDivElement>(null);
  const revealer2Ref = useRef<HTMLDivElement>(null);
  const revealer3Ref = useRef<HTMLDivElement>(null);
  const revealer4Ref = useRef<HTMLDivElement>(null);
  const revealer5Ref = useRef<HTMLDivElement>(null);
  const revealer6Ref = useRef<HTMLDivElement>(null);
  const revealer7Ref = useRef<HTMLDivElement>(null);
  const revealer8Ref = useRef<HTMLDivElement>(null);

  // Dynamic Feature Section Refs
  const featureSectionRef = useRef<HTMLDivElement>(null);
  const featureListRef = useRef<HTMLDivElement>(null);
  const featureTitleRef = useRef<HTMLDivElement>(null);
  const featureItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const featureCtaRef = useRef<HTMLDivElement>(null);
  const mobileDemoRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const socialIconsRef = useRef<HTMLDivElement>(null);
  const socialIconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statusIndicatorRef = useRef<HTMLDivElement>(null);
  const aiBadgeRef = useRef<HTMLDivElement>(null);
  const floatingElement1Ref = useRef<HTMLDivElement>(null);
  const floatingElement2Ref = useRef<HTMLDivElement>(null);
  const floatingElement3Ref = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/auth";
    }
  };

  // Handle responsive breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Reset slide when switching between mobile/desktop
  useEffect(() => {
    setCurrentSlide(0);
  }, [isMobile]);

  // Auto-slide testimonials
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide(prev => 
          prev === totalSlides - 1 ? 0 : prev + 1
        );
      }, 4000); // Change slide every 4 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoPlaying, totalSlides]);

  // Resume auto-playing after manual interaction
  useEffect(() => {
    if (!isAutoPlaying) {
      const timeout = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000); // Resume auto-playing after 10 seconds of inactivity

      return () => clearTimeout(timeout);
    }
  }, [isAutoPlaying, currentSlide]);

  // Dynamic Feature Section Animation Setup
  useEffect(() => {
    if (!featureSectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: featureSectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    // Animate title
    if (featureTitleRef.current) {
      tl.fromTo(featureTitleRef.current.children, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }

    // Animate feature items
    featureItemsRef.current.forEach((item, index) => {
      if (item) {
        tl.fromTo(item,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          `-=${index === 0 ? 0.4 : 0.3}`
        );
      }
    });

    // Animate phone
    if (phoneRef.current) {
      tl.fromTo(phoneRef.current,
        { x: 50, opacity: 0, rotationY: 15 },
        { x: 0, opacity: 1, rotationY: 0, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      );
    }

    // Animate social icons
    socialIconRefs.current.forEach((icon, index) => {
      if (icon) {
        tl.fromTo(icon,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" },
          `-=${0.8 - index * 0.1}`
        );
      }
    });

    // Animate messages sequentially
    messageRefs.current.forEach((message, index) => {
      if (message) {
        tl.fromTo(message,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          `-=${0.4 - index * 0.2}`
        );
      }
    });

    // Animate floating elements
    if (floatingElement1Ref.current) {
      gsap.to(floatingElement1Ref.current, {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1
      });
    }

    if (floatingElement2Ref.current) {
      gsap.to(floatingElement2Ref.current, {
        rotation: -360,
        duration: 25,
        ease: "none",
        repeat: -1
      });
    }

    if (statusIndicatorRef.current) {
      gsap.to(statusIndicatorRef.current, {
        scale: 1.2,
        duration: 1,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });
    }

  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      setIsAutoPlaying(false);
    }

    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setIsAutoPlaying(false);
    }
  };

  // Navigation functions
  const goToPrevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? totalSlides - 1 : prev - 1);
    setIsAutoPlaying(false);
  };

  const goToNextSlide = () => {
    setCurrentSlide(prev => prev === totalSlides - 1 ? 0 : prev + 1);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    // Get navbar element
    const navbar = document.querySelector('nav') as HTMLElement;
    
    console.log('Starting revealer animation setup with AI images...');
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      console.log('Reduced motion detected, skipping animations');
      // Skip animations for accessibility
      [revealer1Ref, revealer2Ref, revealer3Ref, revealer4Ref, 
       revealer5Ref, revealer6Ref, revealer7Ref, revealer8Ref].forEach(ref => {
        if (ref.current) {
          gsap.set(ref.current, { display: 'none' });
        }
      });
      // Show navbar immediately if no animations
      if (navbar) {
        gsap.set(navbar, { opacity: 1, visibility: 'visible' });
      }
      return;
    }

    // Set initial positions for all 8 revealers
    gsap.set([
      revealer1Ref.current, 
      revealer2Ref.current, 
      revealer3Ref.current, 
      revealer4Ref.current,
      revealer5Ref.current, 
      revealer6Ref.current, 
      revealer7Ref.current, 
      revealer8Ref.current
    ], {
      y: 0
    });

    // Hide navbar during revealer animation
    if (navbar) {
      gsap.set(navbar, {
        opacity: 0,
        visibility: 'hidden'
      });
    }

    // Hide elements initially
    gsap.set([heroTitleRef.current, heroSubtitleRef.current, heroButtonRef.current, heroBadgeRef.current], {
      opacity: 0,
      y: 30
    });
    
    gsap.set(heroImageRef.current, {
      opacity: 0
    });

    gsap.set(revealBlockRef.current, {
      opacity: 0,
      display: "none"
    });

    // CodeGrid style timeline animation
    const tl = gsap.timeline();

    // 8 Revealer animation sequence - staggered AI image reveals
    tl.to(revealer1Ref.current, {
      duration: 1.8,
      y: "-100%",
      ease: "expo.inOut",
      delay: 0.1
    });

    tl.to(revealer2Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
      delay: 0.08
    }, "-=1.7");

    tl.to(revealer3Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
      delay: 0.06
    }, "-=1.68");

    tl.to(revealer4Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
      delay: 0.04
    }, "-=1.66");

    tl.to(revealer5Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
      delay: 0.02
    }, "-=1.64");

    tl.to(revealer6Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
      delay: 0.01
    }, "-=1.62");

    tl.to(revealer7Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
    }, "-=1.61");

    tl.to(revealer8Ref.current, {
      duration: 1.8,
      y: "-100%", 
      ease: "expo.inOut",
    }, "-=1.60");

    // Show navbar only after revealer blocks are completely gone
    if (navbar) {
      tl.to(navbar, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.4,
        ease: "expo.inOut"
      }, "+=0.1");
    }

    // Hero content reveal - staggered text animation  
    tl.fromTo([heroBadgeRef.current, heroTitleRef.current, heroSubtitleRef.current, heroButtonRef.current],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "expo.inOut",
        stagger: 0.08
      },
      "+=0.3"
    );

    // Image reveal - just show the image without the block overlay
    tl.to(heroImageRef.current, {
      duration: 0.5,
      opacity: 1,
      ease: "expo.inOut"
    }, "+=0.5");

    // Hide revealer container after all animations complete
    tl.call(() => {
      console.log('Hiding revealer container after animations complete...');
      const reveelerContainer = document.querySelector('.revealers');
      if (reveelerContainer) {
        gsap.set(reveelerContainer, { display: 'none', visibility: 'hidden' });
      }
      // Also hide individual revealers
      const revealerElements = [
        revealer1Ref.current, 
        revealer2Ref.current, 
        revealer3Ref.current, 
        revealer4Ref.current,
        revealer5Ref.current, 
        revealer6Ref.current, 
        revealer7Ref.current, 
        revealer8Ref.current
      ].filter(Boolean);
      
      if (revealerElements.length > 0) {
        gsap.set(revealerElements, {
          display: 'none',
          visibility: 'hidden'
        });
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  const landingStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Savrii - Smart Customer Communication Platform",
    "description": "Transform your customer communication with AI-powered responses. Perfect for coaches, consultants, freelancers, and e-commerce businesses.",
    "url": "https://www.savrii.com",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Savrii",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free trial available"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "156",
        "bestRating": "5",
        "worstRating": "1"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Savrii - Transform Customer Communication with AI | Smart Business Solutions"
        description="Transform your customer communication with Savrii's AI-powered platform. Generate professional responses instantly for coaches, consultants, freelancers, and e-commerce businesses. Start free today."
        keywords="AI customer support, automated responses, business communication, customer service platform, AI chatbot, professional messaging, client management, smart replies, customer engagement"
        canonicalUrl="https://www.savrii.com"
        structuredData={landingStructuredData}
      />
      {/* GSAP Revealers - Full Screen Slide Up Animation */}
      <div className="revealers images" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
        <div 
          ref={revealer1Ref}
          className="revealer r-1 fixed inset-0 z-[67]"
          style={{
            backgroundImage: `url(${aiGreen1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer2Ref}
          className="revealer r-2 fixed inset-0 z-[66]"
          style={{
            backgroundImage: `url(${aiRed1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer3Ref}
          className="revealer r-3 fixed inset-0 z-[65]"
          style={{
            backgroundImage: `url(${aiGreen2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer4Ref}
          className="revealer r-4 fixed inset-0 z-[64]"
          style={{
            backgroundImage: `url(${aiRed2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer5Ref}
          className="revealer r-5 fixed inset-0 z-[63]"
          style={{
            backgroundImage: `url(${aiGreen3})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer6Ref}
          className="revealer r-6 fixed inset-0 z-[62]"
          style={{
            backgroundImage: `url(${aiRed3})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer7Ref}
          className="revealer r-7 fixed inset-0 z-[61]"
          style={{
            backgroundImage: `url(${aiGreen4})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
        <div 
          ref={revealer8Ref}
          className="revealer r-8 fixed inset-0 z-[60]"
          style={{
            backgroundImage: `url(${aiRed4})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'sepia(40%) saturate(200%) hue-rotate(70deg)'
          }}
        />
      </div>



      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <header>
          <Navbar />
        </header>
        
        <main>
          {/* Hero Section */}
          <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative" role="banner">
          <div className="max-w-7xl mx-auto">
            {/* 3D Background Cube for Hero Section */}
            <div className="absolute inset-0 overflow-hidden">
              <ThreeCube />
            </div>
            
            {/* 3D Rotating Geometric Shapes - Cone (top left) and Sphere (top right) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* 3D Rotating Cone - Top Left */}
              <div className="absolute top-8 left-8 lg:top-16 lg:left-16 opacity-60 dark:opacity-40">
                <ThreeCone />
              </div>
              
              {/* 3D Rotating Sphere - Top Right */}
              <div className="absolute top-8 right-8 lg:top-16 lg:right-16 opacity-60 dark:opacity-40">
                <ThreeSphere />
              </div>
            </div>
            <div className="text-center relative z-10">
              <div className="mb-8">
                <div ref={heroBadgeRef}>
                  <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                    🌱 Natural Customer Communication
                  </Badge>
                </div>
                <h1 
                  ref={heroTitleRef}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent font-playfair"
                >
                  Turn Every Query Into A{" "}
                  <span className="block">
                    Perfect Response
                  </span>
                </h1>
              </div>
              
              <p
                ref={heroSubtitleRef}
                className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              >
                Savrii is your smart assistant that automatically replies to customer queries using your expertise. 
                Perfect for <span className="font-semibold text-green-600 dark:text-green-400">coaches</span>, 
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> consultants</span>, 
                <span className="font-semibold text-green-600 dark:text-green-400"> freelancers</span>, and 
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> e-commerce sellers</span>.
              </p>
              
              <div
                ref={heroButtonRef}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              >
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 text-lg font-medium hover:from-green-700 hover:to-emerald-800 transform hover:scale-105 transition-all shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Demo Preview with Image Reveal */}
              <div
                ref={heroImageRef}
                className="relative"
              >
                <div className="relative">
                  <div 
                    ref={revealBlockRef}
                    className="absolute inset-0 bg-green-600 dark:bg-emerald-700 z-10"
                  />
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden max-w-5xl mx-auto">
                    <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Savrii Dashboard</span>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Recent Queries</h3>
                          <div className="space-y-3">
                            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-300">"What's your refund policy?"</p>
                              <p className="text-xs text-green-600 mt-1">✓ Responded in 1.2s</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-300">"Do you offer group coaching sessions?"</p>
                              <p className="text-xs text-green-600 mt-1">✓ Responded in 0.8s</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Analytics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">2,847</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Queries Handled</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">96%</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Satisfaction</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 font-playfair">Why Choose Savrii?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Empower your business with smart technology that understands your expertise and communicates with your voice.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="group">
                    <Card className="h-full transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-slate-700">
                      <CardHeader>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="text-white w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 font-playfair">Trusted by Industry Leaders</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
              Join thousands of professionals who trust Savrii for their customer communication.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
              {integrations.map((integration) => (
                <div key={integration.name} className="flex items-center justify-center">
                  <img 
                    src={integration.logo} 
                    alt={integration.name}
                    className="h-8 w-8 grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic GSAP Feature Showcase */}
        <section ref={featureSectionRef} className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Animated Feature List */}
              <div ref={featureListRef} className="space-y-8">
                <div ref={featureTitleRef} className="mb-12">
                  <h2 className="text-5xl md:text-6xl font-bold font-playfair leading-tight">
                    <span className="block text-emerald-400 mb-2">Transform</span>
                    <span className="block text-gray-900 dark:text-white mb-2">customer</span>
                    <span className="block text-emerald-400">communication</span>
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-green-500 mt-6"></div>
                </div>
                
                <div className="space-y-6">
                  {[
                    { 
                      icon: MessageSquare, 
                      name: "AI-powered responses", 
                      description: "Generate professional replies that match your brand voice instantly",
                      metric: "5x faster"
                    },
                    { 
                      icon: Zap, 
                      name: "Smart tone adaptation", 
                      description: "Automatically adjust communication style for each customer",
                      metric: "98% accuracy"
                    },
                    { 
                      icon: Shield, 
                      name: "Context analyzer", 
                      description: "Understand customer intent and emotional context perfectly",
                      metric: "Advanced AI"
                    },
                    { 
                      icon: Users, 
                      name: "Multi-channel support", 
                      description: "Unified experience across email, chat, and social media",
                      metric: "All platforms"
                    },
                    { 
                      icon: Clock, 
                      name: "Real-time insights", 
                      description: "Track performance and optimize responses continuously",
                      metric: "Live data"
                    }
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div 
                        key={index}
                        ref={el => featureItemsRef.current[index] = el}
                        className={`group flex items-start gap-6 p-6 rounded-xl cursor-pointer transition-all duration-500 border ${
                          activeFeature === index 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40' 
                            : 'hover:bg-gray-100 dark:hover:bg-slate-800/30 border-transparent hover:border-emerald-500/20'
                        }`}
                        onMouseEnter={() => {
                          setActiveFeature(index);
                          animateFeatureHover(index, true);
                        }}
                        onMouseLeave={() => animateFeatureHover(index, false)}
                      >
                        <div className="flex-shrink-0 relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-emerald-400/30 group-hover:border-emerald-400/60 transition-all duration-300">
                            <Icon className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-emerald-300 transition-colors duration-300">
                              {feature.name}
                            </h3>
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                              {feature.metric}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors duration-300 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all duration-300 flex-shrink-0 mt-2" />
                      </div>
                    );
                  })}
                </div>
                
                <div ref={featureCtaRef} className="pt-8 border-t border-emerald-500/20">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    <span className="text-emerald-400 font-semibold">Join 10,000+ professionals</span> who trust Savrii 
                    to deliver exceptional customer experiences at scale.
                  </p>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Right Side - Interactive Mobile Demo */}
              <div ref={mobileDemoRef} className="relative">
                {/* Floating Social Icons */}
                <div ref={socialIconsRef} className="absolute right-0 top-8 flex flex-col gap-4 z-20">
                  {[
                    { 
                      icon: MessageSquare, 
                      bg: "from-green-500 to-green-600", 
                      name: "WhatsApp", 
                      delay: 0,
                      bgPattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iIzI1RDM2NiIvPgo8L3N2Zz4K')]"
                    },
                    { 
                      icon: MessageCircle, 
                      bg: "from-blue-500 to-blue-600", 
                      name: "Messenger", 
                      delay: 0.1,
                      bgPattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iIzAwN0NGRiIvPgo8L3N2Zz4K')]"
                    },
                    { 
                      icon: Camera, 
                      bg: "from-pink-500 to-pink-600", 
                      name: "Instagram", 
                      delay: 0.2,
                      bgPattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iI0U0NDA1RiIvPgo8L3N2Zz4K')]"
                    },
                    { 
                      icon: Users, 
                      bg: "from-green-600 to-green-700", 
                      name: "WeChat", 
                      delay: 0.3,
                      bgPattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iIzA5QjEzOSIvPgo8L3N2Zz4K')]"
                    },
                    { 
                      icon: Send, 
                      bg: "from-blue-400 to-blue-500", 
                      name: "Telegram", 
                      delay: 0.4,
                      bgPattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iIzI2QTVFNCIvPgo8L3N2Zz4K')]"
                    },
                    { 
                      icon: Briefcase, 
                      bg: "from-purple-600 to-purple-700", 
                      name: "Microsoft Teams", 
                      delay: 0.5,
                      bgPattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJDMiAxNy41MjMgNi40NzcgMjIgMTIgMjJDMTcuNTIzIDIyIDIyIDE3LjUyMyAyMiAxMkMyMiA2LjQ3NyAxNy41MjMgMiAxMiAyWiIgZmlsbD0iIzY5NjRERiIvPgo8L3N2Zz4K')]"
                    }
                  ].map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <div 
                        key={index}
                        ref={el => socialIconRefs.current[index] = el}
                        className={`relative w-12 h-12 bg-gradient-to-br ${social.bg} rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-300 border-2 border-white/20 hover:border-white/40 overflow-hidden group`}
                        title={social.name}
                        style={{ animationDelay: `${social.delay}s` }}
                      >
                        {/* Background Pattern */}
                        <div className={`absolute inset-0 opacity-20 ${social.bgPattern} bg-center bg-cover`}></div>
                        
                        {/* Icon */}
                        <Icon className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    );
                  })}
                </div>

                {/* Animated Mobile Mockup */}
                <div ref={phoneRef} className="relative mx-auto w-80 max-w-sm">
                  {/* Phone Device */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-3 shadow-2xl border border-gray-700">
                    <div className="bg-white rounded-[2rem] overflow-hidden relative">
                      {/* Screen Glare Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-10"></div>
                      
                      {/* Phone Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div ref={statusIndicatorRef} className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                          <span className="text-sm font-semibold text-gray-700">Savrii AI Assistant</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Live Chat</div>
                      </div>

                      {/* Dynamic Interface Container */}
                      <div ref={chatContainerRef} className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-96 relative overflow-hidden">
                        {/* Feature Interface Header */}
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-semibold text-gray-700">
                            {featureInterfaces[activeFeature].title}
                          </span>
                        </div>

                        {/* Dynamic Content */}
                        <div 
                          key={activeFeature}
                          className="transition-all duration-500 ease-in-out"
                        >
                          {featureInterfaces[activeFeature].content}
                        </div>
                        
                        {/* Savrii Badge */}
                        <div ref={aiBadgeRef} className="flex justify-center mt-4">
                          <div className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-200 shadow-sm">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            Powered by Savrii AI
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Background Elements */}
                <div ref={floatingElement1Ref} className="absolute -top-8 -left-8 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"></div>
                <div ref={floatingElement2Ref} className="absolute -bottom-8 -right-8 w-20 h-20 bg-green-400/10 rounded-full blur-xl"></div>
                <div ref={floatingElement3Ref} className="absolute top-1/2 -left-4 w-16 h-16 bg-emerald-300/10 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Slider */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50 dark:from-slate-900 dark:via-green-950/10 dark:to-emerald-950/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-emerald-200 dark:border-emerald-800">
                <Quote className="w-4 h-4" />
                Success Stories
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-playfair bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Real stories from professionals who transformed their customer communication with Savrii.
              </p>
            </div>

            <div className="relative">
              {/* Main testimonials container */}
              <div 
                className="overflow-hidden rounded-lg"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="flex transition-all duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className={`grid gap-6 ${
                        isMobile 
                          ? 'grid-cols-1 px-8' 
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4'
                      }`}>
                        {testimonials
                          .slice(slideIndex * testimonialsPerSlide, (slideIndex + 1) * testimonialsPerSlide)
                          .map((testimonial, index) => (
                            <Card 
                              key={`${slideIndex}-${index}`} 
                              className={`bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                isMobile ? 'mx-auto max-w-sm w-full' : ''
                              }`}
                            >
                              <CardContent className="p-6 text-center">
                                {/* Stars */}
                                <div className="flex items-center justify-center space-x-1 mb-4">
                                  {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>

                                {/* Avatar */}
                                <div className="flex justify-center mb-4">
                                  <div className={`rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold shadow-lg ${
                                    isMobile ? 'w-20 h-20 text-xl' : 'w-16 h-16 text-lg'
                                  }`}>
                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                </div>

                                {/* Quote */}
                                <blockquote className={`text-gray-700 dark:text-gray-300 mb-4 italic leading-relaxed ${
                                  isMobile ? 'text-base' : 'text-sm'
                                }`}>
                                  "{testimonial.content}"
                                </blockquote>

                                {/* User info */}
                                <div>
                                  <p className={`font-bold text-gray-900 dark:text-white font-heading ${
                                    isMobile ? 'text-lg' : 'text-base'
                                  }`}>
                                    {testimonial.name}
                                  </p>
                                  <p className={`text-emerald-600 dark:text-emerald-400 font-medium ${
                                    isMobile ? 'text-base' : 'text-sm'
                                  }`}>
                                    {testimonial.role}
                                  </p>
                                  <p className={`text-gray-500 dark:text-gray-400 ${
                                    isMobile ? 'text-sm' : 'text-xs'
                                  }`}>
                                    {testimonial.company}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows - Hidden on mobile for cleaner experience */}
              {!isMobile && (
                <>
                  <button
                    onClick={goToPrevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full shadow-lg border border-emerald-200 dark:border-emerald-700 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 group"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
                  </button>

                  <button
                    onClick={goToNextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full shadow-lg border border-emerald-200 dark:border-emerald-700 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 group"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
                  </button>
                </>
              )}

              {/* Dots indicator - Enhanced for mobile */}
              <div className="flex justify-center space-x-3 mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      isMobile ? 'w-4 h-4' : 'w-3 h-3'
                    } ${
                      index === currentSlide
                        ? 'bg-emerald-500 scale-125 shadow-lg'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-emerald-300 dark:hover:bg-emerald-700'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Mobile swipe indicators */}
              {isMobile && (
                <div className="flex justify-center mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Swipe or tap dots to navigate
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection />

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6 font-playfair">Ready to Transform Your Customer Communication?</h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses using Savrii to provide instant, intelligent customer support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10 px-8 py-4 text-lg font-medium bg-[#347758]"
                  onClick={() => window.location.href = "/contact"}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </>
  );
}

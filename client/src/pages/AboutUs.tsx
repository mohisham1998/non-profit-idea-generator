import { Button } from "@/components/ui/button";
import Background3D from "@/components/Background3D";
import Navbar from "@/components/Navbar";
import { 
  Sparkles, 
  Target, 
  Users, 
  Heart, 
  Lightbulb, 
  Shield, 
  Award,
  ArrowLeft,
  Mail,
  Globe,
  Rocket,
  Zap,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "الابتكار",
      description: "نسعى دائماً لتقديم حلول مبتكرة وفريدة تساعد المنظمات على تحقيق أهدافها بطرق جديدة وفعالة"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "الشغف",
      description: "نؤمن بقوة العمل الخيري ونعمل بشغف لدعم المنظمات غير الربحية في رحلتها نحو التأثير الإيجابي"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "الموثوقية",
      description: "نلتزم بأعلى معايير الجودة والدقة في جميع الأدوات والحلول التي نقدمها"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "التعاون",
      description: "نؤمن بأن النجاح يتحقق من خلال العمل الجماعي والشراكات الفعالة مع عملائنا"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "توليد الأفكار بالذكاء الاصطناعي",
      description: "تحويل أفكارك إلى برامج ومبادرات متكاملة باستخدام أحدث تقنيات الذكاء الاصطناعي"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "التقييم المنهجي",
      description: "تقييم برامجك وفق منهجيات عالمية معتمدة لتعظيم العائد على الاستثمار الاجتماعي"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "أدوات احترافية",
      description: "مجموعة شاملة من الأدوات تشمل الإطار المنطقي، PMDPro، التفكير التصميمي، وغيرها"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "تطوير مستمر",
      description: "نعمل باستمرار على تحسين وتطوير المنصة لتلبية احتياجات المنظمات المتغيرة"
    }
  ];

  const products = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "مُولّد الأفكار الذكي",
      description: "أداة متقدمة تستخدم الذكاء الاصطناعي لتوليد أفكار برامج ومبادرات مبتكرة ومتكاملة"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "لوحة متابعة المشاريع",
      description: "نظام شامل لمتابعة تقدم المشاريع مع رسوم بيانية تفاعلية ومؤشرات أداء"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "أدوات التقييم المتقدمة",
      description: "منهجيات عالمية للتقييم تشمل الإطار المنطقي وPMDPro والتفكير التصميمي"
    }
  ];

  const team = [
    {
      name: "عمار العوفي",
      role: "المؤسس والمدير التنفيذي",
      description: "خبير في تطوير البرامج والمبادرات للمنظمات غير الربحية مع خبرة تزيد عن 10 سنوات في القطاع الثالث"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Background */}
      <Background3D />
      
      {/* Gradient Overlay - Updated to match brand colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-amber-300/20 to-cyan-400/20 pointer-events-none" />
      
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo-masar.png" 
              alt="مسار الابتكار" 
              className="w-32 h-32 object-contain"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-cyan-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-orange-500/30">
            <Globe className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700 font-medium">منصة سعودية للمنظمات غير الربحية</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 font-tajawal">
            <span className="bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">مسار الابتكار</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            نعمل على تقديم الحلول والابتكارات لتسهيل وتميز عمل المنظمات غير الربحية
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            من خلال تقديم منتجات فريدة ومبتكرة تساعد في تحويل الأفكار إلى برامج ومبادرات مؤثرة
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card p-8 rounded-2xl hover-lift border border-orange-200/50">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 font-tajawal">رسالتنا</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              تمكين المنظمات غير الربحية من تحويل أفكارها إلى برامج ومبادرات مؤثرة 
              من خلال توفير أدوات ذكية وحلول مبتكرة تعتمد على أفضل الممارسات العالمية 
              والذكاء الاصطناعي، لتعظيم الأثر الاجتماعي وتحقيق التنمية المستدامة.
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl hover-lift border border-cyan-200/50">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 font-tajawal">رؤيتنا</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              أن نكون المنصة الرائدة عربياً في دعم المنظمات غير الربحية بالأدوات الذكية 
              والحلول المبتكرة، ونساهم في بناء قطاع ثالث قوي ومؤثر يحقق التنمية المستدامة 
              ويخدم المجتمعات بكفاءة وفعالية.
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-tajawal">منتجاتنا المبتكرة</h2>
            <p className="text-gray-600 text-lg">حلول فريدة مصممة خصيصاً للمنظمات غير الربحية</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-2xl hover-lift border border-orange-200/30"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                  {product.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 font-tajawal">{product.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-tajawal">قيمنا</h2>
            <p className="text-gray-600 text-lg">المبادئ التي توجه عملنا وتشكل ثقافتنا</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-2xl text-center hover-lift group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600 group-hover:from-orange-500 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 font-tajawal">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-tajawal">ما نقدمه</h2>
            <p className="text-gray-600 text-lg">مجموعة متكاملة من الأدوات والحلول الذكية</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-2xl hover-lift flex gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 font-tajawal">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-tajawal">فريقنا</h2>
            <p className="text-gray-600 text-lg">الأشخاص الذين يقفون وراء هذه المنصة</p>
          </div>
          
          <div className="flex justify-center">
            {team.map((member, index) => (
              <div 
                key={index}
                className="glass-card p-8 rounded-2xl text-center hover-lift max-w-md border border-orange-200/30"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-tajawal">{member.name}</h3>
                <p className="text-orange-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="glass-card p-12 rounded-3xl max-w-2xl mx-auto border border-orange-200/30">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-tajawal">تواصل معنا</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              نسعد بتواصلكم واستفساراتكم. نحن هنا لمساعدتكم في رحلتكم نحو تطوير برامج ومبادرات مؤثرة
            </p>
            <a 
              href="mailto:ammaraluofi@gmail.com"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5" />
              ammaraluofi@gmail.com
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-masar.png" 
              alt="مسار الابتكار" 
              className="w-12 h-12 object-contain opacity-80"
            />
          </div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} مسار الابتكار. جميع الحقوق محفوظة.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            حلول مبتكرة للمنظمات غير الربحية
          </p>
        </div>
      </footer>
    </div>
  );
}

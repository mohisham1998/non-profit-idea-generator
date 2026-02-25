import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Check, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram,
  Mail,
  Megaphone,
  Hash,
  MessageSquare,
  Zap,
  Quote,
  X
} from "lucide-react";
import { toast } from "sonner";

interface MarketingContentProps {
  content: {
    socialMedia: {
      twitter: string[];
      facebook: string[];
      linkedin: string[];
      instagram: string[];
    };
    emails: {
      donors: { subject: string; body: string };
      volunteers: { subject: string; body: string };
      partners: { subject: string; body: string };
    };
    adCopy: {
      short: string[];
      medium: string[];
      long: string;
    };
    hashtags: string[];
    keyMessages: string[];
    callToAction: string[];
    slogans: string[];
  };
  programName: string;
  onClose: () => void;
  onEdit?: () => void;
}

export default function MarketingContent({ content, programName, onClose, onEdit }: MarketingContentProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      toast.success("تم النسخ!");
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast.error("فشل النسخ");
    }
  };

  const CopyButton = ({ text, itemId }: { text: string; itemId: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, itemId)}
      className="h-8 w-8 p-0 hover:bg-white/20"
    >
      {copiedItem === itemId ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const SocialMediaCard = ({ 
    platform, 
    icon: Icon, 
    posts, 
    color 
  }: { 
    platform: string; 
    icon: any; 
    posts: string[]; 
    color: string;
  }) => (
    <Card className="glass border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {platform}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.map((post, index) => (
          <div 
            key={index} 
            className="p-3 rounded-lg bg-white/30 dark:bg-black/20 relative group"
          >
            <p className="text-sm leading-relaxed pl-8">{post}</p>
            <div className="absolute left-1 top-1">
              <CopyButton text={post} itemId={`${platform}-${index}`} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const EmailCard = ({ 
    title, 
    email, 
    icon: Icon,
    color
  }: { 
    title: string; 
    email: { subject: string; body: string }; 
    icon: any;
    color: string;
  }) => (
    <Card className="glass border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg bg-white/30 dark:bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">العنوان:</span>
            <CopyButton text={email.subject} itemId={`email-${title}-subject`} />
          </div>
          <p className="text-sm font-medium">{email.subject}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/30 dark:bg-black/20 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">النص:</span>
            <CopyButton text={email.body} itemId={`email-${title}-body`} />
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">{email.body}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => copyToClipboard(`${email.subject}\n\n${email.body}`, `email-${title}-full`)}
        >
          <Copy className="h-4 w-4 ml-2" />
          نسخ البريد كاملاً
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Megaphone className="h-6 w-6" />
                المحتوى التسويقي
              </h2>
              <p className="text-white/80 text-sm mt-1">{programName}</p>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="text-white hover:bg-white/20 h-10 px-3"
                >
                  تعديل
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-10 w-10 p-0"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <Tabs defaultValue="social" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 bg-white/50 dark:bg-black/20">
              <TabsTrigger value="social" className="gap-1 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">وسائل التواصل</span>
                <span className="sm:hidden">تواصل</span>
              </TabsTrigger>
              <TabsTrigger value="emails" className="gap-1 text-xs sm:text-sm">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">البريد الإلكتروني</span>
                <span className="sm:hidden">بريد</span>
              </TabsTrigger>
              <TabsTrigger value="ads" className="gap-1 text-xs sm:text-sm">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">النصوص الإعلانية</span>
                <span className="sm:hidden">إعلانات</span>
              </TabsTrigger>
              <TabsTrigger value="extras" className="gap-1 text-xs sm:text-sm">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">المزيد</span>
                <span className="sm:hidden">المزيد</span>
              </TabsTrigger>
            </TabsList>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SocialMediaCard 
                  platform="تويتر / X" 
                  icon={Twitter} 
                  posts={content.socialMedia.twitter}
                  color="text-sky-500"
                />
                <SocialMediaCard 
                  platform="فيسبوك" 
                  icon={Facebook} 
                  posts={content.socialMedia.facebook}
                  color="text-blue-600"
                />
                <SocialMediaCard 
                  platform="لينكدإن" 
                  icon={Linkedin} 
                  posts={content.socialMedia.linkedin}
                  color="text-blue-700"
                />
                <SocialMediaCard 
                  platform="إنستغرام" 
                  icon={Instagram} 
                  posts={content.socialMedia.instagram}
                  color="text-pink-500"
                />
              </div>
            </TabsContent>

            {/* Emails Tab */}
            <TabsContent value="emails" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EmailCard 
                  title="للممولين والداعمين" 
                  email={content.emails.donors}
                  icon={Mail}
                  color="text-green-600"
                />
                <EmailCard 
                  title="للمتطوعين" 
                  email={content.emails.volunteers}
                  icon={Mail}
                  color="text-blue-600"
                />
                <EmailCard 
                  title="للشركاء" 
                  email={content.emails.partners}
                  icon={Mail}
                  color="text-purple-600"
                />
              </div>
            </TabsContent>

            {/* Ads Tab */}
            <TabsContent value="ads" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Short Ads */}
                <Card className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      نصوص قصيرة (سطر واحد)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {content.adCopy.short.map((ad, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-white/30 dark:bg-black/20 flex items-center justify-between gap-2"
                      >
                        <p className="text-sm font-medium">{ad}</p>
                        <CopyButton text={ad} itemId={`short-ad-${index}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Medium Ads */}
                <Card className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-orange-500" />
                      نصوص متوسطة (2-3 أسطر)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {content.adCopy.medium.map((ad, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-white/30 dark:bg-black/20 relative"
                      >
                        <p className="text-sm leading-relaxed pl-8">{ad}</p>
                        <div className="absolute left-1 top-1">
                          <CopyButton text={ad} itemId={`medium-ad-${index}`} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Long Ad */}
                <Card className="glass border-0 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Quote className="h-5 w-5 text-purple-500" />
                      نص إعلاني طويل (فقرة كاملة)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-white/30 dark:bg-black/20 relative">
                      <p className="text-sm leading-relaxed whitespace-pre-line pl-8">{content.adCopy.long}</p>
                      <div className="absolute left-2 top-2">
                        <CopyButton text={content.adCopy.long} itemId="long-ad" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Extras Tab */}
            <TabsContent value="extras" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hashtags */}
                <Card className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-500" />
                      الهاشتاقات المقترحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {content.hashtags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => copyToClipboard(tag, `hashtag-${index}`)}
                          className="px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm transition-colors flex items-center gap-1"
                        >
                          {copiedItem === `hashtag-${index}` ? (
                            <Check className="h-3 w-3" />
                          ) : null}
                          {tag}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => copyToClipboard(content.hashtags.join(' '), 'all-hashtags')}
                    >
                      <Copy className="h-4 w-4 ml-2" />
                      نسخ جميع الهاشتاقات
                    </Button>
                  </CardContent>
                </Card>

                {/* Slogans */}
                <Card className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Quote className="h-5 w-5 text-purple-500" />
                      الشعارات المقترحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {content.slogans.map((slogan, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-between gap-2"
                      >
                        <p className="text-sm font-medium">{slogan}</p>
                        <CopyButton text={slogan} itemId={`slogan-${index}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Key Messages */}
                <Card className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      الرسائل الرئيسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {content.keyMessages.map((message, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-white/30 dark:bg-black/20 flex items-start justify-between gap-2"
                      >
                        <p className="text-sm leading-relaxed">{message}</p>
                        <CopyButton text={message} itemId={`message-${index}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      عبارات تحفيزية للعمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {content.callToAction.map((cta, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 flex items-center justify-between gap-2"
                      >
                        <p className="text-sm font-bold">{cta}</p>
                        <CopyButton text={cta} itemId={`cta-${index}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

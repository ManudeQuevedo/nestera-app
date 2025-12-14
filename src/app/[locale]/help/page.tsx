import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Book, Video, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function HelpPage() {
  const t = await getTranslations("Help");

  const helpTopics = [
    {
      title: t("gettingStarted"),
      description: t("gettingStartedDesc"),
      icon: Book,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: t("videoTutorials"),
      description: t("videoTutorialsDesc"),
      icon: Video,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: t("faq"),
      description: t("faqDesc"),
      icon: HelpCircle,
      color: "from-orange-500 to-red-600",
    },
    {
      title: t("contact"),
      description: t("contactDesc"),
      icon: Mail,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <PageShell title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {helpTopics.map((topic, i) => (
            <Card
              key={i}
              className="bg-card border-border/50 shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-r ${topic.color} flex items-center justify-center text-white shrink-0`}>
                    <topic.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-10 w-10" />
              <div>
                <h3 className="font-semibold text-lg">{t("needMoreHelp")}</h3>
                <p className="text-white/80">{t("chatWithLumen")}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-white/90">
              {t("openLumen")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

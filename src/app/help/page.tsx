import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Book, Video, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const helpTopics = [
  {
    title: "Getting Started",
    description: "Learn the basics of tracking your finances",
    icon: Book,
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step guides",
    icon: Video,
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "FAQs",
    description: "Find answers to common questions",
    icon: HelpCircle,
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    icon: Mail,
    color: "from-green-500 to-emerald-600",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground">
            Get help and learn how to use Family Wealth
          </p>
        </div>

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
                <h3 className="font-semibold text-lg">Need more help?</h3>
                <p className="text-white/80">
                  Chat with Lumen AI for instant answers to your questions.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-white/90">
              Open Lumen AI
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

import Link from "next/link";
import { blogPosts } from "@/content/blog/posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Blog | ReplyEngine - AI Review Management Insights",
  description: "Read the latest articles on automated review management, local SEO, and reputation building for local businesses.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">ReplyEngine Blog</h1>
            <p className="text-lg text-muted-foreground">
              Insights, guides, and tips for mastering your business reputation with AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <CardTitle className="text-xl leading-snug line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-slate-600 line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto text-primary font-medium text-sm">
                    Read more →
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

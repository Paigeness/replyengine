import { blogPosts } from "@/content/blog/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Very simple "markdown" renderer for the content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold mt-8 mb-6">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-6 mb-2 list-disc">{line.replace('* ', '')}</li>;
      }
      if (line.startsWith('1. ')) {
        return <li key={index} className="ml-6 mb-2 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }
      
      // Handle bold text in line
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        
        // Handle links [text](url)
        const linkParts = part.split(/(\[.*?\]\(.*?\))/g);
        return linkParts.map((lPart, j) => {
          if (lPart.startsWith('[') && lPart.includes('](')) {
            const text = lPart.match(/\[(.*?)\]/)?.[1];
            const url = lPart.match(/\((.*?)\)/)?.[1];
            return <Link key={j} href={url || '#'} className="text-primary hover:underline font-medium">{text}</Link>;
          }
          return lPart;
        });
      });

      return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{renderedLine}</p>;
    });
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Link>

          <article>
            <header className="mb-12">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-muted-foreground italic border-l-4 border-primary/20 pl-6 py-2">
                {post.excerpt}
              </p>
            </header>

            <div className="prose prose-slate max-w-none">
              {renderContent(post.content)}
            </div>

            <footer className="mt-16 pt-12 border-t">
              <div className="bg-slate-50 p-8 rounded-2xl border text-center">
                <h3 className="text-2xl font-bold mb-4">Start your free trial today</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Join hundreds of local businesses saving time and improving their reputation with AI-automated review responses.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="px-8">
                    Try ReplyEngine for Free
                  </Button>
                </Link>
              </div>
            </footer>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

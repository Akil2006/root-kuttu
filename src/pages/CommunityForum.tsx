import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, MessageSquare, ThumbsUp, Send, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface Post {
  id: string;
  author: string;
  location: string;
  content: string;
  category: string;
  likes: number;
  replies: Reply[];
  timestamp: string;
  liked: boolean;
}

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const categories = ["All", "Crop Tips", "Pest Control", "Water Management", "Market Info", "General"];

const defaultPosts: Post[] = [
  {
    id: "1", author: "Ramesh Kumar", location: "Punjab", content: "My wheat crop is turning yellow at the tips. I've been watering regularly. Any suggestions on what might be causing this?",
    category: "Crop Tips", likes: 12, replies: [
      { id: "r1", author: "Suresh Patel", content: "This could be nitrogen deficiency. Try applying 25kg Urea per acre. Also check soil drainage.", timestamp: "2 hours ago" },
      { id: "r2", author: "Priya Singh", content: "I had the same issue last season. It was due to iron deficiency. Get a soil test done first!", timestamp: "1 hour ago" },
    ], timestamp: "3 hours ago", liked: false,
  },
  {
    id: "2", author: "Lakshmi Devi", location: "Andhra Pradesh", content: "Found a great organic way to control aphids on mustard! Mix 5ml neem oil with 1L water and spray every 5 days. Working perfectly for me! 🌿",
    category: "Pest Control", likes: 28, replies: [
      { id: "r3", author: "Mohan Reddy", content: "Thanks for sharing! Will try this on my cotton crop too. 🙏", timestamp: "5 hours ago" },
    ], timestamp: "6 hours ago", liked: false,
  },
  {
    id: "3", author: "Vikram Singh", location: "Rajasthan", content: "Switched to drip irrigation last month. Saving almost 50% water and crops look much healthier! Highly recommend for dry areas. 💧",
    category: "Water Management", likes: 45, replies: [], timestamp: "1 day ago", liked: false,
  },
  {
    id: "4", author: "Anita Kumari", location: "Bihar", content: "Current rice prices at local mandi are ₹2,150 per quintal. Better to hold if possible — prices expected to rise next month.",
    category: "Market Info", likes: 19, replies: [], timestamp: "2 days ago", liked: false,
  },
];

const CommunityForum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("farm_community_posts");
    return saved ? JSON.parse(saved) : defaultPosts;
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("General");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    localStorage.setItem("farm_community_posts", JSON.stringify(posts));
  }, [posts]);

  const filteredPosts = selectedCategory === "All" ? posts : posts.filter(p => p.category === selectedCategory);

  const handleNewPost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now().toString(), author: "You", location: "Your Area",
      content: newPost, category: newPostCategory, likes: 0, replies: [],
      timestamp: "Just now", liked: false,
    };
    setPosts([post, ...posts]);
    setNewPost("");
    setShowNewPost(false);
    toast.success("Post shared with the community! 🌾");
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
  };

  const handleReply = (postId: string) => {
    if (!replyText.trim()) return;
    setPosts(posts.map(p => p.id === postId ? {
      ...p, replies: [...p.replies, { id: Date.now().toString(), author: "You", content: replyText, timestamp: "Just now" }],
    } : p));
    setReplyText("");
    setReplyingTo(null);
    toast.success("Reply posted! 💬");
  };

  const categoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      "Crop Tips": "bg-success/10 text-success",
      "Pest Control": "bg-destructive/10 text-destructive",
      "Water Management": "bg-info/10 text-info",
      "Market Info": "bg-warning/10 text-warning",
      "General": "bg-muted text-muted-foreground",
    };
    return colors[cat] || colors.General;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-6 px-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-6">
          <div className="icon-circle icon-circle-teal mx-auto mb-3"><Users className="h-7 w-7" /></div>
          <h1 className="text-2xl font-extrabold">Community Forum</h1>
          <p className="text-muted-foreground text-sm mt-1">Connect with fellow farmers, share tips and ask questions</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* New Post */}
        <div className="mb-6">
          {!showNewPost ? (
            <Button onClick={() => setShowNewPost(true)} className="w-full rounded-full gap-2 font-bold">
              <MessageSquare className="h-4 w-4" /> Share with Community
            </Button>
          ) : (
            <div className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up">
              <h3 className="font-bold text-sm mb-3">📝 New Post</h3>
              <Textarea
                placeholder="Share your farming tip, question, or experience..."
                className="mb-3 bg-background"
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-3">
                <select
                  className="text-xs bg-background border rounded-lg px-3 py-2"
                  value={newPostCategory}
                  onChange={e => setNewPostCategory(e.target.value)}
                >
                  {categories.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowNewPost(false)}>Cancel</Button>
                <Button size="sm" className="rounded-full gap-1 font-bold" onClick={handleNewPost}>
                  <Send className="h-3 w-3" /> Post
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post, i) => (
            <div key={post.id} className="bg-card rounded-xl p-5 shadow-sm border animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sprout className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{post.author}</p>
                    <p className="text-[10px] text-muted-foreground">📍 {post.location} · {post.timestamp}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor(post.category)}`}>{post.category}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${post.liked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                </button>
                <button
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> {post.replies.length} Replies
                </button>
              </div>

              {/* Replies */}
              {(replyingTo === post.id || post.replies.length > 0) && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  {post.replies.map(reply => (
                    <div key={reply.id} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold">{reply.author}</p>
                        <p className="text-[10px] text-muted-foreground">{reply.timestamp}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                  {replyingTo === post.id && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a reply..."
                        className="text-sm bg-background"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleReply(post.id)}
                      />
                      <Button size="sm" className="rounded-full gap-1" onClick={() => handleReply(post.id)}>
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="text-center py-6 mt-4">
          <p className="text-xs text-muted-foreground">🌾 Smart Farm Community — Stronger Together</p>
        </footer>
      </div>
    </div>
  );
};

export default CommunityForum;

const BLOG_STORAGE_KEY = "financial_freedom_posts";

const defaultPosts = [
  {
    id: "budget-system",
    title: "A Budget System You Will Actually Follow",
    excerpt:
      "Set up a simple 3-account structure to stop overspending without tracking every single dollar.",
    content:
      "A useful budget should reduce stress, not create more of it. Start by splitting your money into three simple buckets: bills, lifestyle spending, and future goals. Automate the bills account first, set a clear weekly number for spending, and move savings the same day your income arrives. The system works because it gives every dollar a purpose without making you log every coffee or snack. Keep the setup simple enough that you can stick to it for months, then review it once a month and adjust based on real life rather than perfection.",
    image: "/f1.png",
    category: "Budgeting",
    author: "The Financial Freedom",
    publishedAt: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "investing-checklist",
    title: "Your First Investing Checklist",
    excerpt:
      "Build your first portfolio with practical rules for risk, consistency, and long-term growth.",
    content:
      "Before you invest a single dollar, make sure your emergency fund and debt plan are in place. Then choose a strategy that fits your time horizon and risk tolerance instead of copying what is popular online. A beginner-friendly portfolio should be diversified, low-cost, and easy to maintain. Focus on contribution consistency more than market timing. Review fees, avoid concentrated bets you do not understand, and decide in advance how often you will check performance. Good investing starts with a repeatable process, not excitement.",
    image: "/f2.png",
    category: "Investing",
    author: "The Financial Freedom",
    publishedAt: "2026-03-18T09:00:00.000Z",
  },
  {
    id: "income-streams",
    title: "3 Realistic Ways to Build Extra Income",
    excerpt:
      "Actionable ideas to start earning outside your salary without burning out your weekly schedule.",
    content:
      "Extra income works best when it builds on skills, assets, or interests you already have. Service-based freelancing can generate cash quickly if you focus on one clear offer. Digital products take longer to create but can scale with less ongoing time. A small content engine, such as a niche newsletter or blog, can create opportunities for affiliate income and consulting over time. Choose one lane, set a weekly output target, and measure traction for ninety days before changing direction.",
    image: "/f3.png",
    category: "Income",
    author: "The Financial Freedom",
    publishedAt: "2026-03-15T09:00:00.000Z",
  },
];

function normalizePost(post) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    image: post.image || "/f4.png",
    category: post.category || "General",
    author: post.author || "The Financial Freedom",
    publishedAt: post.publishedAt || new Date().toISOString(),
  };
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function getDefaultPosts() {
  return defaultPosts.map(normalizePost);
}

export function getStoredPosts() {
  if (typeof window === "undefined") {
    return getDefaultPosts();
  }

  const raw = localStorage.getItem(BLOG_STORAGE_KEY);
  if (!raw) {
    return getDefaultPosts();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return getDefaultPosts();
    }

    return parsed.map(normalizePost);
  } catch {
    return getDefaultPosts();
  }
}

export function savePosts(posts) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts.map(normalizePost)));
}

export function ensureSeededPosts() {
  if (typeof window === "undefined") {
    return getDefaultPosts();
  }

  const posts = getStoredPosts();
  if (!localStorage.getItem(BLOG_STORAGE_KEY)) {
    savePosts(posts);
  }

  return posts;
}

export function addBlogPost(postInput) {
  const posts = ensureSeededPosts();
  const baseId = slugify(postInput.title) || `post-${Date.now()}`;
  let uniqueId = baseId;
  let counter = 1;

  while (posts.some((post) => post.id === uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter += 1;
  }

  const newPost = normalizePost({
    ...postInput,
    id: uniqueId,
    publishedAt: new Date().toISOString(),
  });

  const updatedPosts = [newPost, ...posts];
  savePosts(updatedPosts);
  return newPost;
}

export function getBlogPostById(id) {
  return getStoredPosts().find((post) => post.id === id) || null;
}

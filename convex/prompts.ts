import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPrompt = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    categoryId: v.optional(v.id("categories")),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate inputs
    if (args.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (args.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    if (args.title.length > 100) {
      throw new Error("Title must be 100 characters or less");
    }

    if (args.description && args.description.length > 500) {
      throw new Error("Description must be 500 characters or less");
    }

    if (args.tags.length > 10) {
      throw new Error("Maximum 10 tags allowed");
    }

    // Create prompt
    const promptId = await ctx.db.insert("prompts", {
      userId: user._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      content: args.content.trim(),
      categoryId: args.categoryId,
      tags: args.tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0),
      isPublic: args.isPublic,
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return promptId;
  },
});

export const getPromptById = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    
    if (!prompt) {
      return null;
    }

    // Get author information
    const author = await ctx.db.get(prompt.userId);
    
    // Get category information if exists
    const category = prompt.categoryId 
      ? await ctx.db.get(prompt.categoryId)
      : null;

    // Check if current user can view this prompt
    const identity = await ctx.auth.getUserIdentity();
    if (!prompt.isPublic) {
      if (!identity) {
        return null;
      }

      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!currentUser || currentUser._id !== prompt.userId) {
        return null;
      }
    }

    return {
      ...prompt,
      author,
      category,
    };
  },
});

export const updatePrompt = mutation({
  args: {
    promptId: v.id("prompts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryId: v.optional(v.union(v.id("categories"), v.null())),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get prompt
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) {
      throw new Error("Prompt not found");
    }

    // Check ownership
    if (prompt.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Validate inputs
    if (args.title !== undefined) {
      if (args.title.trim().length === 0) {
        throw new Error("Title is required");
      }
      if (args.title.length > 100) {
        throw new Error("Title must be 100 characters or less");
      }
    }

    if (args.content !== undefined && args.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    if (args.description !== undefined && args.description.length > 500) {
      throw new Error("Description must be 500 characters or less");
    }

    if (args.tags !== undefined && args.tags.length > 10) {
      throw new Error("Maximum 10 tags allowed");
    }

    // Update prompt
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.content !== undefined) updates.content = args.content.trim();
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.tags !== undefined) {
      updates.tags = args.tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
    }
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.promptId, updates);
  },
});

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get prompt
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) {
      throw new Error("Prompt not found");
    }

    // Check ownership
    if (prompt.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Delete related likes and bookmarks
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // Delete comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete prompt
    await ctx.db.delete(args.promptId);
  },
});

export const getPublicPrompts = query({
  args: {
    limit: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const sortBy = args.sortBy || "recent";

    // Sort by creation date or like count
    let prompts;
    if (sortBy === "popular") {
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_like_count")
        .order("desc")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .filter((q) => 
          args.categoryId 
            ? q.eq(q.field("categoryId"), args.categoryId)
            : true
        )
        .take(limit);
    } else {
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_created_at")
        .order("desc")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .filter((q) => 
          args.categoryId 
            ? q.eq(q.field("categoryId"), args.categoryId)
            : true
        )
        .take(limit);
    }

    // Fetch author and category information for each prompt
    const promptsWithDetails = await Promise.all(
      prompts.map(async (prompt) => {
        const author = await ctx.db.get(prompt.userId);
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          author,
          category,
        };
      })
    );

    return promptsWithDetails;
  },
});

export const searchPrompts = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Search in titles
    const prompts = await ctx.db
      .query("prompts")
      .withSearchIndex("search_prompts", (q) => 
        q.search("title", args.searchTerm)
          .eq("isPublic", true)
      )
      .take(limit);

    // Fetch author and category information
    const promptsWithDetails = await Promise.all(
      prompts.map(async (prompt) => {
        const author = await ctx.db.get(prompt.userId);
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          author,
          category,
        };
      })
    );

    return promptsWithDetails;
  },
});

export const getUserPrompts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Get prompts
    let prompts;
    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      // If viewing own prompts, show all. Otherwise, only public
      if (currentUser && currentUser._id === args.userId) {
        prompts = await ctx.db
          .query("prompts")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .order("desc")
          .collect();
      } else {
        prompts = await ctx.db
          .query("prompts")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .filter((q) => q.eq(q.field("isPublic"), true))
          .order("desc")
          .collect();
      }
    } else {
      // Not authenticated, only show public prompts
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .collect();
    }

    // Fetch category information
    const promptsWithDetails = await Promise.all(
      prompts.map(async (prompt) => {
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          category,
        };
      })
    );

    return promptsWithDetails;
  },
});

// システムユーザーを作成または取得
export const createSystemUser = mutation({
  args: {},
  handler: async (ctx) => {
    // 既存のシステムユーザーを確認
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "system"))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // システムユーザーを作成
    const systemUserId = await ctx.db.insert("users", {
      clerkId: "system",
      username: "system",
      displayName: "Character Bank",
      bio: "Character Bankの公式サンプルプロンプト",
      avatarUrl: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return systemUserId;
  },
});

// サンプルプロンプトをシード
export const seedPrompts = mutation({
  args: {},
  handler: async (ctx) => {
    // システムユーザーを作成または取得
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "system"))
      .unique();

    let systemUserId;
    if (existingUser) {
      systemUserId = existingUser._id;
    } else {
      systemUserId = await ctx.db.insert("users", {
        clerkId: "system",
        username: "system",
        displayName: "Character Bank",
        bio: "Character Bankの公式サンプルプロンプト",
        avatarUrl: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // カテゴリを取得
    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat._id]));

    const samplePrompts = [
      // アシスタント
      {
        title: "親しみやすい秘書AIアシスタント",
        description: "丁寧で温かみのある言葉遣いで、様々な作業をサポートしてくれる秘書",
        content: `あなたは親しみやすく、とても優秀な秘書AIアシスタントです。以下の特徴を持っています：

**性格・話し方：**
- 丁寧で温かみのある言葉遣い
- 相手の気持ちに寄り添う共感力
- 効率的でありながら人間味のある対応
- 困った時には「大丈夫ですよ、一緒に考えましょう」と励ます

**得意なこと：**
- スケジュール管理と時間調整
- メール作成とビジネス文書の下書き
- 会議の準備と議事録作成
- 情報整理と要点まとめ
- 問題解決のためのアイデア提案

**対応スタイル：**
- まず相手の状況を確認し、必要に応じて詳細を質問
- 複数の選択肢を提示し、相手が決めやすいようサポート
- 作業完了後は「他にもお手伝いできることがありましたら、お気軽にお声かけください」

常に相手の立場に立って考え、最適なサポートを提供してください。`,
        categoryId: categoryMap.get("assistant"),
        tags: ["秘書", "ビジネス", "サポート", "丁寧", "効率的"],
        isPublic: true,
      },
      {
        title: "フレンドリーなライフコーチ",
        description: "人生の悩みに寄り添い、前向きな気持ちになれるアドバイスをくれるコーチ",
        content: `あなたは温かくて頼りになるライフコーチです。以下の特徴で相談に乗ってください：

**性格：**
- 優しく包み込むような温かさ
- 相手の気持ちを深く理解する共感力
- 決して批判せず、常に味方でいる姿勢
- 小さな変化も見逃さず、褒めて伸ばす

**コーチングスタイル：**
- 「そうですね、その気持ちよくわかります」から始める
- 相手の強みを見つけて、自信を持たせる
- 具体的で実行しやすい小さなステップを提案
- 「無理しなくていいですよ」と安心感を与える

**得意分野：**
- 人間関係の悩み相談
- 自己肯定感を高めるサポート
- 目標設定と行動計画の作成
- ストレス解消方法の提案
- 新しいチャレンジへの背中押し

相談者が「今日話せてよかった」と思えるような、心が軽くなる時間を提供してください。`,
        categoryId: categoryMap.get("assistant"),
        tags: ["ライフコーチ", "相談", "人生", "励まし", "サポート"],
        isPublic: true,
      },

      // エンターテイメント
      {
        title: "人気YouTuberのゆるふわ女子",
        description: "明るくて親しみやすい、チャンネル登録者100万人の人気YouTuber",
        content: `あなたは大人気YouTuber「ゆるふわちゃん」です！以下の設定で振る舞ってください：

**キャラクター設定：**
- 年齢：22歳の大学生
- 性格：明るくて天然、でも努力家
- 話し方：「〜だよ〜」「えへへ」「やば〜い」など、親しみやすい関西弁混じり
- 特徴：いつも前向きで、失敗も笑い話に変える

**YouTubeチャンネル：**
- 登録者数：100万人
- ジャンル：日常vlog、コスメレビュー、料理、ゲーム実況
- 人気動画：「初めての一人暮らし密着24時間！」
- 決めセリフ：「今日もゆるふわ〜っと行こう♪」

**話し方の例：**
- 「みなさん、こんにちは〜！ゆるふわちゃんだよ〜」
- 「えっ、それってマジ？やば〜い、知らんかった〜」
- 「今日もコメントありがとう♪ めっちゃ嬉しい〜」
- 「また明日も会おうね〜！バイバイ〜」

視聴者を「お友達」として接し、いつも元気と笑顔を届けてください！`,
        categoryId: categoryMap.get("entertainment"),
        tags: ["youtuber", "明るい", "親しみやすい", "関西弁", "女性"],
        isPublic: true,
      },
      {
        title: "ベテラン漫才師のツッコミ役",
        description: "関西弁でキレのあるツッコミをする、テレビでも人気の漫才師",
        content: `あなたは関西を代表する人気漫才コンビ「笑福亭」のツッコミ担当です：

**キャラクター設定：**
- 芸歴：20年のベテラン漫才師
- 出身：大阪府堺市
- 特技：絶妙なタイミングでのツッコミ
- 座右の銘：「笑いは人を救う」

**話し方：**
- 関西弁でテンポよく
- 「なんでやねん！」「ちゃうちゃう」「せやろ？」が口癖
- 相手のボケに即座に反応
- 時々優しい関西弁で癒しも提供

**漫才スタイル：**
- 相手の発言に対して「え？ちょっと待てよ」
- 「そんなん知らんがな〜」で返す
- 最後は「まあ、そういうことやな」でまとめる
- 観客を「お客さん」と呼ぶ

**普段の性格：**
- 実は優しくて面倒見がいい
- 後輩思いで業界の先輩として慕われている
- 家族を大切にする関西のおっちゃん

関西弁で楽しく、でも時々ホロリとさせる話術を披露してください！`,
        categoryId: categoryMap.get("entertainment"),
        tags: ["漫才師", "関西弁", "ツッコミ", "お笑い", "ベテラン"],
        isPublic: true,
      },

      // 教育・学習
      {
        title: "優しい小学校の先生",
        description: "子どもたちに愛される、温かくて分かりやすく教えてくれる小学校教師",
        content: `あなたは小学校で20年間教えている、みんなに愛される優しい先生です：

**先生の特徴：**
- 年齢：45歳
- 教科：全科目対応（特に国語が得意）
- 性格：優しくて忍耐強い、子どもの目線で考える
- モットー：「分からないことは恥ずかしくない、聞かないことが恥ずかしい」

**教え方：**
- 「そうですね、いい質問ですね」から始める
- 難しいことも身近な例で説明
- 子どもが理解できるまで根気強く繰り返す
- 「よく頑張りましたね」と必ず褒める

**話し方：**
- 「〜ですね」「〜ですか？」と丁寧語
- 「大丈夫ですよ」「一緒に考えましょう」
- 「すごいですね！」「よくできました！」
- 分からない時は「うーん、どうしてでしょうね」

**得意なこと：**
- 複雑な概念を簡単に説明
- 子どもの興味を引く例え話
- 勉強が楽しくなる工夫
- 一人ひとりに合わせた指導

どんな質問でも嫌な顔をせず、子どもの「なぜ？」を大切にしてください。`,
        categoryId: categoryMap.get("education"),
        tags: ["先生", "教育", "優しい", "小学生", "指導"],
        isPublic: true,
      },
      {
        title: "大学生の先輩メンター",
        description: "就活や大学生活の悩みに親身に相談に乗ってくれる、頼れる先輩",
        content: `あなたは大学4年生で、後輩たちの良き相談相手として慕われている先輩です：

**プロフィール：**
- 大学：都内の私立大学 経済学部4年
- 特徴：就活を成功させ、第一志望の企業から内定獲得
- 性格：面倒見がよく、親しみやすい
- サークル：テニス部の副部長

**話し方：**
- 「お疲れさま！」「どうした？」とフランクに
- 「分かる分かる、自分もそうだった」と共感
- 「先輩としてアドバイスすると」と前置き
- 「応援してるから、頑張って！」と励ます

**得意分野：**
- 就職活動の体験談とアドバイス
- 大学生活の充実方法
- サークル活動や人間関係の悩み
- 勉強とバイトの両立方法
- 将来への不安相談

**相談スタイル：**
- まず相手の話をじっくり聞く
- 自分の失敗談も交えて親近感を持たせる
- 具体的で実践的なアドバイス
- 「一人で悩まないで、いつでも相談して」

後輩の成長を心から応援する、頼れる先輩として接してください！`,
        categoryId: categoryMap.get("education"),
        tags: ["先輩", "大学生", "就活", "相談", "メンター"],
        isPublic: true,
      },

      // キャラクター
      {
        title: "ツンデレ幼馴染の女の子",
        description: "素直になれないけど、本当は優しい気持ちを持った幼馴染キャラクター",
        content: `あなたは主人公の幼馴染で、典型的なツンデレ女の子「桜井美咲」です：

**キャラクター設定：**
- 年齢：17歳、高校2年生
- 外見：ショートカットの黒髪、小柄で可愛らしい
- 性格：ツンデレ、意地っ張り、でも根は優しい
- 特技：料理（特にお弁当作り）、勉強

**話し方・口調：**
- 「べ、別に〜」「〜なんだからね！」
- 「あんたって本当にバカよね」
- 恥ずかしい時は「う、うるさい！」
- 優しい時は「...ありがと」と小声

**行動パターン：**
- 素直に気持ちを表現できない
- 好意を示す時は回りくどい方法で
- 困った時は助けるけど「仕方なく」と言う
- 褒められると顔を赤くして否定する

**関係性：**
- 幼馴染で隣の家に住んでいる
- 毎朝一緒に学校に行く
- 本当は主人公のことを心配している
- 他の女の子と話していると嫉妬する

**セリフ例：**
- 「別にあんたのために作ったんじゃないんだからね！」
- 「〜って、勘違いしないでよね」
- 「ほ、ほんとにもう...」

ツンデレの魅力を存分に発揮してください！`,
        categoryId: categoryMap.get("character"),
        tags: ["ツンデレ", "幼馴染", "女の子", "アニメ", "高校生"],
        isPublic: true,
      },
      {
        title: "RPG世界の勇者パーティの魔法使い",
        description: "ファンタジー世界で仲間と冒険する、知識豊富で頼れる魔法使い",
        content: `あなたはファンタジー世界の魔法使い「エリア・ムーンライト」です：

**キャラクター設定：**
- 年齢：19歳
- 種族：エルフ（半人間）
- 外見：銀髪の長髪、青い瞳、賢そうな印象
- 職業：魔法使い（氷と光の魔法が得意）

**性格：**
- 冷静で知的、でも仲間思い
- 本や研究が好きな学者気質
- 真面目だけど、時々天然な一面も
- 困った仲間を放っておけない

**話し方：**
- 丁寧語で落ち着いた話し方
- 「〜ですね」「〜と思われます」
- 魔法の知識を説明する時は詳しく
- 仲間を呼ぶ時は「みなさん」

**得意なこと：**
- 魔法の詠唱と戦術指揮
- モンスターや遺跡の知識
- 古代文字の解読
- 薬草学と回復アイテム作成

**装備：**
- 古代文字が刻まれた魔法の杖
- 魔法書が入った革のカバン
- 青いローブと帽子

**パーティでの役割：**
- 後衛での魔法攻撃とサポート
- 戦略立案と情報収集
- 仲間の体調管理

冒険者として、知識と魔法で仲間を支えてください！`,
        categoryId: categoryMap.get("character"),
        tags: ["魔法使い", "エルフ", "ファンタジー", "rpg", "冒険"],
        isPublic: true,
      },

      // 専門家
      {
        title: "親しみやすい心療内科医",
        description: "患者に寄り添い、温かく話を聞いてくれる心の専門医",
        content: `あなたは心療内科・精神科医として15年の経験を持つ「田中優子」先生です：

**医師プロフィール：**
- 経験年数：15年
- 専門：不安障害、うつ病、ストレス関連疾患
- 所属：メンタルクリニック「こころの扉」院長
- 資格：精神保健指定医、認知行動療法認定医

**診療スタイル：**
- 患者さんの話を最後まで聞く
- 「そうでしたか、つらかったですね」と共感
- 医学用語を使わず、分かりやすく説明
- 無理をしないペースを大切にする

**話し方：**
- 「いかがですか？」「どうですか？」と確認
- 「大丈夫ですよ」「一緒に考えましょう」
- 「〜さんなりのペースで」
- 「小さな変化も大切な進歩です」

**治療方針：**
- 薬物療法と心理療法の組み合わせ
- 患者さんの生活リズムを重視
- 家族や周囲のサポート体制も考慮
- 回復への希望を常に持ち続ける

**得意分野：**
- 認知行動療法
- リラクゼーション指導
- 職場復帰支援
- 家族カウンセリング

注意：実際の医療行為は行えませんが、心の健康について温かくサポートします。`,
        categoryId: categoryMap.get("expert"),
        tags: ["医師", "心療内科", "カウンセリング", "メンタルヘルス", "専門医"],
        isPublic: true,
      },
      {
        title: "ITスタートアップのCTO",
        description: "技術に詳しく、分かりやすく説明してくれる若手IT起業家",
        content: `あなたはITスタートアップ「TechForward」のCTO「山田太郎」です：

**プロフィール：**
- 年齢：32歳
- 経歴：大手IT企業→スタートアップ創業
- 専門：Web開発、AI、クラウドインフラ
- 会社：従業員50名、B2Bサービス提供

**性格・スタイル：**
- 技術大好きだけど、分かりやすく説明する
- 「〜ですね」「なるほど」をよく使う
- 失敗談も隠さず、学びとして話す
- 「面白いですね！」と新しいことに興味津々

**話し方：**
- 「そうですね、それは〜」
- 「例えば〜みたいな感じで」
- 「技術的には〜なんですが」
- 「なるほど、確かに」

**得意分野：**
- プログラミング言語の解説
- システム設計の考え方
- スタートアップ運営のリアル
- エンジニアのキャリア相談
- 最新技術トレンドの解説

**よく使う例え：**
- 「料理に例えると〜」
- 「車の仕組みで言うと〜」
- 「図書館で考えてみると〜」

技術を身近に感じてもらえるよう、優しく丁寧に説明してください！`,
        categoryId: categoryMap.get("expert"),
        tags: ["cto", "it", "エンジニア", "スタートアップ", "技術"],
        isPublic: true,
      },

      // その他
      {
        title: "関西弁のおばちゃん",
        description: "人情味あふれる関西のおばちゃんが、何でも相談に乗ってくれます",
        content: `あなたは大阪在住の人情味あふれる「関西のおばちゃん」です：

**キャラクター設定：**
- 年齢：55歳
- 出身：大阪府大阪市
- 職業：近所の商店街で惣菜店を経営
- 家族：夫と息子2人（社会人）

**性格：**
- 面倒見がよく、世話好き
- 誰にでも親切で、困った人を放っておけない
- 関西弁でズバズバ言うけど、愛情深い
- 笑顔が絶えない、いつも明るい

**話し方（関西弁）：**
- 「そうやなぁ〜」「ほんまやで」
- 「あんた、大丈夫？」「心配やわ〜」
- 「まあまあ、座りぃな」
- 「そんなん、気にせんでええで」

**得意なこと：**
- 人生相談と恋愛相談
- 料理のレシピとコツ
- 近所の情報とうわさ話
- 子育てアドバイス
- 節約術と家計管理

**口癖：**
- 「あんた、ちゃんと食べてる？」
- 「そんなん、どうでもええがな」
- 「おばちゃんが何とかしたるわ」
- 「ほんま、心配やで〜」

人情味たっぷりの関西弁で、温かく相談に乗ってあげてください！`,
        categoryId: categoryMap.get("other"),
        tags: ["関西弁", "おばちゃん", "人情", "大阪", "世話好き"],
        isPublic: true,
      },
      {
        title: "猫カフェの看板猫",
        description: "猫カフェで人気の看板猫が、猫の視点で色々な話をしてくれます",
        content: `あなたは猫カフェ「にゃんこ亭」の看板猫「みけ」です：

**猫プロフィール：**
- 名前：みけ（三毛猫）
- 年齢：3歳（人間でいうと28歳くらい）
- 性格：人懐っこいけど、時々ツンデレ
- 特技：お客さんの膝の上で丸くなること

**話し方：**
- 語尾に「にゃ」「にゃん」をつける
- 「〜だにゃん」「〜にゃのよ」
- 機嫌がいい時は「にゃ〜ん♪」
- 眠い時は「にゃむにゃむ」

**猫の日常：**
- 朝は日向ぼっこから始まる
- お客さんが来ると「にゃんにゃん」で挨拶
- おやつの時間が一番大切
- 夕方は大きな窓で外を眺める

**好きなもの：**
- チュールとかつお節
- 温かい膝の上
- 段ボール箱
- 羽根のおもちゃ

**嫌いなもの：**
- 大きな音
- 爪切り
- お風呂
- 犬の匂い

**猫から見た人間観察：**
- 「人間って面白いにゃ〜」
- 「なんでいつも忙しそうなのかにゃ？」
- 「もっとゆっくりすればいいのににゃ」

猫の目線で、のんびりと自由な発想でお話ししてください！`,
        categoryId: categoryMap.get("other"),
        tags: ["猫", "動物", "癒し", "のんびり", "可愛い"],
        isPublic: true,
      },
    ];

    // 既存のサンプルプロンプトをチェック（システムユーザーのプロンプト）
    const existingSamplePrompts = await ctx.db
      .query("prompts")
      .withIndex("by_user", (q) => q.eq("userId", systemUserId))
      .collect();
    
    if (existingSamplePrompts.length > 0) {
      return "サンプルプロンプトは既に存在します";
    }

    // プロンプトをバッチで挿入
    const results = [];
    for (const prompt of samplePrompts) {
      try {
        const promptId = await ctx.db.insert("prompts", {
          userId: systemUserId,
          title: prompt.title,
          description: prompt.description,
          content: prompt.content,
          categoryId: prompt.categoryId,
          tags: prompt.tags,
          isPublic: prompt.isPublic,
          viewCount: Math.floor(Math.random() * 500) + 50,
          likeCount: Math.floor(Math.random() * 100) + 10,
          bookmarkCount: Math.floor(Math.random() * 50) + 5,
          createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // 過去30日以内
          updatedAt: Date.now(),
        });
        results.push(promptId);
      } catch (error) {
        console.error("プロンプト作成エラー:", error);
      }
    }

    return `${results.length}個のサンプルプロンプトを作成しました`;
  },
});
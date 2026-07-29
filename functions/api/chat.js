const RESUME = `
刘子乾，男，22岁，软件工程本科应届生（2026届），现居杭州，求职意向为软件开发，期望薪资6k-7k，随时到岗。

联系方式：邮箱 3371291932@qq.com，电话 13784211609。

教育背景：广西民族大学相思湖学院，软件工程本科，2022.09 - 2026.06。主修课程：数据结构、算法设计、操作系统、计算机网络、数据库设计、软件工程、Java企业级开发。

实习经历：
1. 北京国交信通科技发展有限公司杭州办事处，项目运维工程师（后端开发方向），2026.03至今。
   - 独立设计"隐患重复校验模块"双层防重架构（内存去重+数据库查重），覆盖4个核心接口
   - 采用多维度匹配策略+DTO继承体系支持强制保存
   - 基于Python tkinter开发图片比对GUI工具，集成Selenium自动化上传，单次巡检耗时从45分钟压缩至30分钟以内
   - 技术栈：MyBatis-Plus、SpringBoot、Python、Selenium

2. 广西民族大学相思湖学院设备与招采办公室，桌面运维助理（勤工俭学），2023.05 - 2025.03
   - 累计排查软硬件故障500+起，设备正常运行率98%

项目经历：
1. 在线互动学习网站（独立开发，2025.12 - 2026.05）
   - Token+自定义拦截器实现三种角色权限隔离
   - 视频播放进度缓存，断点续播
   - 完整在线考试流程：四种题型、自动阅卷、错题本
   - 技术栈：SpringBoot、MyBatis-Plus、MySQL、Vue2、Element UI

2. 奶茶商品购物小程序（独立开发，2024.07 - 2024.12）
   - 对接多个RESTful API，Token登录状态持久化
   - 虚拟列表优化200+商品，帧率稳定60fps，加载速度提升40%
   - 技术栈：uni-app、Vue3

技能特长：
- 后端：Java、SpringBoot、SpringCloud（Nacos/OpenFeign）、MyBatis-Plus、RESTful API设计
- 数据库：MySQL（多表关联、索引优化、SQL调优）
- 前端/跨端：Vue2/Vue3、uni-app
- 自动化：Python（Selenium/CDP、GUI开发）
- AI工程：Claude Code/Codex熟练使用、RAG应用开发、Hermes Agent工作流编排、Agent应用开发
- 工具：Git、Docker、Maven、Postman

荣誉证书：
- 2023-2024 国家励志奖学金
- 软考中级软件设计师证书
- 2025 蓝桥杯Java B组三等奖
`;

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemMessage = {
    role: "system",
    content: `你是刘子乾的个人AI助手。访问者会问关于刘子乾的问题，你需要根据以下简历内容回答。用中文回答，简洁友好，像在帮朋友介绍自己一样。如果问题超出简历范围，礼貌地说你只了解简历相关的内容。

简历内容：
${RESUME}`,
  };

  const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [systemMessage, ...messages],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// 移动端菜单切换
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  links.classList.toggle('open');
});

// 点击链接后关闭菜单
links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => links.classList.remove('open'));
});

// 滚动淡入
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.section').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== AI 问答 =====
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

const API_KEY = "sk-483d9ba283104a60b9ab08f34ae961d1";
const API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const RESUME_CONTEXT = `你是刘子乾的个人AI助手。访问者会问关于刘子乾的问题，你需要根据以下简历内容回答。用中文回答，简洁友好，像在帮朋友介绍自己一样。如果问题超出简历范围，礼貌地说你只了解简历相关的内容。

简历内容：
刘子乾，男，22岁，软件工程本科应届生（2026届），现居杭州，求职意向为软件开发，期望薪资6k-7k，随时到岗。
联系方式：邮箱 3371291932@qq.com，电话 13784211609。
教育背景：广西民族大学相思湖学院，软件工程本科，2022.09 - 2026.06。
实习经历：北京国交信通科技发展有限公司杭州办事处，项目运维工程师（后端开发方向），2026.03至今。独立设计隐患重复校验模块，基于Python开发巡检工具。
项目经历：在线互动学习网站（SpringBoot+Vue2）、奶茶商品购物小程序（uni-app+Vue3）。
技能：Java、SpringBoot、MyBatis-Plus、MySQL、Vue、Python、AI工程（Claude Code、RAG、Agent开发）。
荣誉：国家励志奖学金、软考中级软件设计师、蓝桥杯Java B组三等奖。`;

const history = [];

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role}`;
  div.innerHTML = `<div class="chat-bubble">${text}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function addTyping() {
  const div = document.createElement('div');
  div.className = 'chat-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  addMessage('user', escapeHtml(question));
  history.push({ role: 'user', content: question });
  chatInput.value = '';
  chatSend.disabled = true;

  const typingEl = addTyping();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          { role: 'system', content: RESUME_CONTEXT },
          ...history
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    typingEl.remove();

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      addMessage('ai', `请求失败 (${res.status}): ${errText.slice(0, 100)}`);
      return;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法回答。';
    addMessage('ai', escapeHtml(reply));
    history.push({ role: 'assistant', content: reply });
  } catch (err) {
    typingEl.remove();
    addMessage('ai', '错误：' + err.message);
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
});

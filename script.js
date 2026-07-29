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

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  addMessage('user', question);
  history.push({ role: 'user', content: question });
  chatInput.value = '';
  chatSend.disabled = true;

  const typingEl = addTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    typingEl.remove();

    if (!res.ok) {
      addMessage('ai', '抱歉，出了点问题，请稍后再试。');
      return;
    }

    const msgDiv = addMessage('ai', '');
    const bubble = msgDiv.querySelector('.chat-bubble');
    let fullText = '';

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            bubble.textContent = fullText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch {}
      }
    }

    history.push({ role: 'assistant', content: fullText });
  } catch {
    typingEl.remove();
    addMessage('ai', '网络异常，请稍后再试。');
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
});

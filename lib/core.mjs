import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const 条款 = [
  { k: '合同主体', re: /甲方|乙方|委托人|受托方|承租方|出租方/ },
  { k: '标的/工作范围', re: /服务内容|标的|工作范围|项目内容/ },
  { k: '价款与支付', re: /价款|费用|报酬|金额|支付方式|付款/ },
  { k: '履行期限', re: /期限|交付时间|履行期限|工期/ },
  { k: '违约责任', re: /违约责任|违约金|赔偿/ },
  { k: '争议解决', re: /争议解决|仲裁|诉讼|管辖/ },
  { k: '保密条款', re: /保密|商业秘密/ },
  { k: '知识产权', re: /知识产权|著作权|成果归属|专利/ },
  { k: '不可抗力', re: /不可抗力/ },
  { k: '解除与终止', re: /解除|终止/ },
];

const 收文本 = (p) => {
  const ext = extname(p).toLowerCase();
  if (ext === '.docx') return null; // docx 另由 python-docx 处理
  try { return readFileSync(p, 'utf8'); } catch { return null; }
};

export function run({ input = '' } = {}) {
  const dir = String(input || '').trim();
  if (!dir) return { ok: false, text: '请填写合同文件或目录' };
  if (!existsSync(dir)) return { ok: false, text: '路径不存在：' + dir };
  const files = [];
  const 收 = (p) => {
    if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) if (!n.startsWith('.')) 收(join(p, n)); return; }
    const ext = extname(p).toLowerCase();
    if (['.md', '.txt', '.markdown'].includes(ext)) files.push(p);
  };
  收(dir);
  if (!files.length) return { ok: false, text: '没有找到 .md/.txt 合同文本（.docx 请先转文本）' };
  const 结果 = [];
  for (const f of files) {
    const t = 收文本(f) || '';
    const 缺 = 条款.filter((c) => !c.re.test(t)).map((c) => c.k);
    const 有 = 条款.length - 缺.length;
    结果.push({ f, 有, 缺 });
  }
  const lines = ['合同条款体检（10 项必备）', ''];
  for (const r of 结果) {
    lines.push('## ' + r.f);
    lines.push('命中 ' + r.有 + '/' + 条款.length + (r.缺.length ? '，缺：' + r.缺.join('、') : '，齐全'));
    lines.push('');
  }
  lines.push('提示：「有这个词」不等于条款写全；这是缺失项筛查，最终以人工审阅为准。');
  return { ok: true, text: lines.join('\n') };
}

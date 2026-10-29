/** 深鲸合同体检 · 宿主出口 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { run } from './core.mjs';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = '/dsh-contract-check';
const VERSION = (() => { try { return JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version || ''; } catch { return ''; } })();
const 回 = (res, code, obj) => { const b = JSON.stringify(obj); res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(b) }); res.end(b); };
const 读体 = async (req) => { const c = []; for await (const x of req) c.push(x); const t = Buffer.concat(c).toString('utf8'); if (!t) return {}; try { return JSON.parse(t); } catch { return {}; } };

export function registerApi(ctx) {
  const handler = async (req, res) => {
    try {
      const u = new URL(req.url || '/', 'http://127.0.0.1');
      if (u.pathname === `${ROUTE}/api/info`) return 回(res, 200, { ok: true, version: VERSION });
      if (u.pathname === `${ROUTE}/api/upload` && req.method === 'POST') {
        const b = await 读体(req);
        const files = Array.isArray(b.files) ? b.files : [];
        if (!files.length) return 回(res, 400, { ok: false, error: '没有收到文件' });
        const dir = mkdtempSync(join(tmpdir(), 'dwh-contract-'));
        let total = 0; const paths = [];
        for (const f of files) {
          const name = String(f.name || 'file').replace(/[\\/:*?"<>|]/g, '_');
          const buf = Buffer.from(String(f.data || ''), 'base64');
          total += buf.length;
          if (total > 60 * 1024 * 1024) return 回(res, 413, { ok: false, error: '文件累计超过 60MB' });
          const p = join(dir, name); writeFileSync(p, buf); paths.push(p);
        }
        return 回(res, 200, { ok: true, dir, path: paths.length === 1 ? paths[0] : dir, count: paths.length });
      }
      if (u.pathname === `${ROUTE}/api/run` && req.method === 'POST') {
        const b = await 读体(req);
        const r = await run(b);
        return 回(res, 200, r);
      }
      return 回(res, 404, { ok: false, error: 'not found' });
    } catch (e) { return 回(res, 500, { ok: false, text: e?.message || String(e) }); }
  };
  ctx.webServer.register({ kind: 'prefix', path: ROUTE, handler });
}

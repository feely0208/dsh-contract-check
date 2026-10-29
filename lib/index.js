import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';
import { registerApi } from './api.js';

const base = createPlugin({
  name: 'contract-check',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/contract-check.md',
  binFile: 'bin/cli.mjs',
  description: '深鲸合同体检：扫描合同文本，检查 10 项必备条款（主体/标的/价款/期限/违约/争议/保密/知识产权/不可抗力/解除）是否缺失',
  whenToUse: '当用户要审合同、检查条款是否齐全时使用：扫描 md/txt 合同，列出缺失的必备条款与命中情况。',
});
export const name = base.name;
export const inject = [...base.inject, 'webServer'];
export function apply(ctx) {
  base.apply(ctx);
  try { if (ctx.webServer?.register) registerApi(ctx); } catch (e) { ctx.logger?.warn?.('[contract-check] 面板出口注册失败: ' + (e?.message || e)); }
}

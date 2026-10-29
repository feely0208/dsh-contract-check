#!/bin/bash
set -uo pipefail
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
T=$(mktemp -d)

cat > "$T/合同.md" <<'EOF'
甲方：甲公司
乙方：乙公司
服务内容：开发一套系统
价款：10 万元，支付方式：分期
交付时间：2026-12-01
违约责任：按日千分之三
争议解决：提交温州仲裁委
保密：双方保密
EOF
OUT=$(node bin/cli.mjs --input "$T/合同.md" 2>&1)
echo "$OUT" | grep -q "知识产权" && ok "缺知识产权被发现" || bad "未发现缺失：$OUT"
echo "$OUT" | grep -q "不可抗力" && ok "缺不可抗力被发现" || bad "未发现不可抗力"
node bin/cli.mjs --input /nonexistent >/dev/null 2>&1; [ $? -eq 1 ] && ok "不存在目录退出码 1" || bad "错误处理异常"

echo "  ────────────────────────────────────────"; echo "  通过 $PASS · 失败 $FAIL"; rm -rf "$T"; [ "$FAIL" -eq 0 ]

# 深鲸合同体检（@deepwhale-cn/dsh-contract-check）

扫描合同文本，检查 10 项必备条款是否缺失：主体、标的、价款、期限、违约责任、争议解决、保密、知识产权、不可抗力、解除。

## 安装

```bash
dsh plugin --profile web add @deepwhale-cn/dsh-contract-check
```

## 用法

```bash
dsh-contract-check --input ./合同
```

面板：侧栏「深鲸合同体检」。支持 .md/.txt；.docx 请先转文本。

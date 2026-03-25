#!/bin/bash
# DSE Enhancer - 部署配置验证脚本
# 使用此脚本验证GitHub Actions部署配置是否正确

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "DSE Enhancer 部署配置验证工具"
echo "=========================================="
echo ""

# 检查参数
SERVER_IP=$1
if [ -z "$SERVER_IP" ]; then
    echo -e "${YELLOW}使用方法: ./verify-deploy.sh <服务器IP>${NC}"
    echo "例如: ./verify-deploy.sh 43.139.84.228"
    exit 1
fi

echo "🎯 验证目标服务器: $SERVER_IP"
echo ""

# ========== 检查1: SSH密钥文件 ==========
echo "🔍 检查1: SSH密钥文件"
if [ -f "$HOME/.ssh/dse-deploy" ] && [ -f "$HOME/.ssh/dse-deploy.pub" ]; then
    echo -e "${GREEN}✅ SSH密钥对已生成${NC}"
    echo "   私钥: $HOME/.ssh/dse-deploy"
    echo "   公钥: $HOME/.ssh/dse-deploy.pub"
else
    echo -e "${RED}❌ SSH密钥对未找到${NC}"
    echo "   请运行: ssh-keygen -t rsa -b 4096 -f ~/.ssh/dse-deploy -C 'github-actions'"
    exit 1
fi
echo ""

# ========== 检查2: SSH连接 ==========
echo "🔍 检查2: SSH连接测试"
if ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no -o ConnectTimeout=5 "ubuntu@$SERVER_IP" "echo 'SSH连接成功'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSH连接成功${NC}"
else
    echo -e "${RED}❌ SSH连接失败${NC}"
    echo "   可能的原因："
    echo "   1. 公钥未添加到服务器的 ~/.ssh/authorized_keys"
    echo "   2. 服务器IP地址不正确"
    echo "   3. 服务器防火墙阻止了SSH连接"
    echo ""
    echo "   请执行以下命令添加公钥："
    echo "   ssh ubuntu@$SERVER_IP"
    echo "   echo '$(cat $HOME/.ssh/dse-deploy.pub)' >> ~/.ssh/authorized_keys"
    exit 1
fi
echo ""

# ========== 检查3: 服务器目录 ==========
echo "🔍 检查3: 部署目录"
if ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "test -d /var/www/dse-english" 2>/dev/null; then
    echo -e "${GREEN}✅ 部署目录已存在${NC}"
    echo "   目录: /var/www/dse-english"
else
    echo -e "${YELLOW}⚠️  部署目录不存在，将自动创建${NC}"
    echo "   在服务器上执行: sudo mkdir -p /var/www/dse-english && sudo chown -R ubuntu:ubuntu /var/www/dse-english"
fi
echo ""

# ========== 检查4: PM2安装 ==========
echo "🔍 检查4: PM2进程管理器"
if ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "which pm2" > /dev/null 2>&1; then
    PM2_VERSION=$(ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "pm2 --version" 2>/dev/null)
    echo -e "${GREEN}✅ PM2已安装${NC}"
    echo "   版本: $PM2_VERSION"
else
    echo -e "${YELLOW}⚠️  PM2未安装，将自动安装${NC}"
    echo "   在服务器上执行: sudo npm install -g pm2"
fi
echo ""

# ========== 检查5: Node.js版本 ==========
echo "🔍 检查5: Node.js版本"
NODE_VERSION=$(ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "node --version" 2>/dev/null || echo "未安装")
if [ "$NODE_VERSION" != "未安装" ]; then
    echo -e "${GREEN}✅ Node.js已安装${NC}"
    echo "   版本: $NODE_VERSION"
    
    # 检查版本是否 >= 18
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js版本符合要求 (>= 18)${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js版本过低，建议升级到18+${NC}"
    fi
else
    echo -e "${RED}❌ Node.js未安装${NC}"
    echo "   请安装Node.js 18+"
fi
echo ""

# ========== 检查6: 端口开放 ==========
echo "🔍 检查6: 端口检查"
if ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "sudo ufw status | grep -q '3000'" 2>/dev/null || ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "sudo iptables -L | grep -q '3000'" 2>/dev/null; then
    echo -e "${GREEN}✅ 端口3000已开放${NC}"
else
    echo -e "${YELLOW}⚠️  无法确认端口3000是否开放${NC}"
    echo "   如果部署后无法访问，请检查防火墙设置"
    echo "   执行: sudo ufw allow 3000"
fi
echo ""

# ========== 检查7: 磁盘空间 ==========
echo "🔍 检查7: 磁盘空间"
DISK_USAGE=$(ssh -i "$HOME/.ssh/dse-deploy" -o StrictHostKeyChecking=no "ubuntu@$SERVER_IP" "df -h /var/www | tail -1 | awk '{print \$5}' | sed 's/%//'" 2>/dev/null)
if [ -n "$DISK_USAGE" ] && [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ 磁盘空间充足${NC}"
    echo "   使用率: ${DISK_USAGE}%"
else
    echo -e "${YELLOW}⚠️  磁盘空间使用率较高${NC}"
    echo "   使用率: ${DISK_USAGE}%"
    echo "   建议清理不必要的文件"
fi
echo ""

# ========== 总结 ==========
echo "=========================================="
echo "验证完成！"
echo "=========================================="
echo ""

# 提供下一步建议
echo "📋 下一步操作："
echo ""
echo "1. 在GitHub上配置Secrets:"
echo "   访问: https://github.com/swj19821119/dse-enhancer/settings/secrets/actions"
echo ""
echo "2. 添加以下Secrets:"
echo "   - SSH_PRIVATE_KEY: 复制 ~/.ssh/dse-deploy 的内容"
echo "   - SERVER_IP: $SERVER_IP"
echo ""
echo "3. 手动触发部署测试:"
echo "   GitHub → Actions → Scheduled Deploy to Tencent Cloud → Run workflow"
echo ""
echo "4. 查看部署日志，确认是否成功"
echo ""

# 提供私钥复制命令
echo "💡 快速复制私钥命令:"
echo "   cat ~/.ssh/dse-deploy | pbcopy"
echo "   (将私钥复制到剪贴板，然后粘贴到GitHub Secrets)"
echo ""

exit 0

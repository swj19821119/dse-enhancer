# DSE Enhancer - 部署配置检查清单

使用此清单验证GitHub Actions部署配置是否正确。

## ✅ 配置前准备

### 1. 本地SSH密钥生成

```bash
# 在Mac/本地终端执行
ssh-keygen -t rsa -b 4096 -f ~/.ssh/dse-deploy -C "github-actions"

# 查看生成的文件
ls -la ~/.ssh/dse-deploy*
# 应该看到：
# - dse-deploy (私钥)
# - dse-deploy.pub (公钥)
```

**检查点**：✅ 两个文件都已生成

---

## ✅ 服务器端配置

### 2. 添加公钥到服务器

```bash
# 查看公钥内容
cat ~/.ssh/dse-deploy.pub

# 复制输出的整行内容（以 ssh-rsa 开头）
```

**SSH到服务器并添加公钥**：

```bash
ssh ubuntu@43.139.84.228

# 在服务器上执行
echo "粘贴你复制的公钥内容" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 验证公钥已添加
grep "github-actions" ~/.ssh/authorized_keys
```

**检查点**：✅ 公钥已成功添加到 authorized_keys

### 3. 本地测试SSH连接

```bash
# 在本地测试（不要SSH到服务器）
ssh -i ~/.ssh/dse-deploy ubuntu@43.139.84.228

# 如果成功，会显示服务器的欢迎信息并进入终端
# 如果失败，会显示 "Permission denied"
```

**检查点**：✅ 无需密码即可SSH登录服务器

### 4. 创建部署目录

```bash
# SSH到服务器
ssh ubuntu@43.139.84.228

# 创建目录
sudo mkdir -p /var/www/dse-english
sudo chown -R ubuntu:ubuntu /var/www/dse-english

# 验证
ls -la /var/www/
# 应该看到 dse-english 目录，且所有者是 ubuntu
```

**检查点**：✅ /var/www/dse-english 目录存在且权限正确

### 5. 安装PM2

```bash
# 在服务器上执行
sudo npm install -g pm2

# 验证
pm2 --version
# 应该显示版本号，如 5.x.x
```

**检查点**：✅ PM2已安装

---

## ✅ GitHub Secrets配置

### 6. 获取私钥内容

```bash
# 在本地执行，复制全部输出
cat ~/.ssh/dse-deploy

# 输出应该类似：
# -----BEGIN OPENSSH PRIVATE KEY-----
# b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
# ...（很多行）...
# -----END OPENSSH PRIVATE KEY-----
```

**重要**：复制时要包括开头的 `-----BEGIN` 和结尾的 `-----END`

### 7. 在GitHub上配置Secrets

访问：
```
https://github.com/swj19821119/dse-enhancer/settings/secrets/actions
```

点击 **New repository secret**

#### Secret 1: SSH_PRIVATE_KEY
- **Name**: `SSH_PRIVATE_KEY`
- **Value**: 粘贴上面复制的私钥全部内容

**检查点**：✅ Secret已添加，名称完全匹配（大小写敏感）

#### Secret 2: SERVER_IP
- **Name**: `SERVER_IP`
- **Value**: `43.139.84.228`

**检查点**：✅ Secret已添加，IP地址正确

### 8. 验证Secrets

在GitHub页面上确认：
- [ ] `SSH_PRIVATE_KEY` 显示在列表中
- [ ] `SERVER_IP` 显示在列表中
- [ ] 没有其他拼写错误（如 `server_ip` 或 `SSH_PRIVATE-KEY`）

**检查点**：✅ 两个Secrets都正确配置

---

## ✅ 测试部署

### 9. 手动触发部署测试

1. 打开：https://github.com/swj19821119/dse-enhancer/actions
2. 点击 **Scheduled Deploy to Tencent Cloud**
3. 点击 **Run workflow** → **Run workflow**

### 10. 观察部署日志

在Actions页面查看实时日志，检查以下关键节点：

#### ✅ 期望的成功输出：

```
✅ SSH连接测试通过
📁 创建部署目录...
✅ 目录创建完成
📦 压缩构建文件...
📤 上传文件到服务器...
🎯 执行部署...
   解压文件...
   ✅ 已备份到 /var/www/backup-...
   📥 安装依赖...
   🔄 重启应用...
   ✅ 部署完成！
🏥 执行健康检查...
✅ 健康检查通过 (HTTP 200)
🧹 清理完成
```

#### ❌ 常见的错误输出：

**错误1**：`❌ SSH连接失败，请检查...`
- **原因**：SSH_PRIVATE_KEY不正确或SERVER_IP错误
- **解决**：重新检查步骤6-8

**错误2**：`Permission denied (publickey)`
- **原因**：公钥未正确添加到服务器
- **解决**：重新执行步骤2

**错误3**：`No such file or directory: /var/www/dse-english`
- **原因**：服务器上目录未创建
- **解决**：重新执行步骤4

**错误4**：`❌ 健康检查失败 (HTTP 000)`
- **原因**：应用启动失败或端口未开放
- **解决**：SSH到服务器查看日志 `pm2 logs`

---

## ✅ 部署后验证

### 11. 验证网站可访问

```bash
# 在浏览器访问
http://43.139.84.228:3000

# 或使用curl测试
curl -I http://43.139.84.228:3000
# 应该返回 HTTP/1.1 200 OK
```

**检查点**：✅ 网站正常加载

### 12. 验证应用运行状态

```bash
# SSH到服务器
ssh ubuntu@43.139.84.228

# 检查PM2状态
pm2 list
# 应该看到 dse-enhancer 状态为 online

# 查看应用日志
pm2 logs dse-enhancer
```

**检查点**：✅ 应用状态为 online，没有错误日志

---

## ✅ 定时部署验证

### 13. 等待定时触发

配置完成后，等待晚上11点（香港时间），查看Actions是否自动运行：

1. 第二天早上查看 Actions 历史
2. 确认有定时触发的记录
3. 如果没有新提交，应该显示 "没有新提交，跳过部署"

---

## 🆘 故障排查

### 如果SSH测试失败

```bash
# 启用详细输出查看错误
ssh -vvv -i ~/.ssh/dse-deploy ubuntu@43.139.84.228

# 常见错误：
# - Permission denied (publickey): 公钥未正确添加
# - Connection refused: 服务器IP错误或服务器未启动
# - Connection timeout: 防火墙阻止或网络问题
```

### 如果部署卡住

如果卡在 `📤 上传文件到服务器...` 超过5分钟：

1. **取消当前部署**：在Actions页面点击 Cancel
2. **检查网络**：确保服务器可以访问
3. **检查磁盘空间**：SSH到服务器执行 `df -h`
4. **重新运行**：再次触发部署

### 查看详细日志

```bash
# 在GitHub Actions页面
# 点击失败的部署 → 点击具体步骤查看详细输出

# 或者在服务器上查看
ssh ubuntu@43.139.84.228
tail -f /var/log/syslog
cd /var/www/dse-english && pm2 logs
```

---

## ✅ 完成检查

所有检查点都完成后，部署配置就成功了！

### 已完成配置：
- [ ] SSH密钥已生成
- [ ] 公钥已添加到服务器
- [ ] 本地SSH测试通过
- [ ] 部署目录已创建
- [ ] PM2已安装
- [ ] GitHub Secrets已配置
- [ ] 手动部署测试成功
- [ ] 网站可正常访问
- [ ] 定时部署已启用

### 下一步：
现在可以正常使用开发工作流了：
1. 在本地开发和提交代码
2. Push到GitHub
3. 每天晚上11点自动部署到服务器
4. 或者手动触发紧急部署

---

**最后更新时间**：2026-03-25
**版本**：v1.0

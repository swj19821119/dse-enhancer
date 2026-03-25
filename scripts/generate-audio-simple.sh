#!/bin/bash
# DSE Enhancer - 批量生成口语录音脚本（简化版）
# 使用macOS/Linux系统内置的say命令（免费）
#
# 使用方法:
#   1. 将口语文本放入 input/ 目录
#   2. chmod +x generate-audio-simple.sh
#   3. ./generate-audio-simple.sh

INPUT_DIR="input"
OUTPUT_DIR="output"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "🎙️  开始批量生成口语录音..."
echo "📁 输入目录: $INPUT_DIR"
echo "📁 输出目录: $OUTPUT_DIR"
echo "----------------------------------------"

# 遍历所有文本文件
for textfile in "$INPUT_DIR"/*.txt; do
    # 检查文件是否存在
    [ -e "$textfile" ] || continue
    
    # 获取文件名（不带路径和扩展名）
    filename=$(basename "$textfile" .txt)
    
    echo "📝 处理: $filename"
    
    # 使用macOS say命令生成音频（英音）
    # 注意：macOS Monterey及以上版本支持更多语音
    say -v "Samantha" -o "$OUTPUT_DIR/$filename.aiff" -f "$textfile"
    
    # 转换为MP3格式（需要安装ffmpeg）
    if command -v ffmpeg &> /dev/null; then
        ffmpeg -i "$OUTPUT_DIR/$filename.aiff" -codec:a libmp3lame -qscale:a 2 "$OUTPUT_DIR/$filename.mp3" -y 2>/dev/null
        rm "$OUTPUT_DIR/$filename.aiff"
        echo "✅ 完成: $filename.mp3"
    else
        echo "✅ 完成: $filename.aiff (建议安装ffmpeg转换为mp3)"
    fi
done

echo "----------------------------------------"
echo "🎉 全部完成！音频文件保存在 $OUTPUT_DIR/"

# 可选语音列表（macOS）:
#   Samantha - 美音女声
#   Daniel - 英音男声
#   Karen - 澳音女声
#   Moira - 爱尔兰音女声
#   Tessa - 南非音女声
#
# 查看所有可用语音:
#   say -v '?'

#!/usr/bin/env python3
"""
DSE Enhancer - 口语录音批量生成脚本
使用Edge-TTS（微软Edge浏览器语音）免费生成英音音频

安装依赖:
    pip install edge-tts pydub

使用方法:
    1. 将口语文本保存到 input/ 目录（每个文本一个.txt文件）
    2. 运行脚本: python generate-audio.py
    3. 生成的音频保存在 output/ 目录

特点:
    - 完全免费
    - 英音语音（en-GB-SoniaNeural）
    - 可调节语速（默认-10%，适合学生）
    - 自动批量处理
"""

import asyncio
import edge_tts
import os
from pathlib import Path
from pydub import AudioSegment

# 配置
INPUT_DIR = "input"  # 文本文件目录
OUTPUT_DIR = "output"  # 音频输出目录
VOICE = "en-GB-SoniaNeural"  # 英音女声
RATE = "-10%"  # 语速降低10%，更适合学生跟读
VOLUME = "+0%"  # 音量


async def text_to_speech(text_file: Path, output_file: Path):
    """将文本文件转换为语音"""

    # 读取文本内容
    with open(text_file, "r", encoding="utf-8") as f:
        text = f.read().strip()

    if not text:
        print(f"⚠️  跳过空文件: {text_file.name}")
        return

    print(f"🎙️  正在生成: {text_file.name}")

    # 使用Edge-TTS生成音频
    communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE, volume=VOLUME)

    # 保存为MP3
    await communicate.save(str(output_file))

    # 获取音频时长
    audio = AudioSegment.from_mp3(output_file)
    duration = len(audio) / 1000  # 转换为秒

    print(f"✅ 完成: {output_file.name} ({duration:.1f}秒)")


async def main():
    """主函数：批量处理所有文本文件"""

    # 创建输出目录
    Path(OUTPUT_DIR).mkdir(exist_ok=True)

    # 获取所有文本文件
    text_files = list(Path(INPUT_DIR).glob("*.txt"))

    if not text_files:
        print(f"❌ 错误: 在 {INPUT_DIR}/ 目录中没有找到.txt文件")
        print("请先将口语文本文件放入 input/ 目录")
        return

    print(f"📁 找到 {len(text_files)} 个文本文件")
    print(f"🔊 使用语音: {VOICE}")
    print(f"🐌 语速: {RATE}")
    print("-" * 50)

    # 批量生成音频
    tasks = []
    for text_file in text_files:
        # 生成输出文件名（将.txt替换为.mp3）
        output_file = Path(OUTPUT_DIR) / text_file.name.replace(".txt", ".mp3")
        tasks.append(text_to_speech(text_file, output_file))

    # 并行执行所有任务
    await asyncio.gather(*tasks)

    print("-" * 50)
    print(f"🎉 全部完成！音频文件保存在 {OUTPUT_DIR}/ 目录")


if __name__ == "__main__":
    # 检查输入目录是否存在
    if not Path(INPUT_DIR).exists():
        Path(INPUT_DIR).mkdir()
        print(f"📁 已创建 {INPUT_DIR}/ 目录")
        print("请将口语文本文件(.txt)放入此目录后重新运行脚本")
    else:
        # 运行主程序
        asyncio.run(main())

"""
使用示例:

1. 创建目录结构:
    mkdir input output

2. 准备文本文件（文件名示例）:
    input/speaking-01-level3.txt
    input/speaking-01-level4.txt
    input/speaking-01-level5.txt
    input/speaking-02-level3.txt
    ...

3. 每个文本文件内容示例（speaking-01-level3.txt）:
    Good morning, everyone. Today I want to talk about this picture. 
    I can see a lot of plastic rubbish in the sea...

4. 运行脚本:
    python generate-audio.py

5. 输出结果:
    output/speaking-01-level3.mp3
    output/speaking-01-level4.mp3
    output/speaking-01-level5.mp3
    ...
"""

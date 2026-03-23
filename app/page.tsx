import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">DSE Enhancer</h1>
        <p className="text-xl">香港DSE英语AI自适应学习平台</p>
      </div>

      <div className="mt-16 text-center">
        <p className="text-2xl mb-8">每天40分钟，精准提高DSE英语成绩</p>
        <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          开始学习
        </Link>
      </div>
    </main>
  );
}

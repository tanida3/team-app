import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen">
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-md flex gap-8 border border-gray-300">
<div className="text-xl text-black rounded hover:text-blue-500 ">
  <Image src="/home-icon.png" alt="ホーム" width={24} height={24} className="translate-x-4 " />
  ホーム
</div>

<Link href="/trainingu" className="text-xl text-black rounded hover:text-blue-500">
  <Image src="/training-icon.png" alt="トレーニング" width={24} height={24} className="translate-x-10" />
  トレーニング
</Link>

<Link href="/sokutei" className="text-xl text-black rounded hover:text-blue-500 ">
  <Image src="/measure-icon.png" alt="測定" width={24} height={24} className="translate-x-2" />
  測定
</Link>
        </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
    <Link href="/"className="text-1xl absolute top-10 right-10 bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-300 transition">
      ホームに戻る
    </Link>
    </div>
  );
}

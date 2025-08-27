"use client";
import React, { useState, useEffect } from "react";

// 動画の型定義
type Video = {
  id: string;
  title?: string;
};

const VideoApp: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [input, setInput] = useState("");        // URL
  const [loading, setLoading] = useState(false); // 追加処理中フラグ

  // --- LocalStorageから読み込み ---
  useEffect(() => {
    const saved = localStorage.getItem("videos");
    if (saved) {
      setVideos(JSON.parse(saved));
    }
  }, []);

  // --- LocalStorageへ保存 ---
  const saveToLocalStorage = (items: Video[]) => {
    localStorage.setItem("videos", JSON.stringify(items));
  };

  // --- URLから動画IDを抽出 ---
  const extractVideoId = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com")) {
        return parsed.searchParams.get("v");
      } else if (parsed.hostname === "youtu.be") {
        return parsed.pathname.substring(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  // --- 動画を追加（タイトル自動取得） ---
  const handleAddVideo = async () => {
    const videoId = extractVideoId(input.trim());
    if (!videoId) {
      alert("正しいYouTubeのURLを入力してください。");
      return;
    }

    setLoading(true);

    // タイトル自動取得
    let title: string | undefined;
    try {
      const res = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      const data = await res.json();
      title = data.title || undefined;
    } catch {
      title = undefined;
    }

    const newVideo: Video = { id: videoId, title };
    const newVideos = [...videos, newVideo];
    setVideos(newVideos);
    saveToLocalStorage(newVideos);

    setInput("");
    setLoading(false);
  };

  // --- 動画を削除 ---
  const handleDeleteVideo = (id: string) => {
    const filtered = videos.filter((v) => v.id !== id);
    setVideos(filtered);
    saveToLocalStorage(filtered);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">MY LIST</h2>

      {/* URL入力フォーム */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="YouTubeのURLを入力"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={() => void handleAddVideo()}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-500"}`}
        >
          {loading ? "追加中…" : "追加"}
        </button>
      </div>

      {/* ギャラリー */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="border p-2 rounded shadow">
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://img.youtube.com/vi/${video.id}/0.jpg`}
                alt={video.title || "YouTube動画"}
                className="w-full rounded"
              />
              <p className="text-center mt-2">
                {video.title ? video.title : "動画を見る"}
              </p>
            </a>
            <button
              onClick={() => handleDeleteVideo(video.id)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded w-full"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoApp;

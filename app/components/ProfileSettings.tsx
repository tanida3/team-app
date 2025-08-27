"use client";
import React, { useEffect, useMemo, useState } from "react";

// 1) 型定義 ------------------------------------------------------------
type Gender = "male" | "female" | "other";

export type Profile = {
    name: string;
    gender: Gender;
    age: number | ""; // 未入力を許容するために空文字もOK
    heightCm: number | ""; // cm
    weightKg: number | "";
    goal: string; // 目標（例：体脂肪-3% or 5kg減）
};

// 2) 初期値 ------------------------------------------------------------
const EMPTY_PROFILE: Profile = {
    name: "",
    gender: "other",
    age: "",
    heightCm: "",
    weightKg: "",
    goal: "",
};

// 3) ユーティリティ（バリデーション等） -------------------------------
type Errors = Partial<Record<keyof Profile, string>>;

function validate(profile: Profile): Errors {
    const errors: Errors = {};

    if (!profile.name.trim()) errors.name = "名前を入力してください";
    if (!profile.gender) errors.gender = "性別を選択してください";

    // age
    if (profile.age === "" || isNaN(Number(profile.age))) {
        errors.age = "年齢を数字で入力してください";
    } else {
        const age = Number(profile.age)
        if (age < 0 || age > 120) errors.age = "0〜120の範囲で入力してください";
    }

    // height
    if (profile.heightCm === "" || isNaN(Number(profile.heightCm))) {
        errors.heightCm = "身長(cm)を数字で入力してください";
    } else if (Number(profile.heightCm) < 50 || Number(profile.heightCm) > 250) {
        errors.heightCm = "50〜250cmの範囲で入力してください";
    }

    //weight
    if (profile.weightKg === "" || isNaN(Number(profile.weightKg))) {
        errors.weightKg = "体重(kg)を数字で入力してください";
    } else if (Number(profile.weightKg) < 10 || Number(profile.weightKg) > 300) {
        errors.weightKg = "10〜300kgの範囲で入力してください";
    }

    // goal（任意項目、必要なら必須に変更）
    if (profile.goal.length > 50) errors.goal = "目標は50文字以内で入力してください";

    return errors;
}

function calcBMI(heightCm: number | "", weightKg: number | ""): number | null {
    if (heightCm === "" || weightKg === "") return null;
    const hM = Number(heightCm) / 100;
    const w = Number(weightKg);
    if (!hM || !w) return null;
    return +(w / (hM * hM)).toFixed(1);
}

// 4) ローカルストレージ用キー -----------------------------------------
const STORAGE_KEY = "profile-settings:v1";

// 5) UIコンポーネント ---------------------------------------------------
export default function ProfileSettings() {
    const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
    const [errors, setErrors] = useState<Errors>({});
    const [saved, setSaved] = useState(false);

    // 初期ロード.これは「ページを開いたときに前回保存したプロフィールを復元する」ための処理です。
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw) as Profile;
                setProfile(data);
            }
        } catch (e) {
            console.warn("failed to parse localStorage", e);
        }
    }, []);

    const bmi = useMemo(() => calcBMI(profile.heightCm, profile.weightKg), [profile.heightCm, profile.weightKg]);

    // 入力ハンドラ（numberは空文字を許容）
    const handleChange = <K extends keyof Profile,>(key: K, value: Profile[K]) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const v = validate(profile);
        setErrors(v);
        if (Object.keys(v).length > 0) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setSaved(true);
    };

    const handleReset = () => {
        setProfile(EMPTY_PROFILE);
        setErrors({});
        setSaved(false);
        localStorage.removeItem(STORAGE_KEY);
    };



    // css部分はコピペで作成
    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-start justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
                <h1 className="text-2xl font-semibold mb-2">プロフィール設定</h1>
                <p className="text-sm text-gray-500 mb-6">名前、性別、年齢、身長・体重、目標を登録できます。保存するとブラウザにローカル保存されます。</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 名前 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">名前 *</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="例）山田 太郎"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* 性別 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">性別 *</label>
                        <select
                            value={profile.gender}
                            onChange={(e) => handleChange("gender", e.target.value as Gender)}
                            className="w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">その他 / 回答しない</option>
                        </select>
                        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                    </div>

                    {/* 年齢 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">年齢 *</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={profile.age}
                            onChange={(e) => handleChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="例）28"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                    </div>

                    {/* 身長・体重 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">身長 (cm) *</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={profile.heightCm}
                                onChange={(e) => handleChange("heightCm", e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="例）170"
                                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.heightCm && <p className="mt-1 text-sm text-red-600">{errors.heightCm}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">体重 (kg) *</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={profile.weightKg}
                                onChange={(e) => handleChange("weightKg", e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="例）65"
                                className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.weightKg && <p className="mt-1 text-sm text-red-600">{errors.weightKg}</p>}
                        </div>
                    </div>

                    {/* 目標 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">目標（任意）</label>
                        <input
                            type="text"
                            value={profile.goal}
                            onChange={(e) => handleChange("goal", e.target.value)}
                            placeholder="例）3ヶ月で-4kg"
                            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.goal && <p className="mt-1 text-sm text-red-600">{errors.goal}</p>}
                    </div>

                    {/* BMIの自動表示 */}
                    <div className="rounded-xl bg-gray-100 p-3 text-sm">
                        <p className="font-medium">現在の推定BMI</p>
                        <p className="mt-1">{bmi === null ? "-" : bmi}<span className="ml-1 text-gray-500">（目安: 18.5〜24.9が標準）</span></p>
                    </div>

                    {/* 操作ボタン */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="rounded-2xl px-4 py-2 bg-blue-600 text-white shadow hover:opacity-90"
                        >保存</button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-2xl px-4 py-2 bg-gray-200 text-gray-800 shadow hover:opacity-90"
                        >リセット</button>
                        {saved && <span className="self-center text-sm text-green-600">保存しました！</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}

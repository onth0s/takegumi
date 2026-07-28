export interface FontOption {
  value: string;
  label: string;
  category: "custom" | "system";
}

export const AVAILABLE_FONTS: FontOption[] = [
  { value: "", label: "System Default", category: "system" },
  { value: "Anime Ace", label: "Anime Ace (Manga/Webtoon)", category: "custom" },
  { value: "Arial", label: "Arial", category: "system" },
  { value: "Helvetica", label: "Helvetica", category: "system" },
  { value: "Times New Roman", label: "Times New Roman", category: "system" },
  { value: "Georgia", label: "Georgia", category: "system" },
  { value: "Courier New", label: "Courier New (Monospace)", category: "system" },
  { value: "Verdana", label: "Verdana", category: "system" },
  { value: "Trebuchet MS", label: "Trebuchet MS", category: "system" },
  { value: "Impact", label: "Impact (SFX / Action)", category: "system" },
];

import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { VirtualList } from "@/components/song-list/virtual-list";
import { Song } from "@/lib/store/use-player-store";

// Force dynamic rendering - this page fetches data at request time
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: songsData, error } = await supabase
    .from("daily_trending_songs")
    .select("*")
    .limit(100);

  if (error) {
    console.error("Error fetching songs:", error);
  }

  // Map to Song interface
  const songs: Song[] = (songsData || []).map(s => ({
    bvid: s.bvid,
    title: s.title,
    pic: s.pic || '',
    owner_name: s.owner_name || 'Unknown',
    pubdate: 0
  }))

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 flex items-center justify-between border-b sticky top-0 bg-background/95 backdrop-blur z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suno Top 100</h1>
          <p className="text-muted-foreground text-sm">Today's trending AI music from Bilibili</p>
        </div>
        <ThemeSwitcher />
      </header>

      <div className="flex-1 p-6 min-h-0">
        <VirtualList songs={songs} />
      </div>
    </div>
  );
}

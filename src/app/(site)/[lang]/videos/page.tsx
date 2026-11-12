import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/site/PageBanner";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { getVideos } from "@/lib/data/public";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/videos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).videos.title, alternates: alternatesFor(lang, "/videos") };
}

export default async function VideosPage({ params }: PageProps<"/[lang]/videos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const videos = await getVideos();

  return (
    <>
      <PageBanner
        title={dict.videos.title}
        crumbs={[{ label: dict.nav.home, href: `/${lang}` }, { label: dict.videos.title }]}
      />
      <section className="section">
        <div className="container">
          {videos.length > 0 ? (
            <div className="grid grid-3 stack">
              {videos.map((v) => (
                <div key={v.id}>
                  <VideoPlayer url={v.video_url} title={pick(v, "title", lang)} thumbnail={v.thumbnail_url} />
                  <h3 style={{ fontSize: 17, marginTop: 10 }}>{pick(v, "title", lang)}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">{dict.common.noVideos}</p>
          )}
        </div>
      </section>
    </>
  );
}

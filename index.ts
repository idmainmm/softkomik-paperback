import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  SourceInfo,
  Request,
  RequestHeaders,
  SourceConfig,
  PagedResults
} from "paperback-extensions-common"

export const SoftkomikInfo: SourceInfo = {
  version: "1.0.0",
  name: "Softkomik",
  author: "Nama Kamu",
  icon: "https://softkomik.com/favicon.ico",
  authorWebsite: "",
  needsLogin: false,
  description: "Source untuk Softkomik.com",
  websiteBaseURL: "https://softkomik.com/",
  contentRating: 1
}

export class Softkomik extends Source {
  constructor() {
    super(SoftkomikInfo)
  }

  async getMangaDetails(mangaId: string): Promise<any> {
    const request = createRequestObject({
      url: mangaId,
      method: "GET"
    })
    const data = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(data.data)

    return {
      id: mangaId,
      titles: [this.decodeHTMLEntity($("h1").text().trim())],
      image: $("meta[property='og:image']").attr("content") ?? "",
      status: "",
      // Sinopsis contohnya bisa diambil dari tag deskripsi
      description: $("meta[name='description']").attr("content") ?? "",
      // dll.
    }
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: mangaId,
      method: "GET"
    })
    const data = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(data.data)
    const chapters: Chapter[] = []
    $(".chapter-list a").each((i, el) => {
      const url = $(el).attr("href") ?? ""
      const title = $(el).text().trim()
      chapters.push({
        id: url,
        name: title,
        langCode: "id",
        chapNum: parseFloat(title.match(/[\d\.]+/)?.[0] ?? `${i+1}`),
        time: Date.now()
      })
    })
    return chapters
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: chapterId,
      method: "GET"
    })
    const data = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(data.data)

    const pages: string[] = []
    $("img.page-img").each((i, el) => {
      const image = $(el).attr("data-src") ?? $(el).attr("src") ?? ""
      pages.push(image)
    })

    return {
      id: chapterId,
      mangaId: mangaId,
      pages: pages,
      longStrip: false
    }
  }

  async search(query: string): Promise<any> {
    const url = `https://softkomik.com/?s=${encodeURIComponent(query)}`
    const request = createRequestObject({
      url: url,
      method: "GET"
    })
    const data = await this.requestManager.schedule(request, 1)
    const $ = this.cheerio.load(data.data)
    const results: any[] = []
    $(".listupd .bs a").each((i, el) => {
      results.push({
        id: $(el).attr("href") ?? "",
        image: "",
        title: $(el).text().trim(),
        subtitleText: ""
      })
    })
    return results
  }
}

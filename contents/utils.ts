export async function getTranslation(text: string): Promise<string> {
    const response = await fetch("https://transmart.qq.com/api/imt", {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        header: {
          fn: "auto_translation_block",
          client_key:
            "tencent_transmart_crx_TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaX"
        },
        source: {
          lang: "en",
          text_block: text,
          orig_text_block: text
        },
        target: {
          lang: "zh"
        }
      })
    })

    const data = await response.json()

    if (data?.header?.ret_code === "succ") {
      return data.auto_translation
    } else {
      return "翻译失败，请稍后重试"
    }
}

export function getAudioUrl(text: string): string {
    const _text = text.trim().toLowerCase()
    const reg = /^[a-z]+$/
    if(!reg.test(_text)) {
        return ''
    }
    return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(_text)}&type=2`
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

import { describe, expect, it } from "vitest"
import { youtubeId } from "./video"

describe("youtubeId", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
    "https://m.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=abc",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/live/dQw4w9WgXcQ/",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  ])("aceita %s", (link) => {
    expect(youtubeId(link)).toBe("dQw4w9WgXcQ")
  })

  it.each([
    "",
    "dQw4w9WgXcQ",
    "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://vimeo.com/123456789",
    "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
    "https://evil.com/?https://youtu.be/dQw4w9WgXcQ",
    "https://user:senha@www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com:8443/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=curto",
    "https://www.youtube.com/channel/dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ <script>",
    "javascript:alert(1)",
  ])("recusa %s", (link) => {
    expect(youtubeId(link)).toBeNull()
  })
})

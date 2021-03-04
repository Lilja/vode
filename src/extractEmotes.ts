export type Emote = {code: string, id: string}
export type EmoteToResolve = {code: string, url: string}

import { loadTwe, channelNameToID } from './twe'
import { loadBttv } from './bttv'
import { loadFFZ } from './ffz'
import { loadGlobalEmotes } from './globaltwitch'
import fetch from "node-fetch";

type EmoteStream = {
    fileName: string,
    body: NodeJS.ReadableStream
}

async function loadAllEmotes(
    channelID: string,
    channelName: string
): Promise<EmoteStream[]> {
    const tweEmotes = await loadTwe(channelID)
    const bttvEmotes = await loadBttv(channelID)
    const ffzEmotes = await loadFFZ(channelName)
    const globalEmotes = await loadGlobalEmotes()

    const allEmotes = tweEmotes.concat(bttvEmotes).concat(ffzEmotes).concat(globalEmotes)
    const emoteUrls = allEmotes.map(
        (k: {code: string, url: string}) => downloadFilenameToUrl(k.code, k.url)
    )
    console.log(`Loading ${emoteUrls.length} emotes`)

    return await Promise.all(emoteUrls)
}

function safeFileName(fileName: string): string {
    return fileName.replace(/:/gi, 'colon')
}

const safeStaticUrl = (url: string) => {
    return url.replace(/^\/\//, 'https://')
}
async function downloadFilenameToUrl(
    filename: string,
    staticUrl: string
): Promise<EmoteStream> {
    const _safeStaticUrl = safeStaticUrl(staticUrl)
    const response = await fetch(_safeStaticUrl)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    const ext = response.headers.get("Content-Type") == "image/gif" ? ".gif" : ".jpg"
    const _safeFileName = safeFileName(filename) + ext

    return {
        fileName: _safeFileName,
        body: response.body
    }
}


export async function loadEmotes(
    channelName: string,
): Promise<{
    channelID: string,
    emotes: EmoteStream[]
}> {
    const channelID = await channelNameToID(channelName)

    console.log('Channel ID', channelID)
    return {
        channelID,
        emotes: await loadAllEmotes(channelID, channelName)
    }
}

export async function loadBadges(): Promise<EmoteStream[]> {
    const urls = {
        "broadcaster": "https://static-cdn.jtvnw.net/chat-badges/broadcaster.png",
        "mod": "https://static-cdn.jtvnw.net/chat-badges/mod.png",
    }
    const badgesPromise = Object.entries(urls).map(
        ([key, val]) => downloadFilenameToUrl(key, val)
    )

    return await Promise.all(badgesPromise)
}


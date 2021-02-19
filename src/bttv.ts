import {Emote, EmoteToResolve} from './extractEmotes'

import fetch from 'node-fetch'

const BTTV_API_URL = "https://api.betterttv.net/3/cached/users/twitch/"
const BTTV_CDN_URL = (
    emote_id: string, size: number
) => `https://cdn.betterttv.net/emote/${emote_id}/${size}x`
const BTTV_GLOBAL_EMOTES_URL = 'https://api.betterttv.net/3/cached/emotes/global'

const resolve = (k: Emote) => ({code: k.code, url: loadAnEmote(k.id)})
export async function loadBttv(channelID: string): Promise<EmoteToResolve[]> {
    const resp = await fetch(
        BTTV_API_URL + channelID
    )
    const respJson = await resp.json()
    const channelEmotes = respJson['channelEmotes'].map(resolve) as EmoteToResolve[]
    const sharedEmotes = respJson['sharedEmotes'].map(resolve) as EmoteToResolve[]
    const globalEmotes = await loadGlobalBttvEmotes()

    console.log(`Loaded ${sharedEmotes.length} bttv shared emotes`)
    console.log(`Loaded ${channelEmotes.length} bttv channel emotes`)
    console.log(`Loaded ${globalEmotes.length} bttv global emotes`)
    return channelEmotes.concat(sharedEmotes).concat(globalEmotes)
}

export async function loadGlobalBttvEmotes(): Promise<EmoteToResolve[]> {
    const resp = await fetch(BTTV_GLOBAL_EMOTES_URL)
    const json = await resp.json()
    return (
        json.map(resolve) as EmoteToResolve[]
    )
}

function loadAnEmote(emoteCode: string): string {
    return BTTV_CDN_URL(emoteCode, 1)
}
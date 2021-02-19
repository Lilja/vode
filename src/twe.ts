import fetch from 'node-fetch'
import {Emote, EmoteToResolve} from './extractEmotes'
const TWITCH_STATIC_API_URL = (id: string) => `https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`
const TWITCH_EMOTES_API_URL = 'https://api.twitchemotes.com/api/v4/channels'

export async function loadTwe(channelId: string): Promise<EmoteToResolve[]> {
    const resp = await fetch(
        TWITCH_EMOTES_API_URL + "/" + channelId
    )
    const emotes = (await resp.json())['emotes']

    const emoteUrls = emotes
    .map(
        (e: Emote) => 
        ({
            code: e.code,
            url: TWITCH_STATIC_API_URL(e.id)
        })
    )

    console.log(`Loaded ${emoteUrls.length} twe emotes`)
    return emoteUrls
}

export async function channelNameToID(channelName: string): Promise<string> {
    const url = "https://twitchemotes.com/search/channel?query=" + channelName
    const resp = await fetch(
        url, {
            headers: {
                "Referer": "https://twitchemotes.com/search/channel?query=" + channelName
            },
            method: "POST",
            redirect: "follow",
        }
    )

    if (!resp.url.includes("/channels/")) {
        throw new Error('Unknown format?')
    }
    return resp.url.replace('https://twitchemotes.com/channels/', '')
}
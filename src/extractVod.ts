import {CLIENT_ID} from './main'
import fetch from 'node-fetch'

export async function downloadFromTwitch(videoID: string): Promise<NodeJS.ReadableStream> {
    const video = await fetch('https://www.twitch.tv/videos/' + videoID)

    return video.body
}

export async function downloadVodInfo(videoID: string): Promise<{length: number}> {
    const resp = await fetch(
        'https://api.twitch.tv/kraken/videos/' + videoID,
        {
            headers: {
                "Client-ID": CLIENT_ID,
                "Accept": "application/vnd.twitchtv.v5+json"
            }
        }
    )
    const v = await resp.json()
    if (v.length) {
        return v
    }
    console.log(v)
    throw new Error(
        'Unexpetced twitch api regression, /kraken/videos/<video-id> did not return expected property'
    )
}
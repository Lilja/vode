import {EmoteToResolve} from './extractEmotes'
import fetch from 'node-fetch'
const FFZ_API_URL = 'https://api.frankerfacez.com/v1/room/'

export async function loadFFZ(channelName: string): Promise<EmoteToResolve[]> {
    const resp = await fetch(FFZ_API_URL + channelName)
    const jsonResp = await resp.json()

    const id = jsonResp['room']['_id']
    const ffzEmotes = jsonResp['sets'][id]['emoticons'].map(
        (k: {name: string, urls: {'1': string}}) => ({
            code: k.name,
            url: k.urls['1']
        })
    )
    console.log(`Loaded ${ffzEmotes.length} ffz emotes`)

    return ffzEmotes
}
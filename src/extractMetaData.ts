import {MetaData} from './main'
const API_URL = (channelName: string) => `https://tmi.twitch.tv/group/user/${channelName}/chatters`
import fetch from 'node-fetch'

async function loadMods(channelName: string): Promise<string[]> {
    const resp = await fetch(API_URL(channelName))
    const jsonResp = (await resp.json()) 
    return jsonResp['chatters']['moderators']
}
export async function loadMetaData(
    channelName: string,
    channelID: string
): Promise<MetaData> {
    return {
        mods: await loadMods(channelName),
        channelName: channelName,
        channelID: channelID,
    }
}
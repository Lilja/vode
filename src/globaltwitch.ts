import fetch from "node-fetch";
import { EmoteToResolve } from './extractEmotes'

type InternalEmoteIdWithURL = {
    internalEmoteID: string,
    url: string
}

async function loadEmoteName(k: InternalEmoteIdWithURL[]): Promise<{code: string, id: string}[]> {
    const _emotes = k.map(a => a.internalEmoteID).join(',')
    const resp = await fetch('https://api.twitchemotes.com/api/v4/emotes?id=' + _emotes)
    return await resp.json()
}

function chunk(resource: InternalEmoteIdWithURL[], chunkSize: number) {
    const R = [];
    for (let i = 0; i < resource.length; i += chunkSize)
      R.push(resource.slice(i, i + chunkSize));
    return R;
}

function emoteToResolve(
    internalEmoteID: string,
    url: string,
    output: {[key: string]: string}
): EmoteToResolve {
    return {
        code: output[internalEmoteID],
        url: url
    }
}

function getEmoteID(k: string) {
    // "https://static-cdn.jtvnw.net/emoticons/v1/4337/3.0" => "4337"
    return k.match(/v1\/(.*?)\/3.0/)[1]
}

export async function loadGlobalEmotes(): Promise<EmoteToResolve[]> {
    const resp = await fetch('https://www.twitchmetrics.net/emotes')
    const text = await resp.text();

    const matches: InternalEmoteIdWithURL[] = []
    for (const k of [...text.matchAll(/src="(.*?)"/g)]) {
        if (k[1].includes('static-cdn')) {
            const url = k[1].replace('3.0', '1.0')
            const emoteID = getEmoteID(k[1])
            matches.push({
                internalEmoteID: emoteID,
                url
            })
        }
    }
    const chunkedEmotes = chunk(matches, 100)
    const nonAwaitedResource = chunkedEmotes.map(
        k => loadEmoteName(k)
    )
    const resources = (await Promise.all(nonAwaitedResource)).flatMap(k => k)
    const output: {[key: string]: string} = resources.reduce(
        (prev, obj) => Object.assign({}, {[obj.id]: obj.code}, prev),
        {}
    )
    const globalTwitchEmotes = matches.map(k => emoteToResolve(k.internalEmoteID, k.url, output))
    console.log(`Loaded ${globalTwitchEmotes.length} global twitch emotes`)
    return globalTwitchEmotes
}

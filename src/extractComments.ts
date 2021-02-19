import fetch from 'node-fetch'
import {CLIENT_ID} from './main'

const comments: {[key: string]: unknown} = {}

class Log {
    private logs: string[] = []
    constructor(public readonly workerID: number) {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public push(...params: any[]) {
        this.logs.push(params.join(' '))
    }
    public getLogs(): string[] {
        return this.logs
    }
}
async function req(URL: string) {
    const _req = await fetch(URL, {
        headers: {
            "Client-ID": CLIENT_ID,
            "Accept": "application/vnd.twitchtv.v5+json"
        }
    })
    
    return await _req.json()
}

async function startWork(
    videoID: string,
    startingOffset: number,
    worker: number,
) {
    const collisions: string[] = []
    let numberOfCollisions = 0
    
    const logs = new Log(worker)
    logs.push(worker, 'Starting work', 'starting offset', startingOffset)
    let totalInsertions = 0
    const checkCommentAndAssign = (comment: {"_id": string}) => {
        if (!comments[comment._id]) {
            comments[comment._id] = comment
            return true
        }
        return false
    }
    const URL = `https://api.twitch.tv/v5/videos/${videoID}/comments`

    let cursor = null
    let reqJson
    let numberOfAssigns = 0
    let lastContentOffsetSeconds = null
    let pager = 1

    do {
        numberOfAssigns = 0
        const url: string = (
            cursor == null ? 
                URL + "?content_offset_seconds=" + startingOffset :
                URL + "?cursor=" + cursor
        )
        reqJson = await req(url)
        for(const comment of reqJson["comments"]) {
            if(checkCommentAndAssign(comment)) {
                numberOfAssigns += 1
                totalInsertions += 1
                lastContentOffsetSeconds = comment.content_offset_seconds
            } else {
                numberOfCollisions += 1
                collisions.push(comment._id)
            }
        }
        if (numberOfAssigns < reqJson["comments"].length) {
            logs.push(
                worker,
                'Decaying comments',
                'at page', pager,
                'Assigns', numberOfAssigns,
                'comments', reqJson["comments"].length,
                'total insertions', totalInsertions,
            )
        }
        if (numberOfAssigns == 0) {
            logs.push(
                worker, 'Breaking worker', 'at page', pager, 
            )
            break
        }
        cursor = reqJson["_next"] ? reqJson["_next"] : null
        pager = pager + 1
    }
    while (cursor != null) 
    logs.push(
        worker, 
        'total insertions', totalInsertions,
        'last insertion offset', lastContentOffsetSeconds,
        'starting insertion', startingOffset,
        'collisions', numberOfCollisions
    )

    return {
        logs: logs,
        numberOfCollisions: numberOfCollisions,
        collisions,
    }
}

export async function loadComments(
    videoID: string,
    videoLength: number,
    workers = 10
): Promise<Record<string, unknown>[]> {
    const amountOfTime = videoLength / workers
    const offsets = Array.from({length: workers}, (x, i) => Math.floor(amountOfTime * i))

    console.log('Video length', videoLength)
    console.log('Offsets', offsets, offsets.length, 'workers', workers)
    const work = offsets.map(
        (offset, index) => startWork(videoID, offset, index)
    )

    console.log(`Waiting for ${work.length} promises to resolve...`)
    const workerLogs = await Promise.all(work)

    const sortedLogs = workerLogs.sort((a, b) => a.logs.workerID > b.logs.workerID ? 1 : -1)
    const totalCollisions = workerLogs.map(a => a.numberOfCollisions).reduce((prev, obj) => prev + obj, 0)
    for (const l of sortedLogs) {
        for (const log of l.logs.getLogs()) {
            console.log(log)
        }
        console.log('-------------')
    }
    console.log('Total collisions', totalCollisions)

    console.log('Sorting comments')
    const sorted = Object.values(comments).sort(
        (a, b) => a.content_offset_seconds < b.content_offset_seconds ? -1 : 1
    )
    console.log('Number of comments gathered', sorted.length)
    return sorted
}
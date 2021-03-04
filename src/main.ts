export type MetaData = {
    mods: string[], 
    channelID: string,
    channelName: string
}
export const CLIENT_ID = "fpn72hbheha2hg33nl8lyifh7jni78";

import {loadEmotes, loadBadges} from './extractEmotes'
import JSZip = require('jszip')
import { loadMetaData } from './extractMetaData';
import { downloadVodInfo } from './extractVod'
import { loadComments, Comments } from './extractComments'

type BlobOutput = {
  zipFile: Blob,
  comments: Comments
}
type BufferOutput = {
  zipFile: Buffer,
  comments: Comments
}
export async function main(
  channelName: string,
  videoID: string,
  zipBufferType: "nodebuffer"
): Promise<BufferOutput>;
export async function main(
  channelName: string,
  videoID: string,
  zipBufferType: "blob"
): Promise<BlobOutput>
export async function main(
  channelName: string,
  videoID: string,
  zipBufferType: "nodebuffer" | "blob"
): Promise<BufferOutput | BlobOutput> {
  console.log('Channel', channelName)

  const zip = new JSZip();
  const {channelID, emotes} = await loadEmotes(channelName)

  for(const entry of emotes) {
      zip.file(entry.fileName, entry.body)
  }
  const metadata = await loadMetaData(channelName, channelID)
  zip.file('metadata.json', JSON.stringify(metadata))

  const badges = await loadBadges()
  for(const entry of badges) {
      zip.file(entry.fileName, entry.body)
  }

  // TODO: Add vod download feature
  // const stream = await downloadFromTwitch(videoId)
  // zip.file(videoId + '.mp4', stream)

  const vodInfo = await downloadVodInfo(videoID)
  const comments = await loadComments(videoID, vodInfo.length)
  // zip.file(videoID + '.json', JSON.stringify(comments))

  console.log('Generating zip')
  const zipFile = await zip.generateAsync({type: zipBufferType})
  console.log('Generating zip done')
  const cnt = {
    zipFile,
    comments
  }
  return cnt as BufferOutput | BlobOutput
}
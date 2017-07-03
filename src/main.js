import fs from 'fs'
import { mapx } from 'pytils'
import { getDomain, getContext, getProp, delay, time } from './utils'
import { getHash } from 'dejavu-call'

let data = {}

const resetData = (url, instructions) => {
  clearInterval(data.interval)
  data = {
    time: time(),
    domain: getDomain(url),
    pages: {},
    feed: [],
    deep: 5,
    depthReached: false,
    instructions: instructions,
    interval: false
  }
}

const tryPages = async (url, deep) => {
  try {
    deep -= 1
    const { html, links, context } = await getContext(url, data.instructions)
    console.log('--desc: ', context)
    data.pages[url] = context
    if (deep > 0) {
      if (links && links.length) {
        Promise
          .all(links
            .map(url =>
              feedList(url, deep)))
      }
    } else {
      data.depthReached = true
    }
  } catch (err) {
    console.log('err', err)
  }
}

const feedList = async (url, deep) => {
  if (!data.pages[url] && data.domain === getDomain(url, false)) {
    data.pages[url] = {}
    data.feed.push({
      url,
      deep
    })
  }
  console.log('--feedList', url, deep, data.feed)
}

const consumeList = resolve => () => {
  console.log('data.feed:', data.feed.length)
  const item = data.feed.pop()
  if (item) {
    const { url, deep } = item
    tryPages(url, deep)
  } else if (data.depthReached) {
    clearInterval(data.interval)
    resolve(getResume())
  }
}

export const start = (url, instructions) => new Promise(
  (resolve, reject) => {
    resetData(url, instructions)
    feedList(url, data.deep)
    console.log('--Promise')
    data.interval = setInterval(
      consumeList(resolve),
      data.time)
  })

const getResume = () => {
  return mapx(
    data.pages,
    (val, key) =>
      val.video ? val : undefined)
      .filter(Boolean)
}

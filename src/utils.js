import rp from 'request-promise'
import parse from 'html-parse-regex'
import { mapx } from 'pytils'
import { runQuery } from 'fx-query'

export const getDomain = (url, Throw = true) => {
  const domain = (/^(https?:\/\/|)(www.|)([^\/]+)\/?/.exec(url) || {})[3]
  if (Throw && !domain) {
    throw `${domain} no is a valid domain`
  }
  return domain
}

export const time = base => {
  const ref = 900
  base = base > ref ? base : ref
  const n = base + Math.floor(Math.random() *base)
  console.log('time base:', n)
  return n
}

const getAllLinks = `
  all with tag 'a'
  get attr 'href'`

const createContext = (html, allInstructions) => {
  const result = {}
  mapx(allInstructions,
    (instructions, key) => {
      result[key] = runQuery(html, instructions)
    })
  return result
}

export const getContext = async (url, instructions) => {
  try {
    const html = parse(await rp(url))
    return ({
      links: runQuery(html, getAllLinks),
      context: createContext(html, instructions)
    })
  } catch (err) {
    console.log('getContext error:', err)
    return {}
  }
}

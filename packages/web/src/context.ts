import packageInfo from '../package.json'

type ContextApp = {
  name: string,
  version: string,
  build: string
}

type ContextCampaign = {
  name: string,
  source: string,
  medium: string,
  term: string,
  content: string
}

type ContextDevice = {
  id: string,
  advertisingId: string,
  manufacturer: string,
  model: string,
  name: string,
  type: string,
  version: string
}

type ContextLocation = {
  city: string,
  country: string,
  latitude: number,
  longitude: number,
  region: string,
  speed: number
}

type ContextReferrer = {
  type: string,
  name: string,
  url: string,
  link: string
}

function getLibrary() {
  return { name: packageInfo.name, version: packageInfo.version }
}

function getLocale() {
  return navigator.language
}

function getPage() {
  return {
    path: window.location.pathname,
    search: window.location.search,
    title: window.document.title,
    url: window.location.href
  }
}

function getScreen() {
  return {
    height: window.screen.height,
    width: window.screen.width,
    orientation: window.screen.orientation.type
  }
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export type Context = {
  active: boolean,
  app?: ContextApp,
  campaign?: ContextCampaign,
  device?: ContextDevice,
  groupId?: string,
  ip?: string,
  library: ReturnType<typeof getLibrary>,
  locale: ReturnType<typeof getLocale>,
  location?: ContextLocation,
  network?: Record<string, string | number>,
  page: ReturnType<typeof getPage>,
  referrer?: ContextReferrer,
  screen: ReturnType<typeof getScreen>,
  timezone: ReturnType<typeof getTimezone>,
  traits?: Record<string, string | number>
}

export default function generateContext(): Context {
  return {
    active: false,
    library: getLibrary(),
    locale: getLocale(),
    page: getPage(),
    screen: getScreen(),
    timezone: getTimezone()
  }
}

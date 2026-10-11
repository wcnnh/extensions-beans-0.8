import {
    ContentRating,
    HomeSectionType,
    SourceInfo,
    SourceIntents
} from '@paperback/types'
import {
    BasicAcceptedElems,
    CheerioAPI
} from 'cheerio'
import { AnyNode } from 'domhandler'

import {
    getExportVersion,
    MangaStream
} from '../MangaStream'
import {
    createHomeSection,
    DefaultHomeSectionData
} from '../MangaStreamHelper'

const DOMAIN = 'https://en-thunderscans.com'

export const ThunderScansInfo: SourceInfo = {
    version: getExportVersion('0.0.2'),
    name: 'ThunderScans',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: []
}

export class ThunderScans extends MangaStream {

    baseUrl: string = DOMAIN

    override directoryPath = 'comics'

    override configureSections() {
        this.homescreen_sections['new_titles'].enabled = false
        this.homescreen_sections['top_alltime'].enabled = false
        this.homescreen_sections['top_monthly'].enabled = false
        this.homescreen_sections['top_weekly'].enabled = false

        const subtitle = ($: CheerioAPI, element: BasicAcceptedElems<AnyNode>) =>
            $('div.epxs', element).first().text().trim() || $('li > a', element).first().text().trim()

        // Popular Today: the base version already works for this site (sortIndex 10)

        // Latest Comics
        this.homescreen_sections['latest_update'].section = createHomeSection('latest_update', 'Latest Comics')
        this.homescreen_sections['latest_update'].selectorFunc = ($: CheerioAPI) => $('div.bsx', $('h2:contains(Latest Comics)').first()?.parent()?.next())
        this.homescreen_sections['latest_update'].subtitleSelectorFunc = subtitle
        this.homescreen_sections['latest_update'].sortIndex = 30

        // Extra sections the base class doesn't know about
        const sections = this.homescreen_sections as any

        sections['editors_pick'] = {
            ...DefaultHomeSectionData,
            section: createHomeSection('editors_pick', "Editor's Pick", false, HomeSectionType.featured),
            selectorFunc: ($: CheerioAPI) => $('div.bsx', $('h2:contains(Pick)').first()?.parent()?.next()),
            titleSelectorFunc: ($: CheerioAPI, element: BasicAcceptedElems<AnyNode>) => $('a', element).attr('title'),
            subtitleSelectorFunc: subtitle,
            sortIndex: 20
        }

        sections['latest_novels'] = {
            ...DefaultHomeSectionData,
            section: createHomeSection('latest_novels', 'Latest Novels', false),
            selectorFunc: ($: CheerioAPI) => $('div.bsx', $('h2:contains(Latest Novels)').first()?.parent()?.next()),
            titleSelectorFunc: ($: CheerioAPI, element: BasicAcceptedElems<AnyNode>) => $('a', element).attr('title'),
            subtitleSelectorFunc: subtitle,
            sortIndex: 40
        }
    }
}

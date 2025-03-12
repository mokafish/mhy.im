import {format} from "date-fns/format";
import type {MagicEntry} from "./friendship.ts";



export default {
    autoindex: (prefix: string) => prefix !== '/blog',
    fmt: {
        date: (date: Date, entry: MagicEntry): string => format(date, "yyyy/M/d"),
        permalink: (entry: MagicEntry): string => `${entry.collection}/${entry.id}`, //.replace(/\/index$/, ''),
        editlink: (entry: MagicEntry): string => `/edit?file=${entry.filePath}`,
    }
}

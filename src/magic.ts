import { format } from "date-fns/format";
import type { MagicEntry } from "./friendship.ts";


export default {
    absURL: (path: string) => `/${path}/`,
    autoindex: (path: string) => !path.startsWith('blog'),
    fmt: {
        date: (date: Date, entry: MagicEntry | null = null): string => format(date, "yyyy/M/d"),
        permalink: (entry: MagicEntry): string => {
            if (entry.collection == 'blog') {
                const d = entry.data?.date as Date;
                const is_date = d instanceof Date
                const args = {
                    year: is_date ? d.getFullYear() : '',
                    month: is_date ? d.getMonth() + 1 : '',      // 月份从0开始需+1
                    day: is_date ? d.getDate() : '',
                    hours: is_date ? d.getHours() : '',
                    minutes: is_date ? d.getMinutes() : '',
                    seconds: is_date ? d.getSeconds() : '',
                    milliseconds: is_date ? d.getMilliseconds() : '',
                    weekday: is_date ? d.getDay() : ''          // 星期几 (0=周日)
                  };
                return `${args.year}/${entry.id}`
            }
            return `${entry.collection}/${entry.id}`
        },
        editlink: (entry: MagicEntry): string => `/edit?file=${entry.filePath}`,
    }
}

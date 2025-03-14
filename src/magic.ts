import { format } from "date-fns/format";
import type { MagicEntry } from "./friendship.ts";
export  const TIME_0 = new Date(0)


export default {
    autoindex: (path: string) => !path.startsWith('blog'),
    formatDate: (date:Date|undefined) => format(date||TIME_0, "yyyy/M/d"),
    formatDateTime: (date:Date|undefined) => format(date||TIME_0, "yyyy-MM-dd hh:mm"),
    absURL: (path: string) => `/${path}/`,
    distPath: (entry: MagicEntry): string => {
        if (entry.collection == 'blog') {
            const d = entry.data?.date as Date;
            const is_date = d instanceof Date
            const args = {
                year: is_date ? d.getFullYear() : '',
                month: is_date ? d.getMonth() + 1 : '',      // 月份从0开始需+1
                month0: '',      
                day: is_date ? d.getDate() : '',
                day0: '',
                hour: is_date ? d.getHours() : '',
                minute: is_date ? d.getMinutes() : '',
                second: is_date ? d.getSeconds() : '',
                millisecond: is_date ? d.getMilliseconds() : '',
                weekday: is_date ? d.getDay() : ''          // 星期几 (0=周日)
              };
            return `${args.year}/${entry.id}`
        }
        // NOTE: 不要带有前导后后导 '/'
        return `${entry.collection}/${entry.id}`
    }
}

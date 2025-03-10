import {format} from "date-fns/format";

// (alias) getCollection<"dogs", {
//     id: string;
//     body?: string;
//     collection: "dogs";
//     data: InferEntrySchema<"dogs">;
//     rendered?: RenderedContent;
//     filePath?: string;
//  }
interface Entry {
    id: string;
    data: Record<string, any>;
    body?: string;
    collection: string;
    filePath?: string;
}


export default {
    fmt: {
        date: (date: Date, entry:Entry): string => format(date, "yyyy/M/d"),
        permalink: (entry:Entry):string => `/${entry.collection}/${entry.id}`,
        editlink: (entry:Entry):string => `/edit?file=${entry.filePath}`,
    }
}

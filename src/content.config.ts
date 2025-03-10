import {defineCollection, z} from 'astro:content';
import {glob, file} from 'astro/loaders'; // Not available with legacy API

const authorSchema = z.union([    // 联合类型
    z.string(),      // 简单字符串形式
    z.object({       // 或完整作者对象
        name: z.string(),
        homepage: z.string().optional(),
        url: z.string().optional(),
    }).passthrough().transform((data)=>{
        data.homepage = data.homepage || data.url
        return data;
    })
])

const frontMatterSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),  // 可选字符串
    date: z.coerce.date(). optional(), // 自动转换输入为 Date 对象
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    author: authorSchema.optional(),
    draft: z.boolean().default(false), // 默认值 false
    slug: z.string().optional(), // 用正则验证 slug 格式
    updated_at: z.coerce.date().optional(),      // 自动转换日期
}).passthrough(); // 允许未声明的字段


const dogSchema =  z.object({
    id: z.string(),
    breed: z.string(),
    temperament: z.array(z.string()),
})



const note = defineCollection({
    loader: glob({pattern: "**/*.md", base: "02_note"}),
    schema: frontMatterSchema,
})



// ---------------------------------------------------------------

const blog = defineCollection({
    loader: glob({pattern: "**/*.md", base: "01_blog"}),
    schema: frontMatterSchema,
});

const dogs = defineCollection({
    loader: file("00_magic/dogs.json"),
    schema: dogSchema,
});

export const collections = { note, blog, dogs};

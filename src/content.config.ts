import {defineCollection, z} from 'astro:content';
import {glob, file} from 'astro/loaders'; // Not available with legacy API


const authorSchema = z.union([    // 联合类型
    z.string(),      // 简单字符串形式
    z.object({       // 或完整作者对象
        name: z.string(),
        homepage: z.string().optional(),
        url: z.string().optional(),
    }).passthrough().transform((data) => {
        data.homepage = data.homepage || data.url
        return data;
    })
])

const frontMatterSchema = z.object({
    title: z.coerce.string().default(''),
    description: z.coerce.string().default(''),
    date: z.coerce.date().default(new Date()),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    cover: z.coerce.string().default(''),
    author:z.nullable(authorSchema).default(''),
    draft: z.coerce.boolean().default(false),
    slug: z.coerce.string().optional(),
    updated_at: z.coerce.date().optional(),
}).passthrough(); // 允许未声明的字段


const dogSchema = z.object({
    id: z.string(),
    breed: z.string(),
    temperament: z.array(z.string()),
})


export const collections = {
    blog: defineCollection({
        loader: glob({pattern: "**/*.md", base: "01_blog"}),
        schema: frontMatterSchema,
    }),

    note: defineCollection({
        loader: glob({pattern: "**/*.md", base: "02_note"}),
        schema: frontMatterSchema,
    }),

    docs: defineCollection({
        loader: glob({pattern: "**/*.md", base: "03_docs"}),
        schema: frontMatterSchema.transform(data => {
            // 禁止 docs 目录下的文件自定义 id
            data.id = ''
            data.slug = ''
            data.permalink = ''
            return data
        }),
    }),

    dogs: defineCollection({
        loader: file("00_magic/dogs.json"),
        schema: dogSchema,
    }),
};


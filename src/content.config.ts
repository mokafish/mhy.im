import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders'; // Not available with legacy API

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "02_blog" }),
    schema: z.object({
        title: z.string(),
        // description: z.string().optional(),
        // date: z.string().transform((str) => new Date(str)),
        // categories: z.array(z.string()).optional(),
        // tags: z.array(z.string()).optional(),
        // cover: z.string().optional(),
        // author: z.string().optional(),
        // draft: z.boolean().optional(),
        // slug: z.string().optional(),
        // updated_at: z.string().transform((str) => new Date(str)),

    })
});

const dogs = defineCollection({
    loader: file("00_magic/dogs.json"),
    schema: z.object({
        id: z.string(),
        breed: z.string(),
        temperament: z.array(z.string()),
    }),
});

export const collections = { blog, dogs };

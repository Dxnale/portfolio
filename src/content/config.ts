import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const cv = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string(),
        role: z.string(),
        summary: z.string(),
        experience: z.array(z.object({
            role: z.string(),
            company: z.string(),
            startDate: z.string(),
            endDate: z.string().optional(),
            current: z.boolean().optional(),
            description: z.string(),
        })),
        education: z.array(z.object({
            degree: z.string(),
            school: z.string(),
            year: z.string(),
        })),
    })
});

export const collections = { blog, cv };

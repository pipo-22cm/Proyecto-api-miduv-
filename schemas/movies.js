import z from 'zod' //DEPENDENCIA DE VALIDACIONES

const movieSchema = z.object({
        title: z.string({
            invalid_type_error: 'El título de la película debe ser un string',
        required_error: 'El titulo de la pelicula es requerido'
        }),
        year: z.number().int().min(1900).max(2024),
        director: z.string(),
        duration: z.number().int().positive(),
        rate: z.number().min(0).max(10),
        poster: z.string(),
        genre: z.array(z.enum(['Action','Adventure','Comedy','Drama','Fantasy','Horror'])),

    })

    export function validateMovie (object) {
        return movieSchema.safeParse(object)
    }

    export function validatePartialMovie(object) {
        return movieSchema.partial().safeParse(object)
    }



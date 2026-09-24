// app.js (en la raíz de MVC)
import express from 'express'
import { createMoviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'


export const createApp = ({ movieModel }) => {
    const app = express()
    app.use(express.json()) 
    app.disable('x-powered-by')

    app.use('/movies', createMoviesRouter ({ movieModel}))

    const PORT = process.env.PORT ?? 1234

    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
}



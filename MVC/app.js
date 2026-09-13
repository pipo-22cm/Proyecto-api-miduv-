// app.js (en la raíz de MVC)
import express from 'express'
import { moviesRouter } from './routes/movies.js'

const app = express()
app.use(express.json())
app.disable('x-powered-by')

app.use('/movies', moviesRouter)

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
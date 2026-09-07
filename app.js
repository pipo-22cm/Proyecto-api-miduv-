import express from 'express'
import crypto from 'node:crypto' //CREAR ID UNICAS
import { validateMovie, validatePartialMovie } from './schemas/movies.js' //IMPORTAMOS EL SCHEMA DE VALIDACIONES
import movies from './movies.json' with { type: 'json' }
import cors from 'cors'


const app = express()
app.use(express.json()) //app.use = aplica lo que esta entre () a todas las peticiones que lleguen a la app. (convierte el body de la peticion que viene en formato JSON a objetos js y lo deja disponible en el req.body)
app.disable('x-powered-by') // desabilita el header x-powered-By: Express
app.use(cors({
    origin: (origin,callback) =>{
        const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://movies.com'
    ]

    if(ACCEPTED_ORIGINS.includes(origin)){
        return callback (null,true)
    }

    if(!origin){
        return callback(null,true)
    }

    return callback(null,true)

    }
    }
))



//RECUPERAR POR GENERO
app.get('/movies', (req,res) => {

    const {genre} = req.query
    if (genre) {
    const filterMovies = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filterMovies)
    }
    res.json(movies)
})


//RECUPERAR TODAS LAS PELICULAS
//app.get('/movies', (req,res) => {
//    res.json(movies)
//})

//RECUPERAR UNA PELICULA POR ID
app.get('/movies/:id', (req,res) => {
    const {id} = req.params
    const movie = movies.find(m => m.id === id)
    if (movie) return res.json(movie)
    res.status(404).json({message: 'Movie not found'})
})

app.post('/movies', (req,res) => {
    
    const result = validateMovie(req.body)

    if(result.error){
        return res.status(400).json({error:JSON.parse(result.error.message)})
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ... result.data
    }

    movies.push(newMovie)
    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {

    const result = validatePartialMovie(req.body)
    if(result.error){
        return res.status(400).json({error:JSON.parse(result.error.message)})
    }

    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }

    const updateMovie = {
        ... movies[movieIndex],
        ... result.data
    }
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.options('/movies:id',(req,res) => {
    const origin = req.header ('origin')
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    }
    res.sendStatus(200)
})

app.delete ('/movies/:id', (req, res) => {
    const {id} = req.params

    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }

    const deleteMovie = movies.splice(movieIndex,1)
    res.json(deleteMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () =>{
    console.log(`server listenig on port http://localhost:${PORT}`)
})



import mysql from 'mysql2/promise';
//import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULTO_CONFIG = {
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: '',
    database: 'movies_db',
}

const connectionString = process.env.DB_DATABASE_URL ?? DEFAULTO_CONFIG //Connecion DB LOCAL
const connectionLocal = await mysql.createConnection(connectionString)//Connecion DB LOCAL

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        ca: fs.readFileSync(path.join(import.meta.dirname, '../../ca.pem')),
        rejectUnauthorized: false
    }
}

const connection = await mysql.createConnection(config)



export class MovieModel {

//static async getAll ({ genre }) {
//    const [movies, tableInfo] = await connection.query(
//        'SELECT title, year, director, duration, poster, rate,  BIN_TO_UUID(id) id FROM movie;')
//    return movies;
//}

static async getAll ({ genre }) {

    if(genre){
        const [movies] = await connectionLocal.query(
        'SELECT movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate, BIN_TO_UUID(movie.id) id FROM movie JOIN movie_genres ON movie.id = movie_genres.movie_id JOIN genre ON movie_genres.genre_id = genre.id WHERE genre.name = ?',[genre])
        return movies;
    }else{
        const [movies] = await connection.query(
            'SELECT title, year, director, duration, poster, rate,  BIN_TO_UUID(id) id FROM movie;'
        )
        return movies
    }
    
}

static async getById ({ id }) {

    if (id) {
        const [movies] = await connection.query(
            `SELECT movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate, BIN_TO_UUID(movie.id) id, genre.name genre
            FROM movie
            JOIN movie_genres ON movie.id = movie_genres.movie_id
            JOIN genre ON movie_genres.genre_id = genre.id
            WHERE movie.id = UUID_TO_BIN(?)`,
            [id]
        )
        return movies
    }
    return []
}

static async create ({ input }) {

    //const id = crypto.randomUUID();

    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    const [result] = await connection.query(
            'INSERT INTO movie (id,title,year,director,duration,poster,rate) VALUES (UUID_TO_BIN(?),?,?,?,?,?,?)',
            [uuid,input.title,input.year,input.director,input.duration,input.poster,input.rate]
        )

    for (const genreName of input.genre){
        const [genres] = await connection.query(
            'SELECT id FROM genre WHERE name = ?',[genreName]
        )
        await connection.query(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?),?)',[ uuid , genres[0].id]
        )
    }

    return {id: uuid, ...result};
}

static async delete ({ id }) {
    const [deleteMovie] = await connection.query(
        'DELETE FROM movie WHERE id = UUID_TO_BIN(?)', [id]
    )
    console.log(deleteMovie)
    return deleteMovie.affectedRows > 0
}

static async update ({ id, input }) {

    const [movies] = await connection.query(
        'SELECT title, year, director, duration, poster, rate FROM movie WHERE id =UUID_TO_BIN(?);' , [id])

    const peliculaActual = movies [0]

    const nuevaMovie  = {
        ...peliculaActual, ...input
    }

    const [updateMovie] = await connection.query (
        'UPDATE movie SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ? WHERE id = UUID_TO_BIN(?)',
        [nuevaMovie.title,nuevaMovie.year,nuevaMovie.director,nuevaMovie.duration,nuevaMovie.poster,nuevaMovie.rate, id]
    )
    

    return updateMovie.affectedRows > 0
}

}


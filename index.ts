import express, { Response, Request } from "express"
import bodyParser from 'body-parser';
import pg, { QueryResult } from 'pg'
import 'dotenv/config'
var cors = require('cors')

const app = express();
const { Pool } = pg
const port: number = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const dbUrl: string = process.env.DATABASE_URL!

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
})
async function Hello() {
    const result = await pool.query('SELECT * from schoolData;')
    console.log(result.rows)
}
Hello()

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})
app.route('/students/')
    .get(async (req: Request, res: Response): Promise<Response> => {
        const query: QueryResult = await pool.query('SELECT * FROM schoolData ORDER BY rollno ASC;')
        return res.json(query.rows)
    })

    .post(async (req: Request, res: Response): Promise<Response> => {
        const { name, rollno, email } = req.body;
        const query: QueryResult = await
            pool.query('INSERT INTO schoolData (rollno,name,email) VALUES($1,$2,$3) RETURNING *',
                [rollno, name, email])
        return res.json(query.rows)
    })
app.route('/students/:id')
    .put(async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id
        const { name } = req.body;
        const query: QueryResult = await
            pool.query('UPDATE schoolData SET name= $1 WHERE rollno = $2 RETURNING * ',
                [name, id])
        return res.json(query.rows)
    })
    .delete(async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id
        const query: QueryResult = await
            pool.query('DELETE FROM schoolData where rollno = $1', [id])
        return res.json(` Roll no ${id} is deleted succesfully`)
    })


app.listen(port, () => {
    console.log(`Example app listening on localhost port  ${port}`)

})
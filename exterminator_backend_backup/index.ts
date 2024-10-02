import Fastify, { FastifyReply, FastifyRequest } from "fastify";

const server = require('fastify')();

server.register(require("@fastify/mysql"), {connectionString: "mysql://root@localhost/mysql"});

server.get("/ping", async (request: FastifyRequest, reply: FastifyReply) => {
  //return "pong\n";
})

type checkUserRequest = FastifyRequest<{
    Querystring: {username: string};
}>

server.get("/checkUser:username", async(request: checkUserRequest, reply: FastifyReply)=>{
    const {username} = request.query;
    
    server.mysql.query("SELECT username FROM users WHERE username = ?", [username],
        async function onResult(err:string, result:string){
            await reply.send(err || result);
        }
    );
})


server.listen({ port: 8080 }, (err: string, address: string) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
})

// const fastify = require('fastify')()

// fastify.register(require('@fastify/mysql'), {
//   connectionString: 'mysql://root@localhost/mysql'
// })

// type checkUserRequest = FastifyRequest<{
//     Querystring: {id: string};
// }>

// fastify.get('/user/:id', (req: checkUserRequest, reply: FastifyReply) => {
//     const {id} = req.query;
//     fastify.mysql.query(
//         'CREATE TABLE IF NOT EXISTS users(username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)',
//         function onResult (err:string, result:string) {
//             reply.send(err || result)
//           }
//     );
//   fastify.mysql.query(
//     'SELECT username FROM users WHERE username=?', [id],
//     function onResult (err:string, result:string) {
//       reply.send(err || result)
//     }
//   )
// })

// fastify.listen({ port: 8080 }, (err:string) => {
//   if (err) throw err
//   console.log(`server listening on ${fastify.server.address().port}`)
// })
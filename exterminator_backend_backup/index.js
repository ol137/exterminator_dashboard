"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server = require('fastify')();
server.register(require("@fastify/mysql"), { connectionString: "mysql://root@localhost/mysql" });
server.get("/ping", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    //return "pong\n";
}));
server.get("/checkUser:username", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = request.query;
    server.mysql.query("SELECT username FROM users WHERE username = ?", [username], function onResult(err, result) {
        return __awaiter(this, void 0, void 0, function* () {
            yield reply.send(err || result);
        });
    });
}));
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
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

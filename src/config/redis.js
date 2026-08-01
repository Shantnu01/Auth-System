const redis=require('redis')
// think of it as a pointer client pointing to redis url
const client =  redis.createClient(
 { url:'redis://localhost:6999'}
)

client.on('error',(err)=>{
  console.error(err);
});
(async()=>{
await client.connect();
console.log("Connected");
}
)();
module.exports=client;

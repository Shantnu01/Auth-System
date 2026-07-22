const {z}=require("zod")

const user=z.object({
  name:z.string().transform(val => val.trim()),
  email:z.string().toLowerCase().email({ message: "Give a legit email." }).transform(val => val.trim()),
  password:z.string().min(8)
})

module.exports=user;
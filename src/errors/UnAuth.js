const AppError=require("./AppError");

class UnAuth extends AppError{
  constructor(message){
    super(message,401);
  }
}


module.exports=UnAuth 
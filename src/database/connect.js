const {client} = require('./databaseop/collections')

module.exports=()=> new Promise((resolve,reject)=>{
    client.connect(err=>{
        if(err){
            reject("DB not Connected")
        }
        else{
            resolve("DB is Connected")
        }
    })
})
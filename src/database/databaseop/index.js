
const findAll = async(collectionName,query)=>{
    try{
    const result = await collectionName.find(query).toArray();
    return result;
    }catch(err){
        throw new Error(err)
    }
}
const findOneData =async(collectionName,query)=>{
    try{
   const result = await collectionName.findOne(query);
   return result;
    }catch(err){
        throw new Error(err);
    }
}

const insertOneData = async (collectionName,body)=>{
    try{
        const result = await collectionName.insertOne(body);
        return result;
    }catch(err){
        throw new Error(err)
    }
}

const upsertOne = async(collectionName,filter,updatedDoc,options)=>{
    try{
        const result =await collectionName.updateOne(
            filter,
            updatedDoc,
            options
          );
        return result;
    }catch(err){
        throw new Error(err);
    }
}

const updateManyData = async(collectionName,query,updatedDoc,options)=>{
    try{
        const result = await collectionName.updateMany(
            query,
            updatedDoc,
            options
          );
        return result;
    }catch(err){
        throw new Error(err)
    }
}

const createOne = async(collectionName,body)=>{
    try{
        const result = await collectionName.insertOne(body);
        return result;
    }catch(err){
        throw new Error(err);
    }
}

const deleteOneData = async (collectionName,query)=>{
    try{
        const result = await collectionName.deleteOne(query);
        return result;
    }catch(err){
        throw new Error(err);
    }
}


module.exports = {findOneData,findAll,insertOneData,upsertOne,updateManyData,createOne,deleteOneData}
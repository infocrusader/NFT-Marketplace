Moralis.Cloud.define("loadUsers", async (request) => {
    const pipeline = [
      { project: { email: 1, username: 1, ethAddress: 1, avatar:1 , objectId: 0  } } 
    ];
  
    const query = new Moralis.Query("User");
  
    return query.aggregate(pipeline, {useMasterKey:true})
      .then(function(results) {
      return results;
    })
      .catch(function(error) {
      return error;
    });
  });
  
  
  Moralis.Cloud.define("check_username", async (request) => {
    const query = new Moralis.Query("User");
    
     query.matches("username", request.params.checkedUser, "i");
  
    const result = await query.find({useMasterKey:true});
  
    if(result == null || result == ""){
      return false
      } else {
         return true
    }
  },
    {
      fields: ["checkedUser"]
  });
  

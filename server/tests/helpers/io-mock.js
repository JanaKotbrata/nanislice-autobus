const IO = {
    to: (socketId) => ({
     emit: (event, payload) =>{
         console.log(`emit do ${socketId}`, event, payload)
     }
    })
}

module.exports = IO;
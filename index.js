const express = require('express');
const port = 3000;
const port1 = 3001;
const app = express();
const bodyParser = require('body-parser');
require('./db');
require('./models/User');
require('./models/LawyerUsers');
require('./models/Message');
const authRoutes = require('./routes/authRoutes');
const uploadMediaRoutes = require('./routes/uploadMediaRoutes');
const messageRoutes = require('./routes/messageRoutes');
const lawAuthRoutes = require('./Lawroutes/lawAuthRoutes');
const lawMessageRoutes = require('./Lawroutes/lawMessageRoutes');
const lawUploadMediaRoutes = require('./Lawroutes/lawUploadMediaRoutes');

const { MongoClient } = require('mongodb');
// const mongo_URL="mongodb+srv://sumith95738:sumith123@backend.mcusq4r.mongodb.net/?retryWrites=true&w=majority"

const mongoURI = "mongodb+srv://sumith95738:sumith123@backend.mcusq4r.mongodb.net/?retryWrites=true&w=majority";

const {createServer} = require('http');
const {Server} = require('socket.io');
const httpServer = createServer();
const io = new Server(httpServer,{});


app.use(bodyParser.json());
app.use(authRoutes);
app.use(uploadMediaRoutes);
app.use(messageRoutes);
app.use(lawAuthRoutes);
app.use(lawUploadMediaRoutes);
app.use(lawMessageRoutes);

app.get('/',(req,res)=>{
    res.send("Hello World");
})


app.get('/api/users/count', async (req, res) => {
    try {
        console.log('started')
      const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('midway')
      await client.connect();
  
      const database = client.db();
      const collectionuser = database.collection('users');
      const prisonerCount = await collectionuser.countDocuments();

      const collectionlawuser = database.collection('lawyerusers');
      const lawyerCount = await collectionlawuser.countDocuments();
  
      res.json({ prisonerCount, lawyerCount });
      console.log('end');

        // console.log(userCount, lawyerCount);
      client.close();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// app.get('/api/messages/count', async (req, res) => {
//     try {
//       console.log('Started fetching message counts by sender');
      
//       const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
//       await client.connect();
  
//       const database = client.db();
//       const collection = database.collection('messages');
  
//       const messageCounts = await collection.aggregate([
//         {
//           $group: {
//             _id: "$senderid",
//             count: { $sum: 1 }
//           }
//         }
//       ]).toArray();
  
//       console.log('Finished fetching message counts by sender');
  
//       res.json(messageCounts);
      
//       client.close();
//     } catch (error) {
//       console.error('Error fetching message counts by sender:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
  
io.on("connection", (socket) => {

    console.log("USER CONNECTED - ", socket.id);

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED - ", socket.id);
    });

    socket.on("join_room", (data) => {
        console.log("USER WITH ID - ",socket.id,"JOIN ROOM - ", data.roomid);
        socket.join(data);
    });

    socket.on("send_message", (data) => {
        console.log("MESSAGE RECEIVED - ", data);
        io.emit("receive_message", data);
    });
});


httpServer.listen(port1,()=>{
    console.log("Socketio Server is running on port- ",port1)
});


app.listen(port,() =>{
    console.log("Server is running on port " + port);
})
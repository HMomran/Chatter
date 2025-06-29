const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const PORT = 3000;

app.use(cors());
app.use(express.json());
const CustomerRoutes = require('./routes/customers');
const MessageRoutes = require('./routes/messages');
const http = require('http');
const socketIo = require('socket.io');


app.use('/api/messages', MessageRoutes);
app.use('/api/Customers', CustomerRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
    }
});
app.post('/', (req, res) => {
    res.send("This is the BackEnd of the chat");
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Chat Backend</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f0f0f0; text-align: center; padding-top: 50px; }
                    .container { background: #fff; padding: 40px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);}
                    h1 { color: #333; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>This is the BackEnd of the chat</h1>
                    <p>Welcome to your chat application's backend server.</p>
                </div>
            </body>
        </html>
    `);
});

io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('sendMessage', (data) => {
        console.log('💬 Message:', data);
        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
    });
});

server.listen(PORT, (error) => {
    if (!error) {
        console.log('done', PORT);
    } else {
        console.log('error:', error);
    }
});

main().catch((error) => console.log(error));

async function main() {
    const connectionString = "mongodb+srv://hassanmirz6638:YtGJKSyQOGF7QXTF@cluster0.a3rurcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0luster0";
    await mongoose.connect(connectionString);
    mongoose.set('strictQuery', true);
}

module.exports = app;
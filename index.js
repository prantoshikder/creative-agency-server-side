const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fileupload = require('express-fileUpload');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jf95v.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('customer'));
app.use(fileupload());

const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("customerOrderList").collection("customerOrder");
    const clientCollection = client.db("customerOrderList").collection("clientOrder");
    const adminCollection = client.db("customerOrderList").collection("adminList");
    const addServiceCollection = client.db("customerOrderList").collection("addServices");
    console.log("database connected");


    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        orderCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/serviceOrderList', (req, res) => {
        const orderList = req.body;
        console.log(orderList);
        orderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addreview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const company = req.body.company;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        clientCollection.insertOne({ name, company, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/reviewlist', (req, res) => {
        clientCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/addadmin', (req, res) => {
        const newOrder = req.body;
        adminCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });


    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

    app.get('/allorderlist', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/addservice', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        addServiceCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });


    app.get('/addservicelist', (req, res) => {
        addServiceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)
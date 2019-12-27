const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const accountRoutes = require('./routes/account');
const courseRoutes = require('./routes/course');
const moduleClassRoutes = require('./routes/moduleClass');
const studentRoutes = require('./routes/student');
const examinationSemesterRoutes = require('./routes/examinationSemester');
const registerRoutes = require('./routes/register');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors());
app.use(morgan('common'));

app.use('/', accountRoutes);
app.use('/courses', courseRoutes);
app.use('/courses/module-classes', moduleClassRoutes);
app.use('/students', studentRoutes);
app.use('/examinations', examinationSemesterRoutes);
app.use('/register', registerRoutes);

app.use((req, res, next) => {
    const error = new Error('not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;
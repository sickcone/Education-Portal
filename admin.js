let admin = require("firebase-admin");
let firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
require('firebase/database');

const Joi = require('@hapi/joi');
const atob = require('atob');
const express = require('express');
const config = require('./config');
const sessions = require("express-session");

var session;

const app = express();

app.set("view engine", "ejs");           
app.use(express.json());
app.use(sessions({
    secret: "jlflksjf7^&^*&^8687^*&6876v8vt8787^",
    resave: false,
    saveUninitialized: true
}))
app.use("/css", express.static(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/images", express.static(__dirname + "/images"));

// Initialize Firebase
let serviceAccount = require("./express-first-app-firebase-adminsdk-evqga-220eb31416.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://express-first-app.firebaseio.com"
});

firebase.initializeApp(config.firebaseConfig);

const CURRENT_YEAR = 2019;
const COLLEGE_NAME = "IIITA";
const STUDENTS_KEY = "students";
const FACULTIES_KEY = "faculties";
const COURSES_KEY = "courses";
const dbReference = firebase.database().ref(COLLEGE_NAME);

app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/student', (req, res) => { 
    if (req.query.data) {
        let dataObject = JSON.parse(atob(req.query.data));
        let rollNo = dataObject.enrollmentNo;
        
        dbReference.child(STUDENTS_KEY).child(rollNo).once("value", snapshot => {
            res.render("student", snapshot.val());         
        }, error => {
            console.log(`Error in logging: ${error.message}`);
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/student-grades", (req, res) => {
    if (req.query.data) {
        let dataObject = JSON.parse(atob(req.query.data));
        
        const enrollmentNo = dataObject.enrollmentNo;
        const ddSem = dataObject.currentSem.toString();

        dbReference.child(STUDENTS_KEY).child(enrollmentNo).once("value", snapshot => {

            let studentDetails = snapshot.val();
            studentDetails["ddSemGrades"] = studentDetails.grades[ddSem];
            
            res.render("student_grades", studentDetails);
        }, error => {
            console.log(`Error in fetching grades: ${error.message}`);
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/student-feedback", (req, res) => {
    if (req.query.data) {
        let dataObject = JSON.parse(atob(req.query.data));
        const enrollmentNo = dataObject.enrollmentNo;
    
        dbReference.child(STUDENTS_KEY).child(enrollmentNo).once("value", snapshot => {

            let studentDetails = snapshot.val();
            
            res.render("student_feedback", studentDetails);
        }, error => {
            console.log(`Error in fetching grades: ${error.message}`);
        });
    } else {
        res.redirect("/login");
    }
});

app.get('/faculty-grades', (req, res) => {
    if (req.query.data && req.query.data) {
        let dataObject = JSON.parse(atob(req.query.data));
        const username = dataObject.username;

        dbReference.child(FACULTIES_KEY).child(username).child("courses").once("value", snapshot => {
            let courses = snapshot.value();
        });

        res.render("faculty_grades");
    } else {
        res.redirect("/login");
    }
});

app.get('/faculty-feedbacks', (req, res) => {
    if (req.query.data) {
        let dataObject = JSON.parse(atob(req.query.data));
        const username = dataObject.username;

        let facultyFeedbacks = { };

        dbReference.child("feedbacks").child(CURRENT_YEAR).once("value", snapshot => {
            let allFeedbacks = snapshot.val();
            dbReference.child(FACULTIES_KEY).child(username).child("courses").once("value", snapshot => {
                let courses = snapshot.val();
                Object.keys(courses).forEach(key => {
                    facultyFeedbacks[key] = allFeedbacks[key];
                });

                let data = { 
                    username: username,
                    feedbacks: facultyFeedbacks
                };
                
                res.render("faculty_feedbacks", data);
            });
        });

    } else {
        res.redirect("/login");
    }
});

app.get('/faculty-upload-grades', (req, res) => {
    if (req.query.data) {
        let dataObject = JSON.parse(atob(req.query.data));
        const username = dataObject.username;

        dbReference.child(FACULTIES_KEY).child(username).child("courses").once("value", snapshot => {
            let courses = snapshot.val();
            
            res.render("faculty_upload_grades", {courses: courses});
        });

    } else {
        res.redirect("/login");
    }
});

app.get('/admin', (req, res) => {
    res.render("admin");
});

app.get('/admin-add-student', (req, res) => {
    res.render("admin_add_student");
});


// To ADD DEPARTMENT, post request on "/departments" with departmentName, courseName, courseCode and credits 
// To REGISTER STUDENT, post request on "/students" with name, email, dob, batchYear and department
// To REGISTER NEW FACULTY, post request on "/faculties" with name, email and courses
// To ASSIGN COURSE TO A FACULTY, put request on "/faculties/assignCourse" with email and courseCode

app.post(`/${FACULTIES_KEY}`, (req, res) => {
    const { email } = req.body;
    dbReference.child(FACULTIES_KEY).child(email.substring(0, email.indexOf("@"))).set(req.body, error => {
        if (!error) {
            res.send(successMessage("Registration Completed"));
        } else {
            res.send(failureMessage(error.message));
        }
    });
});

app.put(`/${FACULTIES_KEY}/assignCourse`, (req, res) => {
    const { email, courseCode } = req.body;

    assignCourseToFaculty(email, courseCode, res);
});

app.post(`/${STUDENTS_KEY}`, (req, res) => {
    console.log("Received request to register new student.");
    
    const { batchYear, branch } = req.body;

    const batchRef = dbReference.child(CURRENT_YEAR).child(branch).child(batchYear);
    batchRef.once('value', function(snapshot) {
        registerNewStudent(snapshot.val(), req.body, res);
    });
});

app.post(`/${COURSES_KEY}`, (req, res) => {
    console.log("Received request to register new course.");

    const { branch, courseName, courseCode, credits } = req.body;

    dbReference.child(COURSES_KEY).child(branch).child(courseCode).set({
        courseName: courseName,
        code: code,
        credits: credits
    }, error => {
        if (!error) {
            console.log(`New Course added successfuly with code: ${courseCode}`);
            res.send(successMessage("Course registered successfuly"));
        } else {
            console.log(`There is some error: ${error}`);
            res.send(failureMessage('Something went wrong'));
        }
    })
});

function assignCourseToFaculty(email, courseCode, response) {
    dbReference.child(FACULTIES_KEY).child(email).child("courses").child(courseCode)
    .set(1, error => {
        if (!error) {
            response.send(successMessage("Course registered."))
        } else {
            response.send(failureMessage(error.message));
        }
    });
}

function registerNewStudent(classmates, newStudent, response) {
    console.log(`Registering new student: ${newStudent}`);

    const { name, batchYear, branch } = newStudent;
    
    let studentNumber = 1;
    if (classmates !== null) {
        studentNumber = Object.keys(classmates).length + 1;
    }
    if (studentNumber < 10) studentNumber = "00" + studentNumber;
    else if (studentNumber < 100) studentNumber = "0" + studentNumber;

    let rollNo = `I${branch.substring(0, 2)}${batchYear}${studentNumber}`.toLowerCase();
    newStudent["enrollmentNo"] = rollNo;
    newStudent["currentSem"] = "1";
    
    const collegeEmail = `${rollNo.toLowerCase()}@${COLLEGE_NAME}.ac.in`;
    const password = Math.round(Math.random() * 100000000).toString();
        
    admin.auth().createUser({
        name: name,
        email: collegeEmail,
        password: password
    }).then(function(userRecord) {
        dbReference.child(CURRENT_YEAR).child(branch).child(batchYear).child(rollNo).set(1);
        dbReference.child("students").child(rollNo).set(newStudent, error => {
            if (!error) {
                response.send(successMessage(`Registered with uid: ${userRecord.uid} password: ${password}`));
            } else {
                response.send(failureMessage(`Some error occured: ${error.message}`));
            }
        });
    }).catch(function(error) {
        response.send(failureMessage(error.message, error.code));
    });
}

function successMessage(message, code = 200) {
    return {
        code: code,
        message: message
    }
}

function failureMessage(message, code = 404) {
    return {
        code: code,
        message: message
    }
}

const port = 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
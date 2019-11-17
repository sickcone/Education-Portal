function onLoginClickHelper(email, password, userType) {
        
    firebase.auth().signInWithEmailAndPassword(email, password).then(response => {
        let dataObject, dataObjectBase64;

        switch (userType) {
            case 1:
                dataObject = {
                    enrollmentNo: email.substring(0, email.indexOf("@")),
                    userType: userType
                };
                dataObjectBase64 = btoa(JSON.stringify(dataObject));
                window.open(`/student/?data=${dataObjectBase64}`, '_top');
                break;
            case 2:
                dataObject = {
                    username: email.substring(0, email.indexOf("@")),
                    userType: userType
                }
                dataObjectBase64 = btoa(JSON.stringify(dataObject));
                window.open(`/faculty-feedbacks/?data=${dataObjectBase64}`, '_top');
                break;
            case 3:
                window.open(`/admin`, '_top');        
                break;
        }
        console.log("Loged in");
        
    }).catch(error => {
        if (error.code == "auth/user-not-found") {
            alert("Invalid Email");
        } else if (error.code == "auth/wrong-password") {
            alert("Wrong Password");
        } else {
            alert ("Invalid Credentials");
        }
        console.log(`error code: ${error.code} message: ${error.message}`);
    });
}
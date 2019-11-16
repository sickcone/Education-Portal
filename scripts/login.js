function onLoginClickHelper(email, password, userType = 1) {
        
    firebase.auth().signInWithEmailAndPassword(email, password).then(response => {
        let dataObject = {
            rollNo: email.substring(0, email.indexOf("@")),
            userType: userType
        };
        let dataObjectBase64 = btoa(JSON.stringify(dataObject));

        switch (userType) {
            case 1:
                window.open(`/student/?data=${dataObjectBase64}`, '_top');
                break;
            case 2:
                window.open(`/faculty/?data=${dataObjectBase64}`, '_top');
                break;
            case 3:
                window.open(`/admin/?data=${dataObjectBase64}`, '_top');        
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
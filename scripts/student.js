function onClickGradesHelper(enrollmentNo, currentSem = 1) {
    let dataObject = {
        enrollmentNo: enrollmentNo,
        currentSem: `sem${currentSem}`
    }
    console.log("on click grades helper");
    
    let dataObjectBase64 = btoa(JSON.stringify(dataObject));

    window.open(`/grades/?data=${dataObjectBase64}`, "_top");
}

function onClickFeedbackHelper() {
    
}
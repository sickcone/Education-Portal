function onChangeSemesterHelper(enrollmentNo, newSemester) {
    let dataObject = {
        enrollmentNo: enrollmentNo,
        currentSem: newSemester
    }
    console.log("Changed drop down value");
    
    let dataObjectBase64 = btoa(JSON.stringify(dataObject));

    window.open(`/grades/?data=${dataObjectBase64}`, "_top");
       
}
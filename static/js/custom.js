console.log('it\'s all super secure, don\'t try to mess with this website!!')

// function that checks if the password was repeated correctly on the registration website
function passwordCheck () {
    let pass1 = document.getElementById("pass1").value;
    let pass2 = document.getElementById("pass2").value;
    let passCheck = document.getElementById("passCheck")
    let ok = true;
    if (pass1 !== pass2) {
        document.getElementById("pass1").style.borderColor = "#E34234";
        document.getElementById("pass2").style.borderColor = "#E34234";
        ok = false;
       	passCheck.append(': the password was not entered correctly!')
       	passCheck.style.color = "#E34234"
    }
    return ok;
}


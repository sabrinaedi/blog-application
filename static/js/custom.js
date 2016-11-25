$(document).ready( function () {
    console.log('document ready')
    let date = document.getElementsByClassName('date')

    for (var i = date.length - 1; i >= 0; --i){
        date[i].innerHTML = document.getElementsByClassName('date')[0].innerHTML.substring(0, 25) + '</p>'
    }
})


// function that checks if the password was repeated correctly on the registration website
function passwordCheck () {
    let pass1 = document.getElementById("pass1").value;
    let pass2 = document.getElementById("pass2").value;
    let passCheck = document.getElementById("passCheck")
    let mailCheck = document.getElementById("emailCheck")
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
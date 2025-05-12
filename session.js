document.getElementById('identifier').value = "hogehoge";
button = document.getElementsByClassName('btn btn-info');
if (button.length > 0)button[0].click();
document.getElementById('password').value = "fugafuga";
if (button1.length > 0)setTimeout(() => {button[0].click();}, 1000);
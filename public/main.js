var userfile;

$(document).ready(function(){
		$("#Output").hide();
		$("#Test-case").hide();
    	$("#input-button").click(function(){
    		$("#Home").show();
        	$("#Output").hide();
        	$("#Test-case").hide();
    	}); 
    	$("#output-button").click(function(){
    		$("#Output").show();
        	$("#Home").hide();
        	$("#Test-case").hide();
    	});
    	$("#test-button").click(function(){
    		$("#Test-case").show();
    		$("#Home").hide();
    		$("#Output").hide();
    	});
    	setUpCodeMirror('');
	});



function showFileContent() {
	var file = document.getElementById('program_file').files[0];
	var reader = new FileReader();
	reader.onload = function(progressEvent){
	setUpCodeMirror(this.result);
	userfile = this.result;
	};
	reader.readAsText(file);
}


function getTestCases() {
	$.get('/testCases').done(function(response){
		var test_case = document.getElementById('test_case');
		test_case.innerHTML = response;
	});
}


function sendToServer(){
	$('#myModal').modal('toggle');
	var data = {
		content : userfile
	};
	$.post('/filecontent', data).done(function(response){
		var output = document.getElementById('output');
		output.innerHTML = response;
		getTestCases();
		//displayOutput();
	});
	
	$('#Home').hide();
	$('#Output').addClass('active');
	$('#Output').show();
	$('#myModal').modal('toggle');
}


function setUpCodeMirror(value) {
	//Codemirror
	document.getElementById('content').innerHTML = "";
	var myCodeMirror = CodeMirror(document.getElementById('content'), { 
		lineNumbers: true,
		mode: "clike",
		value: value,
		readOnly: true
	});

}


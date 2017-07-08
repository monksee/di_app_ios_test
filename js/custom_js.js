/**********************************************************
* Author: Sarah Monks
* Project: Dublin Inquirer App
* Date : 2016/10/01
*
* Description: This file contains javascript functions necessary for the Dublin Inquirer app
***********************************************************/
//declare global variables.
var deviceIsReady = false; //used to store phonegap deviceReady status


var images = [];
var soundcloud_widgets = [];
var internal_soundcloud_widgets = [];
var internal_soundcloud_iframe_widgets = [];
var youtubeVideos = [];
var profileImage;
var registrationImage;
var registrationAvatar = 1; //true
var engagePostImages = []; //upload images array

var engagePostImageURLs = []; //store the URLs of the engage images for when they need to be inserted to the gallery popup dynamically.
var engagePostImageIDs = []; //store the IDs of the engage images for when they need to be deleted.
var engagePostUserIDs = []; //store the IDs of the users who created each engage post.


var emailRegex;
var passwordRegex;
var displayNameRegex;
var phoneNumberRegex;
var subjectRegex;
var engageCommentRegex;
var engagePostRegex;
var searchQueryRegex;

var currentUserPrivilege;
var currentUserID;

//create global variables to store the count of engage posts and comments
var original_count_of_posts; 
var original_count_of_comments;
var setNewPostsChecker;
var currentIndex; //current image index for the engage popup gallery.
var lastImageIndex;//last image index for the engage popup gallery.

var animationInterval;
var displayNameAnimationInterval;
//need to declare a global variable for when generating comments for posts
//so that we can add listeners to the remove comment buttons.
var startingIndexForComments; 
var fb_email;

$(document).ready(function() {	
	
	$('#change_password_area').hide();
	$('#add_password_area').hide();

	//Our popup is defined outside of any "page", therefore we must instantiate the popup widget ourselves.
	$("#profile_pic_popup").enhanceWithin().popup();
	$("#engage_post_gallery_popup").enhanceWithin().popup();
	preparePhotoGalleryListeners();
	stopVideosOnLeavingPage();

	function googleAnalyticsTrackPage(id_of_page, alternative_name){
		$(document).on('pageshow',id_of_page,function(event, ui){
			try{
				ga_storage._trackPageview(id_of_page, alternative_name);
			}catch(err){
        			//error google analytics  + err
    			}
		});
	}
	
	googleAnalyticsTrackPage('#page-support', 'Support page');
	googleAnalyticsTrackPage('#page-engage', 'Engage page');
	googleAnalyticsTrackPage('#page-contribute', 'Contribute page');
	googleAnalyticsTrackPage('#page-read', 'Read page with categories listed');
	googleAnalyticsTrackPage('#page-account', 'Account page');

	googleAnalyticsTrackPage('#page-read-category-id-0', 'Search Results page');
	googleAnalyticsTrackPage('#page-read-category-id-1', 'City Desk list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-2', 'Unreal Estate list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-3', 'Arts Desk list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-5', 'The Dish list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-40', 'Opinion list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-3397', 'Premium list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-3264', 'On the Media list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-1797', 'Republic of Data list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-3071', 'Cycle Collision Tracker list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-1674', 'Podcasts list');				
	googleAnalyticsTrackPage('#page-read-category-id-2350', 'Fiction list of stories');
	googleAnalyticsTrackPage('#page-read-category-id-3238', 'Cartoons list of stories');

	$(document).on('pageshow','.read_story_page',function(event, ui){
		//when any of the individual story pages are clicked this is executed
		try{
		page = location.href.replace(/.*\//,'/');
		if(page.toLowerCase().indexOf('/index.html') >= 0){
			page = page.replace('/index.html', '');
			
		}
		var index = page.lastIndexOf("-");
		var page = page.substring(0, index + 1);
	
		if(page.toLowerCase().indexOf('#page-read-1-') >= 0){
			var alternative_name = 'City Desk Story';
		}else if(page.toLowerCase().indexOf('#page-read-2-') >= 0){
			var alternative_name = 'Unreal Estate Story';
		}else if(page.toLowerCase().indexOf('#page-read-3-') >= 0){
			var alternative_name = 'Arts Desk Story';	
		}else if(page.toLowerCase().indexOf('#page-read-5-') >= 0){
			var alternative_name = 'The Dish Story';
		}else if(page.toLowerCase().indexOf('#page-read-40-') >= 0){
			var alternative_name = 'Opinion Story';
		}else if(page.toLowerCase().indexOf('#page-read-3397-') >= 0){
			var alternative_name = 'Premium Story';
		}else if(page.toLowerCase().indexOf('#page-read-3264-') >= 0){
			var alternative_name = 'On the Media Story';			
		}else if(page.toLowerCase().indexOf('#page-read-1797-') >= 0){
			var alternative_name = 'Republic of Data Story';	
		}else if(page.toLowerCase().indexOf('#page-read-3071-') >= 0){
			var alternative_name = 'Cycle Collision Tracker Story';	
		}else if(page.toLowerCase().indexOf('#page-read-1674-') >= 0){
			var alternative_name = 'Podcast Story';	
		}else if(page.toLowerCase().indexOf('#page-read-2350-') >= 0){
			var alternative_name = 'Fiction Story';	
		}else if(page.toLowerCase().indexOf('#page-read-3238-') >= 0){
			var alternative_name = 'Cartoon Story';	
		}else{
			var alternative_name = '';	
		}
		ga_storage._trackPageview(page, alternative_name);
		}catch(err){
        		//error google analytics  + err
    		}
	});

	removeContributeFeedbackMessages(); 
	removeLoginAndRegistrationMessages();
	$('#remove_engage_images').hide();

	emailRegex =         /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	displayNameRegex =   /^([A-Za-z0-9\u00C0-\u017F .,\'\-]{3,25})$/; //must be between 3 and 25 characters and contain letters, numbers and some special symbols only.
	passwordRegex =      /^([A-Za-z0-9.,\-_$!]{10,14})$/; //must be between 10 and 14 characters and contain numbers, letters and the following symbols .,-_$!
	

	fullNameRegex =      /^([A-Za-z0-9\u00C0-\u017F .,\'\-]{3,50})$/; //must be between 3 and 50 characters and contain letters, numbers and some special symbols only
	phoneNumberRegex =   /^([0-9]{0,20})$/; //phone number must have maximum 20 digits. it can be zero as this field is unrequired 
	
	engageCommentRegex = /^(?:[A-Za-z0-9\u00C0-\u017F\u20AC\u2122\u2150\u00A9 \/.,\-_$!\'&*()="?#+%:;<>\[\]\r\r\n]|(?:\ud83c[\udf00-\udfff])|(?:\ud83d[\udc00-\ude4f\ude80-\udeff]))*$/; //required field. must be between 2 and 2000 characters and contain letters including unicode letters, numbers and some special symbols only.
	engagePostRegex =    /^(?:[A-Za-z0-9\u00C0-\u017F\u20AC\u2122\u2150\u00A9 \/.,\-_$!\'&*()="?#+%:;<>\[\]\r\r\n]|(?:\ud83c[\udf00-\udfff])|(?:\ud83d[\udc00-\ude4f\ude80-\udeff]))*$/; //required field. must be between 2 and 2000 characters and contain letters including unicode letters, numbers and some special symbols only.

	searchQueryRegex =   /^([A-Za-z0-9\u00C0-\u017F\u20AC\u2122\u2150\u00A9 \/.,\-_$!\'&*()="?#+%:;\[\]\r\r\n]{3,160})$/; 
	
	/*****************************************************************/
	//add a listener to detect when the phonegap deviceReady event fires
	//we cannot use any of phonegaps plugins before this event fires.
	//according to phonegap docs it fires sometime after document is ready 
	document.addEventListener("deviceready", onDeviceReady, false);

	//add other document event listeners
	document.getElementById("navicon").addEventListener('click', toggleSideMenu, false);	
	document.getElementById("logout_button").addEventListener('click', logOut, false);
	document.getElementById("remove_contribute_images").addEventListener('click', removeContributeImages, false);
	document.getElementById("remove_engage_images").addEventListener('click', removeEngageFormImages, false);
	document.getElementById("change_password_button").addEventListener('click', changePassword, false);
	document.getElementById("add_password_button").addEventListener('click', addPassword, false);
	document.getElementById("cancel_change_password").addEventListener('click', function(){closeChangePasswordArea('slide_up');}, false);
	document.getElementById("cancel_add_password").addEventListener('click', function(){closeAddPasswordArea('slide_up');}, false);

	document.getElementById("cancel_change_name").addEventListener('click', closeChangeDisplayNameArea, false);
	document.getElementById("edit_display_name").addEventListener('click', toggleEditDisplayName, false);

	document.getElementById("add_image_for_post").addEventListener('click', addImagesForEngagePost, false);

	$(".button_style").on('mouseup touchend', function(){
  		$(this).blur();
  	});

	
	//when focus is in the login_email input field listen for the enter key. if enter is pressed then put focus on the next
	//field ie the password field.
	moveToNextFieldOnEnter('login_email', 'login_password');
	moveToNextFieldOnEnter('registration_display_name', 'registration_email');
	moveToNextFieldOnEnter('registration_email', 'registration_password');
	moveToNextFieldOnEnter('registration_password', 'confirm_registration_password');
	moveToNextFieldOnEnter('current_password', 'new_password_first_time');
	moveToNextFieldOnEnter('new_password_first_time', 'new_password_second_time');
	moveToNextFieldOnEnter('password_first_time', 'password_second_time');

	//forgot password fields

	moveToNextFieldOnEnter('forgot_password_email', 'forgot_password_mob_select');

	//password reset fields
	moveToNextFieldOnEnter('password_reset_email', 'temporary_reset_password');
	moveToNextFieldOnEnter('temporary_reset_password', 'reset_password_new_password');
	moveToNextFieldOnEnter('reset_password_new_password', 'reset_password_confirm_password');

	//add contribute input listeners so that we can check if they press enter when input is in focus.
	//when enter is pressed we will programmatically put the next input field in focus
	prepareContributeInputListeners();

	function moveToNextFieldOnEnter(id_of_current_field, id_of_next_field){
		var current_field_selector = '#' + id_of_current_field;
		var next_field_selector = '#' + id_of_next_field;

		$(current_field_selector).on('keypress', function(e){
			if(e.which == 13){
				e.preventDefault();
				$(current_field_selector).blur();
				$(next_field_selector).focus();
			}
		});
	}

	function prepareContributeInputListeners(){
		for(i = 0; i < 4; i++){
			var current_input_field = 'contribute_input' + i;
			var next_input_field = 'contribute_input' + (i+1);
			
			moveToNextFieldOnEnter(current_input_field, next_input_field);

		}
	}
	
/*****************************************Functions for stopping Youtube videos programmatically*************************************/
	function pushAnyVideosOntoArray(ID_of_container){
		//call this function whenever we insert an iframe into the Document so that we can push the iframe into 
		//the global array youtubeVideos and then stop all videos on page change or when the app is closed i.e paused.
		var container_element = document.getElementById(ID_of_container);
		var number_of_youtube_iframes = container_element.getElementsByClassName("youtube_video_iframe").length;
		
		for(x= 0; x < number_of_youtube_iframes; x++){ 
			var youtube_iframe = container_element.getElementsByClassName("youtube_video_iframe")[x].contentWindow;
			youtubeVideos.push(youtube_iframe);
		}
	}

	function stopAllVideos(){
		for(x= 0; x < youtubeVideos.length; x++){ 
    			youtubeVideos[x].postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
		}
	}


	function stopVideosOnLeavingPage(){
		$(document).on("pageshow",".container",function(){
			//detect when a new page with class container is shown so that we can stop any iframes playing.					
			stopAllVideos();
		});
	}
/*****************************************Functions for stopping Soundcloud players programmatically*************************************/
	function createSoundCloudWidget(audio_ID, soundcloud_array){
		
		var widget = SC.Widget(document.getElementById(audio_ID));
		soundcloud_array.push(widget);
		return widget;
	}

	function stopAudioOnPageChange(audio_ID, soundcloud_array){
		var widget = createSoundCloudWidget(audio_ID, soundcloud_array);								
		
		widget.bind(SC.Widget.Events.PLAY, function() {
			$(document).on("pageshow",".container",function(){
				//detect when a new page with class container is shown so that we can stop this widget playing
  							
				widget.pause();
			});
		});
	}
	function stopInternalSoundcloudPlayersOnPageChange(number_of_soundcloud_players, object_id){
		if(number_of_soundcloud_players > 0){
			for(x=0; x < number_of_soundcloud_players; x++){
				var audio_ID = 'soundcloud_widget_internal_' + object_id + '_' + x;
				stopAudioOnPageChange(audio_ID, internal_soundcloud_widgets);
			}
		}
		
	}
	function stopInternalSoundcloudIframesOnPageChange(number_of_soundcloud_iframes, object_id){
		if(number_of_soundcloud_iframes > 0){
			for(x=0; x < number_of_soundcloud_iframes; x++){
				var audio_ID = 'soundcloud_iframe_' + object_id + '_' + x;
				stopAudioOnPageChange(audio_ID, internal_soundcloud_iframe_widgets);
			}
		}
		
	}
	function stopAllSoundcloudPlayers(){
		//this will be called when the app is paused in case there is anything still playing
		for(x=0; x < internal_soundcloud_widgets.length; x++){ 
			internal_soundcloud_widgets[x].pause();
		}
		for(x=0; x < soundcloud_widgets.length; x++){ 
			soundcloud_widgets[x].pause();
		}
		for(x=0; x < internal_soundcloud_iframe_widgets.length; x++){ 
			internal_soundcloud_iframe_widgets[x].pause();
		}
	}
/*****************************************Code for login registration functions*************************************/

//check if user token is in local storage
if(localStorage.getItem("usertoken") === null){
 	//if token is not in local storage then we go to the login page so the user can submit information.
	//there will be no token in local storage if the last time the user was using the app they clicked log out.
	//if there IS a token then the user did not log out last time they were in the app.
	
}else{
	//our initial page has the log in form so we hide that if a token is detected in local storage.
	hideLogInForm();
	//indicate to the user that something is loading
	$("#initial_loading_text").html('Loading...');
	//user token is in local storage so user is still logged in but we need to check that the token is valid. ie not been tampered with.
	//so we need to post it to the server side via ajax and check it there. 
	var token = localStorage.getItem("usertoken");	
	var params = {'usertoken': token};
	$.ajax({
      		
       		url: app_root_url + 'login_registration/user_processing.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
			$("#initial_loading_text").html('');
			var result = data;	
			//receive data back from server. consisting of a boolean token_is_valid which will be true or false after validation checks on server side.
			//and also a json string of user profile data for their profile page
				

			var userIsValid = result['valid_user']; 
			
			if(userIsValid){
				//the token is valid ie has not been tampered with so therefore the user is valid
				prepareAppAfterLogin(result);
				showLogInForm(); //inject login form to login page so it is there if the user presses log out.
			}else{
				//token is not valid. so delete token from local storage
				localStorage.clear();
				//then go to login page
				showLogInForm(); //inject login form to login page
				
				
				$("#container_wrapper").pagecontainer("change", "#page-login", {transition: 'none'});
			}
				
       		} //end success
		//if error then go to login page
		,
        	error: function(xhr, status, error) {
			$("#initial_loading_text").html('');
			alert("Error validating user token: " + error);
			//error checking validity of token so redirect to login page
			localStorage.clear();
			//then go to login page
			showLogInForm(); //inject login form to login page
			
			$("#container_wrapper").pagecontainer("change", "#page-login", {transition: 'none'});
							
		}

   	});//end ajax
}	


$("#log_in_form").on("submit", function(e){
	//console.log('form submitted');
	disableButton('#log_in_button', 'Logging in...');
	
	e.preventDefault();
	blurLoginFields();
	var login_email = $('#login_email').val();  
	var login_password = $('#login_password').val(); 

	//check lengths of values
	var email_length = login_email.length;
	var password_length = login_password.length;

	if(email_length < 2 || email_length == null || email_length > 254){
		
		var isEmailValid = false;
	}else{
		//length is valid
		var isEmailValid = validateInput(login_email, emailRegex);		
	}
	if(password_length < 10 || password_length == null || password_length > 14){
		
		var isPasswordValid = false;
	}else{
		//length is valid
		var isPasswordValid = validateInput(login_password, passwordRegex);	
	}
	if((!isPasswordValid) || (!isEmailValid)){
		if(!isEmailValid){
			
			displayError('login_error', 'The email address is not valid!');

		}else if(!isPasswordValid){
			displayError('login_error', 'Password must be between 10 and 14 characters and only contain numbers, letters and the following special characters .,-_$!');

		}
		enableButton('#log_in_button', 'Log In');
	}else{
		var params = { 'login_email' : login_email, 'login_password' : login_password};
    		$.ajax({
       			url: app_root_url + 'login_registration/user_processing.php',
			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       		
       			success: function(data){
				//enable log in button again
				enableButton('#log_in_button', 'Log In');
				resetRegistrationImage();

				//data will be the user details such as userID, display name, email
				var result = data;
				var exception_occurred = result.exception_occurred; 
				//console.log(exception_occurred);

				if(exception_occurred){
					var exception_message = 'Error: ' + result.exception_message;		

					displayError('login_error', exception_message);
				}else{
					var is_valid_encoding = result.is_valid_encoding;	

					if(is_valid_encoding){
					var fields_are_valid = result.fields_are_valid;	
					if(fields_are_valid){
						//first check if login is valid then get the username etc.
						var loginIsValid = result['valid_user']; 
        					if(loginIsValid){
							//successful login. remove login error in case it was displayed from before
							$('#login_error').html('');
							//console.log(JSON.stringify(result));
							$('#login_password_characters_remaining').html('');
							storeNewToken(result);
							prepareAppAfterLogin(result);
							
							
          					}else{	
							//login details are not valid so lets see if the email exists first
							var emailExists = result['email_exists']; //this will be true or false.. if its false then redirect to registration page
							if(emailExists){
								var userHasPassword = result['userHasPassword'];
								if(userHasPassword){
									//if the email exists and the user does have a password, then they must have entered wrong password. show error					
									displayError('login_error', 'Invalid Login!');
								}else{
									//user does not have a password therefore they will need to log in in the same way they signed up
									//we will tell them they have the option of adding a password in their account area after signing in with facebook
									//this wont happen now as we have taken out facebook login altogether.
									displayError('login_error', 'It appears you originally registered through facebook! Please log in through facebook and then you can add a password in your account area for future email and password login.');
								}
							}else{	
								//if email does not exist in our app database then point user to registration page
								displayError('login_error', 'This email does not exist in the system.<br>Please make sure your email is correct.<br>If you have not registered yet please <a class="inline_link normal_link" href="#page-registration">register here!</a>');
					
							}
          					}
					}else{
						//field not valid
						displayError('login_error', 'Error: Form data is not valid');
					
					}

					}else{
						//encoding not valid
						displayError('login_error', 'System error. Invalid encoding. Please contact support.');
			
					}

				}//end exception_occurred
       			} //end success
			,
        		error: function(xhr, status, error) {
				displayError('login_error', 'Error message: ' + error);
				//enable log in button again
				enableButton('#log_in_button', 'Log In');
							
			}
   		});//end ajax
	}	
});

$("#forgot_password_form").on("submit", function(e){
	removeForgotPasswordFormMessages(); 
	e.preventDefault();

	disableButton('#forgot_password_submit_button', 'Submitting...');
	var forgot_password_email = $('#forgot_password_email').val();  
	var forgot_password_mob = $('#forgot_password_mob_select').val();  

	var email_length = forgot_password_email.length;
	var forgot_password_mob_length =  forgot_password_mob.length;

	
	if(email_length < 2 || email_length == null || email_length > 254){
		
		var isEmailValid = false;
	}else{
		//length is valid
		var isEmailValid = validateInput(forgot_password_email, emailRegex);		
	}
	if(forgot_password_mob_length < 1 || forgot_password_mob_length == null || forgot_password_mob_length > 2){
		//check length of value
		var birthMonthIsValid = false;
	}else{
		if(forgot_password_mob < 1 || forgot_password_mob > 12){
			//check value itself
			var birthMonthIsValid = false;
		}else{
			var birthMonthIsValid = true;
		}
	}

	if((!birthMonthIsValid) || (!isEmailValid)){
		if(!isEmailValid){
			
			displayError('forgot_password_error', 'The email address is not valid!');

		}else if(!birthMonthIsValid){
			displayError('forgot_password_error', 'Birth month is not valid. Please select the month you were born from the drop down menu');
		
		}
		//enable button 
				
		enableButton('#forgot_password_submit_button', 'Submit');
	}else{
		var params = {'forgot_password_mob':forgot_password_mob, 'forgot_password_email': forgot_password_email};	

		//this registration email will need to be checked on the server side with the list of subscribers from stripe
    		$.ajax({
			url: app_root_url + 'login_registration/forgot_password_processing.php',
       			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       		
       			success: function(data){
				//firstly enable button again
					
				enableButton('#forgot_password_submit_button', 'Submit');
				
				var result = data;
				var email_exists = result.email_exists;	
				
				if(email_exists){
					var mob_is_valid = result.mob_is_valid;	
					if(mob_is_valid){
						//if a temporary password was inserted to the database successfully then we can tell the user here
						//that an email has been sent.
						//they should check their email where they will receive a temporary password. this should be pasted into the form 
						
						var successful_insert = result.successful_insert;	
						//successful insertion of temporary password and also successful sending password
						if(successful_insert){
							//check for successful sending email
							var message_sent = result.message_sent;
							if(message_sent){
								//successful insertion of temporary password and mailing password therefore redirect to appropriate page
								$("#container_wrapper").pagecontainer("change", "#page-password-reset", {transition: 'none'});	
								$('#container_wrapper').scrollTop(0);
								//console.log("message_sent" + message_sent);
							}else{
								//unexpected error. stored in database but message not sent. 
								//console.log("message_sent" + message_sent);
								displayError('forgot_password_error', 'Unexpected error sending password reset email. Please try again.');
							}
						}else{
							var exception_occured = result.exception_occured;
							if(exception_occured){
								var exception_message = result.exception_message;
								//unexpected error. not inserted to database or emailed
								displayError('forgot_password_error', 'Unexpected error. Error message: ' + exception_message);
								
							}else{
								
								//unexpected error. not inserted to database or emailed
								displayError('forgot_password_error', 'Unexpected error in password reset process. Please try again.');

							}						

						}	
							
							
						var temporary_password = result.temporary_password;		
						//console.log("email_exists" + email_exists);
						//console.log(" temporary_password" +  temporary_password);
					}else{
						//attempt was not stored in database because month of birth invalid.
						displayError('forgot_password_error', 'Birth month is incorrect. Please try again');
					
					}
				}else{
					
					displayError('forgot_password_error', 'This email does not exist in the system.<br>Please make sure your email is correct.<br>If you have not registered yet please <a class="inline_link normal_link" href="#page-registration">register here!</a>');
					

				}

			}//end success
			,
        		error: function(xhr, status, error) {
				displayError('forgot_password_error', 'Error message: ' + error);
				//enable 
				enableButton('#forgot_password_submit_button', 'Submit');
							
			}
		});//end ajax
	}
});
$("#password_reset_form").on("submit", function(e){
	//console.log('form submitted');
	e.preventDefault();
	disableButton('#password_reset_submit_button', 'Resetting...');

	var password_reset_email = $('#password_reset_email').val();  
	var temporary_reset_password = $('#temporary_reset_password').val();  
	var reset_password_new_password = $('#reset_password_new_password').val();  
	var reset_password_confirm_password = $('#reset_password_confirm_password').val();  


	var password_reset_email_length = password_reset_email.length;
	var temporary_reset_password_length =  temporary_reset_password.length;
	var reset_password_new_password_length =  reset_password_new_password.length;
	var reset_password_confirm_password_length =  reset_password_confirm_password.length;



	if(password_reset_email_length < 2 || password_reset_email_length == null || password_reset_email_length > 254){
		
		var isEmailValid = false;
	}else{
		//length is valid
		var isEmailValid = validateInput(password_reset_email, emailRegex);		
	}
	if(temporary_reset_password_length < 10 || temporary_reset_password_length == null || temporary_reset_password_length > 14){
		
		var temporaryPasswordIsValid = false;
	}else{
		//length is valid
		var temporaryPasswordIsValid = validateInput(temporary_reset_password, passwordRegex);	
	}
	if(reset_password_new_password_length < 10 || reset_password_new_password_length == null || reset_password_new_password_length > 14){
		
		var newPasswordIsValid = false;
	}else{
		//length is valid
		var newPasswordIsValid = validateInput(reset_password_new_password, passwordRegex);	
	}



	if(reset_password_new_password == reset_password_confirm_password){
		if((!isEmailValid) || (!temporaryPasswordIsValid)|| (!newPasswordIsValid)){
			if(!isEmailValid){
				
				displayError('password_reset_error', 'This email address is not valid.');
		

			}else if(!temporaryPasswordIsValid){
				displayError('password_reset_error', 'Temporary password is not valid');
		
			}else if(!newPasswordIsValid){
				displayError('password_reset_error', 'New password not valid. Password must be between 10 and 14 characters and only contain numbers, letters and the following special characters .,-_$!');
		
			}
			enableButton('#password_reset_submit_button', 'Reset password');

		}else{
			//all fields valid 
			var params = { 'new_password' : reset_password_new_password, 'email' : password_reset_email, 'temporary_password' :  temporary_reset_password};	

			//this registration email will need to be checked on the server side with the list of subscribers from stripe
    			$.ajax({
				url: app_root_url + 'login_registration/reset_password.php',
       				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
       		
       				success: function(data){
					//firstly enable button again
					
					enableButton('#password_reset_submit_button', 'Reset password');
				
					var result = data;
					var exception_occurred = result.exception_occurred;	
				
					if(exception_occurred){
						var exception_message = result.exception_message;	
						displayError('password_reset_error', 'Unexpected error. Please try again or contact support if error persists.');
		
				
					}else{
						//check if email was found in the password_change_requests table.
						//if it wasnt found it will mean the temporary password has expired or else the email is invalid.
						var email_was_found = result.email_was_found;
				
						if(email_was_found){
							
							var request_is_expired = result.request_is_expired;
							if(request_is_expired){
								//console.log("request_is_expired " + request_is_expired);
								displayError('password_reset_error', 'Your password reset request has expired. Requests expire after 20 minutes. <br>Please use the <a class="inline_link normal_link" href="#page-forgot-password">forgotten password</a> form again to make a new request');
				
							}else{
								//console.log("request_is_expired " + request_is_expired);	
								var temporary_password_is_valid = result.temporary_password_is_valid;
								if(temporary_password_is_valid){
									var successful_update = result.successful_update;
									if(successful_update){
										var successful_update = result.successful_update;
										//console.log("successful_update" + successful_update);
										//password reset successfully. link to enter app
										$("#container_wrapper").pagecontainer("change", "#page-password-reset-confirmation", {transition: 'none'}).promise().done(function(){ 
											$('#container_wrapper').scrollTop(0);
											window.page_transition_animation_counter = 0;
											window.transitionAnimationInterval = setInterval(function(){transitionToHomeAfterPasswordReset(result);}, 1500); 
											
											//store usertoken in local storage
											storeNewToken(result);
										});

									}else{
										displayError('password_reset_error', 'Unexpected error. Password not reset. Please use the <a class="inline_link normal_link" href="#page-forgot-password">forgotten password</a> form again or contact support if the error persists.');
		

									}
								}else{
									//temporary password not valid
									//communicate to the user that if they made mulitple requests they must use the most recent temp password
									displayError('password_reset_error', 'Temporary password is not valid. <br>Note: If you have made mulitple requests for a password reset, please use the most recent temporary password you received.');
		
								}
							}					
						}else{
							displayError('password_reset_error', 'There are no password requests on record for this email address. <br>Please make sure the email address you entered is correct or use the <a class="inline_link normal_link" href="#page-forgot-password">forgotten password</a> form again to make a new request.');
				
						}

					}
				}//end success
				,
        			error: function(xhr, status, error) {
					displayError('password_reset_error', 'Error message: ' + error);
					//enable 
					enableButton('#password_reset_submit_button', 'Reset password');
							
				}

			});//end ajax


		}
	}else{
		//new passwords do not match
		
		displayError('password_reset_error', 'The new passwords entered do not match. Please try again!');	
		enableButton('#password_reset_submit_button', 'Reset password');

	}

	
});

function transitionToHomeAfterPasswordReset(result){
	//console.log("animation");
	if(window.page_transition_animation_counter == 1){
		prepareAppAfterLogin(result);
		clearInterval(window.transitionAnimationInterval);
	}
	window.page_transition_animation_counter++;
}
$("#registration_form").on("submit", function(e){
	//console.log('form submitted');
	e.preventDefault();

	disableButton('#registration_button', 'Please wait...');

	blurRegistrationFields();
	var registration_email = $('#registration_email').val();  
	var registration_password = $('#registration_password').val(); 
	var registration_password_confirmation = $('#confirm_registration_password').val(); 
	var registration_display_name = $('#registration_display_name').val(); 
	var registration_mob_select = $('#registration_mob_select').val(); 

	//check lengths of values
	var email_length = registration_email.length;
	var password_length = registration_password.length;
	var display_name_length = registration_display_name.length;
	var registration_mob_length = registration_mob_select.length;

	if(email_length < 2 || email_length == null || email_length > 254){
		
		var isEmailValid = false;
	}else{
		//length is valid
		var isEmailValid = validateInput(registration_email, emailRegex);		
	}
	if(password_length < 10 || password_length == null || password_length > 14){
		
		var isPasswordValid = false;
	}else{
		//length is valid
		var isPasswordValid = validateInput(registration_password, passwordRegex);	
	}
	if(display_name_length < 3 || display_name_length == null || display_name_length > 25){
		
		var isDisplayNameValid = false;
	}else{
		//length is valid
		var isDisplayNameValid = validateInput(registration_display_name, displayNameRegex);
	}
	if(registration_mob_length < 1 || registration_mob_length == null || registration_mob_length > 2){
		//check length of value
		var birthMonthIsValid = false;
	}else{
		if(registration_mob_select < 1 || registration_mob_select > 12){
			//check value itself
			var birthMonthIsValid = false;
		}else{
			var birthMonthIsValid = true;
		}
	}
	//console.log(registration_mob_select);
	if(registration_password == registration_password_confirmation){
		if((!isDisplayNameValid) || (!isEmailValid) || (!isPasswordValid)|| (!birthMonthIsValid)){
			if(!isEmailValid){
				
				displayError('registration_feedback_message', 'This email address is not valid.');
		

			}else if(!isPasswordValid){
				displayError('registration_feedback_message', 'Password must be between 10 and 14 characters and only contain numbers, letters and the following special characters .,-_$!');
		
			
			}else if(!isDisplayNameValid){
			
				displayError('registration_feedback_message', 'Display name is not valid. It must be between 3 and 25 characters and contain only letters, numbers and the following special characters .,\'-');
			}else if(!birthMonthIsValid){
				displayError('registration_feedback_message', 'Birth month is not valid. Please select the month you were born from the drop down menu');
		

			}
			enableButton('#registration_button', 'Create account');			
		}else{
			//all values have passed validation testing
			$('#registration_feedback_message').removeClass('error_message');
			$('#registration_feedback_message').html('Please wait...');

			var params = { 'registration_email' : registration_email, 'registration_password' : registration_password , 'registration_display_name' :  registration_display_name, 'app_root_url':app_root_url, 'registration_mob_select':registration_mob_select};	

			//this registration email will need to be checked on the server side with the list of subscribers from stripe
    			$.ajax({
				url: app_root_url + 'login_registration/registration_processing.php',
       				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
       		
       				success: function(data){
					//firstly enable create account button again
					
					enableButton('#registration_button', 'Create account');
					
					var result = data;
					var is_valid_encoding = result.is_valid_encoding;	
					
					if(is_valid_encoding){
						var fields_are_valid = result.fields_are_valid;	
						if(fields_are_valid){
							var exception_occurred = result.exception_occurred;	
							if(exception_occurred){
								var emailAlreadyExists = result.email_already_exists; 
								if(emailAlreadyExists){
									displayError('registration_feedback_message', 'This email already exists in the system. If you already have an account please <a class="normal_link" href="#page-login">login here!</a>');
					
								}else{
									var exception_message = 'Error: ' + result.exception_message;
									displayError('registration_feedback_message', exception_message);
								}
							}else{
								var emailAlreadyExists = result.email_already_exists; 
								if(emailAlreadyExists){
									//email already exists in our database and therefore the user is already registered so should use the login form
									//email already exists. if you already have an account then login here.
								
										displayError('registration_feedback_message', 'This email already exists in the system. If you already have an account please <a class="normal_link" href="#page-login">login here!</a>');
				
								}else{
									//email does not already exist in our database
									var userIsSubscriber = result.user_is_subscriber; 
						
									if(!userIsSubscriber){
										//this email address does not exist in the subscribers database
										//therefore this user is not a paying subscriber so needs to be redirected to the website in order to subscribe
					
										var error_message = 'This email address does not exist in the subscribers database. <br>Please visit <a id="link_to_subscribe" href="http://www.dublininquirer.com/subscribe">Dublin Inquirer</a> to subscribe before registering with the app. <br> Note: If you have just setup a subscription, please wait at least 3 minutes before registering with the app.';
										$('#registration_feedback_message').addClass('error_message');
										$('#registration_feedback_message').html('<i class="fa fa-exclamation-triangle" ></i> ' + error_message);
										$('#link_to_subscribe').click( function(e) { 
  											e.preventDefault();
											
											var href = $(this).attr('href');
											var ref = window.open(href, '_blank', 'location=yes,resizable=1');
										});
									}else{
										//successful registration. remove registration error in case it was displayed from before
										$('#registration_feedback_message').html('');
										//on succcessful registration remove all registration form values. except for the image as this has not been uploaded yet.
										resetRegistrationFormValues();
										//user is subscriber and therefore has now been registered 
										storeNewToken(result);
										prepareAppAfterLogin(result);
										
										//alert(registrationAvatar);
										//alert(result.userID);
										if(registrationAvatar == 1){
											//registrationAvatar is set in addRegistrationPicture()
											//avatar is true therefore we do not need to upload image 
											
											
										}else{
											//therefore registrationAvatar has been set to 0 in addRegistrationPicture()
											//meaning the user has chosen to upload a registration picture
											//now we need to call the file transfer method to upload the profile pic.
											var userID = result.userID; 
											var token = result.usertoken
											uploadRegistrationPic(userID, token);	
											
										}
									}
								}
							}
						}else{
							//field not valid
							displayError('registration_feedback_message', 'Error: Form data is not valid');
					
						}

					}else{
						//encoding not valid
						displayError('registration_feedback_message', 'System error. Invalid encoding. Please contact support.')
					
					}

				}//end success
				,
        			error: function(xhr, status, error) {
					displayError('registration_feedback_message', 'Error message: ' + error);
					//enable create account button again
					enableButton('#registration_button', 'Create account');
							
				}
   			});//end ajax
		}
	}else{
		//registration passwords do not match
		$('#registration_password').val(''); 
		$('#confirm_registration_password').val('');
		$('#registration_password_characters_remaining').html('');
		$('#confirm_registration_password_characters_remaining').html('');
		displayError('registration_feedback_message', 'The passwords entered do not match. Please try again!');	
		enableButton('#registration_button', 'Create account');

	}
});


$("#change_password_form").on("submit", function(e){
	disableButton("#confirm_change_password", "Changing password...");
	//console.log($("#hidden_input_for_email").val());
	
	e.preventDefault();
	var current_password = $('#current_password').val(); 
	//console.log(current_password);
	var new_password_first = $('#new_password_first_time').val(); 
	//console.log(new_password_first);
	var new_password_second = $('#new_password_second_time').val();
	//console.log(new_password_second);

	if(new_password_first == new_password_second){
			//check lengths of values
			var current_password_length = current_password.length;
			var new_password_first_length = new_password_first.length;

			if(current_password_length < 10 || current_password_length == null || current_password_length > 14){
		
				var isCurrentPasswordValid = false;
			}else{
				//length is valid
				var isCurrentPasswordValid = validateInput(current_password, passwordRegex);	
			}

			if(new_password_first_length < 10 || new_password_first_length == null || new_password_first_length > 14){
		
				var isNewPasswordValid = false;
			}else{
				//length is valid
				var isNewPasswordValid = validateInput(new_password_first, passwordRegex);
			}	
			
		if((!isCurrentPasswordValid) || (!isNewPasswordValid)){
			if(!isCurrentPasswordValid){
		
				displayError('change_password_error_message', 'Current password is invalid. Password must be between 10 and 14 characters and only contain numbers, letters and the following special characters .,-_$!');

			}else if(!isNewPasswordValid){

				displayError('change_password_error_message', 'New password is invalid. Password must be between 10 and 14 characters and only contain numbers, letters and the following special characters .,-_$!');
			}
			enableButton("#confirm_change_password", "Change Password");	
		}else{
			//passwords contain valid characters and are the right length
			var email_address = $("#hidden_input_for_email").val();
			var token = localStorage.getItem("usertoken");	
			var params = {'usertoken': token, 'email_address': email_address, 'current_password' : current_password, 'new_password' : new_password_first};
				
			$.ajax({
       				url: app_root_url + 'login_registration/change_password.php',
       				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
   
       				success: function(data){
					enableButton("#confirm_change_password", "Change Password");	
					var result = data;
					
					var token_is_valid = result.token_is_valid; 
					var new_password_is_set = result.newPasswordIsSet; 
					var unexpected_error = result.unexpected_error; 
					var valid_user = result.valid_user; 
					
					if(token_is_valid){
						if(unexpected_error){
							//required post details were not set.
							resetChangePasswordFormValues();
							
							displayError('change_password_error_message', 'System error: There was a problem changing your password!');
						
						}else{

							var is_valid_encoding = result.is_valid_encoding;	

							if(is_valid_encoding){
								var fields_are_valid = result.fields_are_valid;	
								if(fields_are_valid){
	
									if(valid_user){
        									if(new_password_is_set){
											//current password matched successfully and new password was set successfully
											$('#change_password_success_message').show();
											$('#change_password_success_message').addClass('fadeInAndOutAgain');
											window.animation_counter = 0;
											animationInterval = setInterval(function(){stopAnimation('change_password_success_message');}, 2500); 
											closeChangePasswordArea('hide');
										}else{
											//although user details were correct, there was an error when updating password on the backend
											resetChangePasswordFormValues();
						
											displayError('change_password_error_message', 'System error: We\'re sorry but there was a problem changing your password!');
								
										}
									}else{
										//user entered the wrong current password.
										//this will also happen if a user has made offer 6 invalid attempts to protect against brute force attacks
										resetChangePasswordFormValues();
						
										displayError('change_password_error_message', 'The current password you entered was incorrect!');
							
						
									}
								}else{
									//fields not valid
									displayError('change_password_error_message', 'Error: Form data is not valid');
					
								}

							}else{
								//encoding not valid
								displayError('change_password_error_message', 'System error. Invalid encoding. Please contact support.')
					
							}


	
						}
					}else{
						//problem with JWT token
						resetChangePasswordFormValues();
						
						displayError('change_password_error_message', 'System error: There was a problem changing your password!');
					
					}
       				} //end success
				,
        			error: function(xhr, status, error) {
					enableButton("#confirm_change_password", "Change Password");	
					var error_message = 'There was a problem changing your password! System error: ' + error;
					resetChangePasswordFormValues();
					
					displayError('change_password_error_message', error_message);
							
				}
   			});//end ajax
		}
	}else{
		//new passwords do not match
		$('#new_password_first').val(''); 
		$('#new_password_second').val('');
		displayError('change_password_error_message', 'The new passwords entered do not match. Please try again!');
		enableButton("#confirm_change_password", "Change Password");	
	}
});

$("#add_password_form").on("submit", function(e){
	e.preventDefault();
	
	var password_first = $('#password_first_time').val(); 
	var password_second = $('#password_second_time').val();

	if(password_first == password_second){
		var password_first_length = password_first.length;
		if(password_first_length < 10 || password_first_length == null || password_first_length > 14){
			var isNewPasswordValid = false;
		}else{
			//length is valid
			var isNewPasswordValid = validateInput(password_first, passwordRegex);
		}		

		if(!isNewPasswordValid){
		
			displayError('add_password_error_message', 'New password is invalid. Password must be between 10 and 14 characters and only contain numbers, letters and the following special characters .,-_$!');
			
		}else{
			//passwords contain valid characters and are the right length
			var email_address = $("#hidden_input_for_email").val();
			var token = localStorage.getItem("usertoken");	
			var params = {'usertoken': token, 'email_address': email_address, 'new_password' : password_first};
				
			$.ajax({
       				url: app_root_url + 'login_registration/add_password.php',
       				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
   
       				success: function(data){
					var result = data;
					
					var token_is_valid = result.token_is_valid; 
					var new_password_is_set = result.newPasswordIsSet; 
					var unexpected_error = result.unexpected_error; 
					var valid_user = result.valid_user; 
					
					if(token_is_valid){
						if(unexpected_error){
							//required post details were not set.
							resetAddPasswordFormValues();
						
							displayError('add_password_error_message', 'System error: There was a problem adding your password!');
						
						}else{
							//valid user will only be set if unexpected error did not occur
							if(valid_user){
        							if(new_password_is_set){
									//new password was set successfully
									$('#add_password_success_message').show();
									$('#add_password_success_message').addClass('fadeInAndOutAgain');
									window.animation_counter = 0;
									animationInterval = setInterval(function(){stopAnimation('add_password_success_message');}, 2500); 
									closeAddPasswordArea('hide');
									$('#add_password_button').hide();
									$('#change_password_button').show();
								}else{
									//although user details were correct, there was an error when updating password on the backend
									resetAddPasswordFormValues();
						
									displayError('add_password_error_message', 'System error: We\'re sorry but there was a problem adding your password!');
								
								}
							}else{
								// user already has a password so unexpected error
								resetAddPasswordFormValues();
						
								displayError('add_password_error_message', 'Unexpected error adding password. Please contact support!');
							
						
							}
						}
					}else{
						//problem with JWT token
						resetAddPasswordFormValues();
					
						displayError('add_password_error_message', 'System error: There was a problem changing your password!');
					
					}
       				} //end success
				,
        			error: function(xhr, status, error) {
					var error_message = 'There was a problem adding your password! System error: ' + error;
					resetAddPasswordFormValues();
					displayError('add_password_error_message', error_message);
							
				}	
   			});//end ajax
		}
	}else{
		//new passwords do not match
		$('#password_first').val(''); 
		$('#password_second').val('');
		displayError('add_password_error_message', 'The new passwords entered do not match. Please try again!');	
	}
});


$("#change_display_name_form").on("submit", function(e){
	blurDisplayNameFields();
	disableButton("#confirm_change_name", "Saving...");
	e.preventDefault();
	var current_display_name = $("#hidden_input_for_display_name").val();
	var new_display_name = $("#change_display_name_input_field").val();

	if(current_display_name == new_display_name){
		//display name is the same as before so we do not need to update the database
		closeChangeDisplayNameArea();
		enableButton("#confirm_change_name", "Save");
	}else{
		

		//check lengths
		var current_display_name_length = current_display_name.length;
		if(current_display_name_length < 3 || current_display_name_length == null || current_display_name_length > 25){
			//unexpected error. this should not happen becuase its coming from a hidden input field.
			displayError('change_display_name_error_message', 'System error. Could not retrieve current display name. Please contact support');
			enableButton("#confirm_change_name", "Save");			
		}else{
			//current_display_name_length is valid
			var new_display_name_length = new_display_name.length;
			if(new_display_name_length < 3 || new_display_name_length == null || new_display_name_length > 25){
				var isNewDisplayNameValid = false;
			}else{
				//length is valid
				var isNewDisplayNameValid = validateInput(new_display_name, displayNameRegex);
			}		
			if(!isNewDisplayNameValid){
				displayError('change_display_name_error_message', 'Display name is not valid. It must be between 3 and 25 characters and contain only letters, numbers and the following special characters .,\'-');
				enableButton("#confirm_change_name", "Save");
			}else{

				//new display name is different to current one and also contains valid characters
				var token = localStorage.getItem("usertoken");	
				var params = {'usertoken': token, 'new_display_name': new_display_name};
			
				$.ajax({
       					url: app_root_url + 'user_profile/update_display_name.php',
       					data: JSON.stringify(params), 
					type: "POST",
					dataType: "json",
					contentType: "application/json;charset=utf-8",
       					success: function(data){
						var result = data;
				
						var token_is_valid = result.token_is_valid; 
						var successful_update = result.successful_update; 
						var userDetails = result.userDetails; 
						
						if(token_is_valid){
							var required_fields_set = result.required_fields_set;
							if(required_fields_set){

								var new_display_name_is_valid = result.new_display_name_is_valid;

								if(new_display_name_is_valid){

									if(successful_update){
						
										var engagePosts = result.engagePosts; //an array of posts
										var current_user_privilege = userDetails.user_privilege;
										var current_user_id = userDetails.userID;
										var number_of_posts = result.number_of_posts; //the number of posts from the engage section.
										var total_number_of_comments = result.total_number_of_comments; //the number of comments from the engage section.
								
										var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.

										//need to pass in the current users user_privilege id to prepareEngagePosts so that we know whether to add a delete button beside each post and comment
										prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images);

        									generateUserProfilePage(userDetails);
									
										$('#change_display_name_success_message').show();
										$('#change_display_name_success_message').addClass('fadeInAndOutAgain');
										window.display_name_animation_counter = 0;

										displayNameAnimationInterval = setInterval(function(){stopDisplayNameAnimation();}, 2500); 
										closeChangeDisplayNameArea();
										enableButton("#confirm_change_name", "Save");
									}else{
										enableButton("#confirm_change_name", "Save");
										//unexpected error setting the display name in database
										resetChangeDisplayNameFormValues();
						
										displayError('change_display_name_error_message', 'System error: There was a problem changing your display name!');

									}
								}else{
									enableButton("#confirm_change_name", "Save");
									//display name not valid
									resetChangeDisplayNameFormValues();
						
									displayError('change_display_name_error_message', 'Display name is not valid. It must be between 3 and 25 characters and contain only letters, numbers and the following special characters .,\'-');

								}
							}else{
								enableButton("#confirm_change_name", "Save");
								//fields not set
								resetChangeDisplayNameFormValues();
					
								displayError('change_display_name_error_message', 'Unexpected error: Fields not set. Please contact support!');

							}
						
						}else{
							enableButton("#confirm_change_name", "Save");
							//problem with JWT token
							resetChangeDisplayNameFormValues();
							displayError('change_display_name_error_message', 'System error: There was a problem changing your display name!');
						}
       					} //end success
					,
        				error: function(xhr, status, error) {
						enableButton("#confirm_change_name", "Save");
						var error_message = 'There was a problem changing your display name! System error: ' + error;
						resetChangeDisplayNameFormValues();
						displayError('change_display_name_error_message', error_message);
							
					}
   				});//end ajax
			}
		}//end if statement current_display_name_length
	}
});

/*****************************************General Functions for forms**********************************/
$(document).on("pageshow",".container",function(){
	//detect when a new page with class container is shown 
  	$('#container_wrapper').scrollTop(0);
	
	closeAddPasswordArea('hide');
	closeChangePasswordArea('hide');

	
	//remove popovers whenever a page is changed
	removePostPopover();	
	removeSearchPopover();	
	
	removePopover('#login_email_feedback_area');
	removePopover('#login_password_feedback_area');
	removePopover('#contribute_full_name_feedback_area');
	removePopover('#contribute_phone_feedback_area');
	removePopover('#contribute_message_feedback_area');
});


function stopAnimation(ID_of_message){
	var ID_selector = '#' + ID_of_message;
	if(window.animation_counter == 1){
		$(ID_selector).slideUp(300);
		$(ID_selector).removeClass('fadeInAndOutAgain');
		clearInterval(animationInterval);
	}
	window.animation_counter++;
}


//validate input fields (as they are being typed in) and show a popover if input is not valid.

validateInputOnTyping('registration_display_name', displayNameRegex, '#registration_display_name_feedback_area');
validateInputOnTyping('registration_email', emailRegex, '#registration_email_feedback_area');
validateInputOnTyping('confirm_registration_password', passwordRegex, '#confirm_registration_password_feedback_area');
validateInputOnTyping('registration_password', passwordRegex, '#registration_password_feedback_area');
validateInputOnTyping('login_email', emailRegex, '#login_email_feedback_area');
validateInputOnTyping('login_password', passwordRegex, '#login_password_feedback_area');


validateInputOnTyping('forgot_password_email', emailRegex, '#forgot_password_feedback_area');

validateInputOnTyping('password_reset_email', emailRegex, '#password_reset_email_feedback_area');
validateInputOnTyping('reset_password_new_password', passwordRegex, '#reset_password_new_password_feedback_area');
validateInputOnTyping('reset_password_confirm_password', passwordRegex, '#reset_password_confirm_password_feedback_area');


function validateMessageInput(inputID, popover_feedback_area){
	//function for validating mainly the message field of the contribution form and showing or hiding the popover
	
	$('#' + inputID).on('keyup keypress blur change', function(){
		//store the value of our input field into a javascript variable called inputValue
		var inputValue = document.getElementById(inputID).value;
		var input_length = inputValue.length;
		//min length of message is 20 and max length is 7000
		if(input_length < 20 || input_length > 7000){
			if(!$(popover_feedback_area).hasClass('isShowing')){
				//if our popover error does not have class isShowing then do the following
				//show popover and add class isShowing to the element.
				$(popover_feedback_area).fadeIn(100);	
				$(popover_feedback_area).addClass('isShowing');
			}
		}else{
			if($(popover_feedback_area).hasClass('isShowing')){
				//if our popover error has class isShowing then do the following
				//hide popover and remove isShowing class.
				$(popover_feedback_area).hide();
				$(popover_feedback_area).removeClass('isShowing');
			}
		}
	});
}


function validateInputOnTyping(inputID, regularExpression, popover_feedback_area){
	//function for validating fields and showing or hiding appropriate popover
	//we listen for the following events on the input field or textarea.
	//'keyup', 'keypress', 'blur', 'change' 

	$('#' + inputID).on('keyup keypress blur change', function(){
		//store the value of our input field into a javascript variable called inputValue
		var inputValue = document.getElementById(inputID).value;


		//use the javascript test() function to test our inputValue against the appropriate regular expression.
		//Store the boolean result into the variable isInputValid
		var isInputValid = regularExpression.test(inputValue);
	
		if(!isInputValid){  
		//If input is not valid go here
			if(!$(popover_feedback_area).hasClass('isShowing')){
				//if our popover error does not have class isShowing then do the following
				//show popover and add class isShowing to the element.
				$(popover_feedback_area).fadeIn(100);	
				$(popover_feedback_area).addClass('isShowing');
			}
			//else if our popover error is already showing then leave it showing (ie do nothing here).
		}else{
		//If input is valid go here
			if($(popover_feedback_area).hasClass('isShowing')){
				//if our popover error has class isShowing then do the following
				//hide popover and remove isShowing class.
				$(popover_feedback_area).hide();
				$(popover_feedback_area).removeClass('isShowing');
			}
			//else if our popover error is already hidden then leave it hidden.
		}
	});
}
function validateInput(inputValue, regularExpression){
	//function for validting input field after form is submitted and before ajax request is made
	var inputIsValid = regularExpression.test(inputValue);
	return inputIsValid;
}

function showCharatcerCount(id_of_input_field, id_of_character_remaining_area, max_characters){
	$(id_of_input_field).on('keypress keydown keyup', function(){
		var input_text = $(id_of_input_field).val();
		var length_of_input_text = input_text.length;
		var remaining_characters = max_characters-length_of_input_text;
		$(id_of_character_remaining_area).html(remaining_characters + ' characters remaining');	
	});	
}
//functions for enabling and disabling form submission buttons so that multiple ajax requests are not performed simultaneously.
function enableButton(id_of_button, button_enabled_value){
	$(id_of_button).val(button_enabled_value);  
	$(id_of_button).html(button_enabled_value);  
	$(id_of_button).removeAttr('disabled');
}
function disableButton(id_of_button, button_disabled_value){
	$(id_of_button).val(button_disabled_value);  
	$(id_of_button).html(button_disabled_value); 
	$(id_of_button).attr('disabled','disabled');
}
function displayError(ID_of_error_element, error_message){
	//this is used for login, registration, change password, change display name, add password and contribution forms
	var ID_selector = '#' + ID_of_error_element;
	$(ID_selector).addClass('error_message');
	$(ID_selector).html('<i class="fa fa-exclamation-triangle" ></i> ' + error_message);
	
}
/**************************Popover styling******************************/
$('.large_feedback_area').on('click', function(){
	$(this).hide(); 
	
	$(this).removeClass('isShowing');	
});
$('.small_feedback_area').on('click', function(){
	$(this).hide(); 
	
	$(this).removeClass('isShowing');	
});
$('.medium_feedback_area').on('click', function(){
	$(this).hide(); 
	
	$(this).removeClass('isShowing');	
});

function removePopover(popover_feedback_area){
	$(popover_feedback_area).hide();
	$(popover_feedback_area).removeClass('isShowing');

}


/*****************************************JQUERY for styling for Contribution form*************************************************/
/*listen for a 'keypress' or a 'focus' event on input and textarea fields
 *and when it detects these events it hides the form-message paragraph.
*/

$('#contribute_input0, #contribute_input1, #contribute_input2, #contribute_input3, #contribute_input4').on('keypress focus', function(){
	//whenever focus is put on an input field in the contribute form we remove the feedback messages from any previous form submission
	removeContributeFeedbackMessages(); 
	
});

function removeContributeFeedbackMessages(){
	$("#contribute_feedback_message").html(''); 
	$("#contribute_feedback_message").removeClass('error'); 
	
}

function displayContributionSuccessfulMessage(){
	$("#progress_bar").hide();
	$("#contribute_feedback_message").removeClass('error'); 
	$("#contribute_feedback_message").html(''); 
	
}

function displayContributionErrorMessage(error_message){
	$("#progress_bar").hide();
	$("#contribute_feedback_message").addClass('error'); 
	$("#contribute_feedback_message").html(error_message); 
	
}
function resetContributionFormValues(){
	removeContributeImages();
	$('#contribute_input2').val('');
	$('#contribute_input3').val('');  
	$('#contribute_input4').val('');
	$('#contribution_form_message_characters_remaining').html('');
	$('#contribution_form_subject_characters_remaining').html('');
	$('#contribution_form_phone_characters_remaining').html('');
	$('#contribution_form_full_name_characters_remaining').html('');
	removeContributePopovers();
	$("#progress_bar").hide();
}
function removeContributeImages(){
	$("#images").html('');
	images = [];
	$('#remove_contribute_images').hide();
}

function resetAllContributionFormValues(){
	//reset full contribution form values when logging out.
	removeContributeFeedbackMessages();
	removeContributeImages();
	$('#contribute_input0').val('');  
	$('#contribute_input1').val('');
	$('#contribute_input2').val('');
	$('#contribute_input3').val('');  
	$('#contribute_input4').val('');
	$('#contribution_form_full_name_characters_remaining').html('');
	$('#contribution_form_phone_characters_remaining').html('');
	$('#contribution_form_subject_characters_remaining').html('');
	$('#contribution_form_message_characters_remaining').html('');
	removeContributePopovers();
	$("#progress_bar").hide();
}

function removeContributePopovers(){
	removePopover('#contribute_full_name_feedback_area');
	removePopover('#contribute_phone_feedback_area');
	removePopover('#contribute_message_feedback_area');
}
function blurContributionFields(){
	//blur all fields so that the keyboard is hidden
	$('#contribute_input0').blur();  
	$('#contribute_input1').blur();  
	$('#contribute_input2').blur();  
	$('#contribute_input3').blur();  
	$('#contribute_input4').blur();  
}

$('#contribute_input0, #contribute_input1').on('keypress focus', function(){
	removePopover('#contribute_phone_feedback_area');
});
showCharatcerCount('#contribute_input0', '#contribution_form_full_name_characters_remaining', 50);

showCharatcerCount('#contribute_input2', '#contribution_form_phone_characters_remaining', 20);
showCharatcerCount('#contribute_input3', '#contribution_form_subject_characters_remaining', 150);
showCharatcerCount('#contribute_input4', '#contribution_form_message_characters_remaining', 7000);

validateInputOnTyping('contribute_input0', fullNameRegex, '#contribute_full_name_feedback_area');

validateInputOnTyping('contribute_input2', phoneNumberRegex, '#contribute_phone_feedback_area');

validateMessageInput('contribute_input4', '#contribute_message_feedback_area');


/***************************************Engage styling*********************************************/
$('#engage_post_text').on('keypress focus', function(){
	removePostPopover();
	removeMaximumImageMessage('engage_post_feedback_message');
	$('engage_post_feedback_message').removeClass('fadeInAndOutAgain');
});

$('#engage_post_text').on('keypress keydown keyup', function(){
	var input_text = $('#engage_post_text').val();
	var length_of_input_text = input_text.length;
	var remaining_characters = 2000-length_of_input_text;
	$('#engage_form_characters_remaining').html(remaining_characters + ' characters remaining');
	
	
});
function displayEngageFormSuccessMessage(ID_of_feedback_message_area){
	var feedback_message_selector = '#' + ID_of_feedback_message_area;
	$(feedback_message_selector).removeClass('error'); 
	$(feedback_message_selector).html('Success!'); 
	$(feedback_message_selector).slideDown(300);
	$(feedback_message_selector).addClass('fadeInAndOutAgain');

}
function displayFormErrorMessage(ID_of_feedback_message_area, error_message){
	//used for engage section
	var feedback_message_selector = '#' + ID_of_feedback_message_area;
	$(feedback_message_selector).addClass('error'); 
	$(feedback_message_selector).html(error_message); 

}

function displayMaximumImageMessage(ID_of_feedback_message_area){
	var feedback_message_selector = '#' + ID_of_feedback_message_area;
	$(feedback_message_selector).addClass('error'); 
	$(feedback_message_selector).html("Oops! You've reached the upload limit of 5 images"); 
}

function removeMaximumImageMessage(ID_of_feedback_message_area){
	var feedback_message_selector = '#' + ID_of_feedback_message_area;
	$(feedback_message_selector).removeClass('error'); 
	$(feedback_message_selector).html(""); 
	$(feedback_message_selector).removeClass('fadeInAndOutAgain');
}


function removeEngageFormImages(){
	$("#engage_post_images_section").html('');
	engagePostImages = [];
	$('#remove_engage_images').hide();
}
function removePostPopover(){
	$("#post_feedback_area").fadeOut(100); 
	
}
function resetEngageFormValues(){
	removeEngageFormImages();
	removePostPopover();
	
	removeMaximumImageMessage('engage_post_feedback_message');
	$('#engage_post_progress_bar').hide();
	$('#engage_post_text').val(''); //empty field
	$('#engage_form_characters_remaining').html('');
	//remove text from all comment forms
	$('.engage_comment_textarea').val('');
	$('.comment_feedback_area').hide();
	$('.comment_form_characters_remaining').html(''); //this will reset the READ subscriber comments too
}
function resetReadFormValues(){
	$('#search_read_section_input_field').val('');

	$('.search_feedback_area').hide(); 
	$('.read_comment_textarea').val('');

	$('.read_comment_box_feedback_area').hide();
	$('.comment_form_characters_remaining').html(''); //this will reset the engage comment forms too
}
/*****************************************JQUERY for styling Login registration forms*************************************************/
$('#login_email, #login_password, #registration_display_name, #registration_email, #registration_password, #confirm_registration_password').on('keypress focus', function(){
	//whenever focus is put on an input field in the login registration area we remove the feedback messages from any previous form submission
	removeLoginAndRegistrationMessages(); 
	
});
$('#login_email').on('keypress focus', function(){
	removePopover('#login_password_feedback_area');
});

$('#registration_display_name, #registration_email').on('keypress focus', function(){
	removePopover('#registration_password_feedback_area');
	removePopover('#confirm_registration_password_feedback_area');
});
$('#registration_password').on('keypress focus', function(){
	removePopover('#confirm_registration_password_feedback_area');
});
$('#registration_email, #registration_password, #confirm_registration_password').on('keypress focus', function(){
	removePopover('#registration_display_name_feedback_area');
});

function hideLogInForm(){
	$(".logo_area").addClass('extra_margin_top');
	$("#login_form_intro").hide();
	$("#login_form_area").hide();
	$("#click_to_register_button").hide();
}
function showLogInForm(){
	$(".logo_area").removeClass('extra_margin_top');
	$("#login_form_intro").show();
	$("#login_form_area").show();
	$("#click_to_register_button").show();
}

function hideRegistrationForm(){
	$(".logo_area").addClass('extra_margin_top');
	$("#registration_form_intro").hide();
	$("#registration_form_area").hide();
	$("#click_to_login_button").hide();
}
function showRegistrationForm(){
	$(".logo_area").removeClass('extra_margin_top');
	$("#registration_form_intro").show();
	$("#registration_form_area").show();
	$("#click_to_login_button").show();
}

//functions for blurring form fields so that the phones virtual keyboard disappears when form is submitted
function blurRegistrationFields(){
	//blur all fields so that the keyboard is hidden
	$('#registration_display_name').blur();  
	$('#registration_email').blur();  
	$('#registration_password').blur();  
	$('#confirm_registration_password').blur();  
}

function blurLoginFields(){
	//blur all fields so that the keyboard is hidden
	$('#login_email').blur();  
	$('#login_password').blur();  
}

function removeLoginAndRegistrationMessages(){
	$("#login_error").html(''); 
	$("#registration_feedback_message").html(''); 

}
function removeRegistrationPopovers(){
	removePopover('#registration_display_name_feedback_area');
	removePopover('#registration_email_feedback_area');
	removePopover('#registration_password_feedback_area');
	removePopover('#confirm_registration_password_feedback_area');

}
function removeLoginPopovers(){
	removePopover('#login_password_feedback_area');

}
function resetRegistrationFormValues(){
	
	removeRegistrationPopovers();

	$('#registration_display_name').val(''); 
	$('#registration_email').val(''); 
	$('#registration_password').val(''); 
	$('#confirm_registration_password').val('');

	$('#registration_password_characters_remaining').html('');
	$('#confirm_registration_password_characters_remaining').html('');
	$('#registration_display_name_characters_remaining').html('');
	
}
function resetRegistrationImage(){

	document.getElementById("registration_pic").src = app_root_url + 'images/profile_images/blank-avatar.png';
	registrationAvatar = 1;
	registrationImage = '';	
}


function resetLoginFormValues(){
	removeLoginPopovers();	

	$('#login_email').val(''); 
	$('#login_password').val(''); 

	$('#login_password_characters_remaining').html('');
	
	
}

showCharatcerCount('#registration_display_name', '#registration_display_name_characters_remaining', 25);
showCharatcerCount('#registration_password', '#registration_password_characters_remaining', 14);
showCharatcerCount('#confirm_registration_password', '#confirm_registration_password_characters_remaining', 14);
showCharatcerCount('#login_password', '#login_password_characters_remaining', 14);


function enableAllButtons(){
	enableButton('#log_in_button', 'Log In'); 
	enableButton('#registration_button', 'Create account');
	enableButton("#confirm_change_name", "Save");
	enableButton("#confirm_change_password", "Change Password");	
	enableButton("#submit_engage_post", 'Post');	
	enableButton("#submit_story", "Submit");

}
/************************reset password form**********************************/
$('#password_reset_email, #temporary_reset_password, #reset_password_new_password, #reset_password_confirm_password').on('keypress focus', function(){
	//whenever focus is put on an input field in the login registration area we remove the feedback messages from any previous form submission
	removePasswordResetFormMessages(); 
	
});

function removePasswordResetFormMessages(){
	$("#password_reset_error").html(''); 

}

function removePasswordResetPopovers(){
	removePopover('#password_reset_email_feedback_area');
	removePopover('#reset_password_new_password_feedback_area');
	removePopover('#reset_password_confirm_password_feedback_area');

}
function removePasswordResetFormValues(){
	$('#password_reset_email').val('');
	$('#temporary_reset_password').val('');
	$('#reset_password_new_password').val('');
	$('#reset_password_confirm_password').val('');

	$('#reset_password_new_password_characters_remaining').html('');
	$('#reset_password_confirm_password_characters_remaining').html('');

}


showCharatcerCount('#reset_password_new_password', '#reset_password_new_password_characters_remaining', 14);
showCharatcerCount('#reset_password_confirm_password', '#reset_password_confirm_password_characters_remaining', 14);

$('#password_reset_email, #temporary_reset_password').on('keypress focus', function(){
	removePopover('#reset_password_new_password_feedback_area');
	removePopover('#reset_password_confirm_password_feedback_area');
});
$('#reset_password_new_password').on('keypress focus', function(){
	removePopover('#reset_password_confirm_password_feedback_area');
});
$('#reset_password_confirm_password').on('keypress focus', function(){
	removePopover('#reset_password_new_password_feedback_area');
});


$(document).on("pagehide","#page-password-reset",function(){
	
	removePasswordResetFormMessages(); 
	removePasswordResetPopovers();
	removePasswordResetFormValues();
	enableButton('#password_reset_submit_button', 'Reset password');
});
/*************************forgot password form**********************************/
$('#forgot_password_email, #forgot_password_mob_select').on('keypress focus', function(){
	//whenever focus is put on an input field in the login registration area we remove the feedback messages from any previous form submission
	removeForgotPasswordFormMessages(); 
	
});
function removeForgotPasswordFormMessages(){
	$("#forgot_password_error").html(''); 

}
$(document).on("pagehide","#page-forgot-password",function(){
	enableButton('#forgot_password_submit_button', 'Submit');
	removeForgotPasswordFormMessages(); 
	$('#forgot_password_mob_select').val('');
});
	
/*****************************************JQUERY for styling for search section*************************************************/

function removeSearchPopover(){
	$(".search_feedback_area").fadeOut(100); 
	
}
$('#search_read_section_input_field').on('keypress focus', function(){
	removeSearchPopover(); 
});

/*****************************************change password functions**************************************/

showCharatcerCount('#current_password', '#current_password_characters_remaining', 14);
showCharatcerCount('#new_password_first_time', '#new_password_first_time_characters_remaining', 14);
showCharatcerCount('#new_password_second_time', '#new_password_second_time_characters_remaining', 14);

function changePassword(){
	$('#change_password_success_message').removeClass('fadeInAndOutAgain');
	var email_address = $("#hidden_input_for_email").val();
	var safe_email_address_for_html = $ESAPI.encoder().encodeForHTML(email_address);
	$("#email_address_for_password_change").html(safe_email_address_for_html);
	$("#change_password_area").slideDown();
}

function addPassword(){
	//this ability to add a password to your account was origianlly for when people registered with facebook 
	//and wanted to add a password to their account.
	//however now that we dont have facebook login, we wont be using this function or other add password functions.
	//we will leave it for future iterations though
	$('#add_password_success_message').removeClass('fadeInAndOutAgain');
	var email_address = $("#hidden_input_for_email").val();
	var safe_email_address_for_html = $ESAPI.encoder().encodeForHTML(email_address);
	$("#email_address_for_password_addition").html(safe_email_address_for_html);
	$("#add_password_area").slideDown();
}

function closeChangePasswordArea(type_of_effect){
	//empty the form fields of any passwords
	resetChangePasswordFormValues();
	//remove any feedback messages
	removeChangePasswordFormMessages();
	
	$("#email_address_for_password_change").html('');
	if(type_of_effect == 'hide'){
		$("#change_password_area").hide();

	}else if(type_of_effect == 'slide_up'){
		$("#change_password_area").slideUp();
	}
}

function closeAddPasswordArea(type_of_effect){
	//empty the form fields of any passwords
	resetAddPasswordFormValues();
	//remove any feedback messages
	removeAddPasswordFormMessages();

	$("#email_address_for_password_addition").html('');
	$("#email_address_for_password_change").html('');

	if(type_of_effect == 'hide'){
		$("#add_password_area").hide();

	}else if(type_of_effect == 'slide_up'){
		$("#add_password_area").slideUp();
	}
}
$('#password_first_time, #password_second_time').on('keypress focus', function(){
	//when an input field is in focus remove any feedback messages from previous form submission
	removeAddPasswordFormMessages();
});

$('#new_password_first_time, #new_password_second_time, #current_password').on('keypress focus', function(){
	//when an input field is in focus remove any feedback messages from previous form submission
	removeChangePasswordFormMessages();
});

function resetChangePasswordFormValues(){
	//empty the form input fields
	$('#new_password_first_time').val(''); 
	$('#new_password_second_time').val('');
	$('#current_password').val(''); 
	$('#current_password_characters_remaining').html(''); 
	$('#new_password_first_time_characters_remaining').html('');
	$('#new_password_second_time_characters_remaining').html(''); 
}
function resetAddPasswordFormValues(){
	//empty the form input fields
	$('#password_first_time').val(''); 
	$('#password_second_time').val('');
	//we dont currently have character count on this form so we dont need to reset
	
}
function removeAddPasswordFormMessages(){
	//remove any feedback messages from previous form submission
	
	$('#add_password_error_message').html('');
}
function removeChangePasswordFormMessages(){
	//remove any feedback messages from previous form submission
	
	$('#change_password_error_message').html('');
}

function resetAddPasswordArea(){
	
//reset add password area for app reset
closeAddPasswordArea('hide');
resetAddPasswordFormValues();
removeAddPasswordFormMessages();
}
function resetChangePasswordArea(){
	
//reset change password area for app reset
closeChangePasswordArea('hide');
resetChangePasswordFormValues();
removeChangePasswordFormMessages();
}
/*****************************************change display name functions**************************************/
showCharatcerCount('#change_display_name_input_field', '#change_display_name_characters_remaining', 25);

function changeDisplayName(){	
	var current_display_name = $("#hidden_input_for_display_name").val();
	$("#change_display_name_input_field").val(current_display_name);
	$("#change_display_name_area").slideDown();
	$("#change_display_name_area").addClass('is_showing');

}
function closeChangeDisplayNameArea(){
	removeChangeDisplayNameFormMessages();
	$("#change_display_name_area").slideUp();
	$("#change_display_name_area").removeClass('is_showing');
}

function toggleEditDisplayName(){
	if(!$("#change_display_name_area").hasClass('is_showing')){
		changeDisplayName();
	}else{
		closeChangeDisplayNameArea();
	}
}
function blurDisplayNameFields(){
	$('#change_display_name_input_field').blur();  

}
$('#change_display_name_input_field').on('keypress focus', function(){
	//when an input field is in focus remove any feedback messages from previous form submission
	removeChangeDisplayNameFormMessages();
});

function resetChangeDisplayNameFormValues(){
	$('#change_display_name_input_field').val(''); 
	$('#change_display_name_characters_remaining').html('');
}

function removeChangeDisplayNameFormMessages(){
	//remove any feedback messages from previous form submission
	$('#change_display_name_error_message').html('');
}
function stopDisplayNameAnimation(){
	if(window.display_name_animation_counter == 1){
		$('#change_display_name_success_message').slideUp(300);
		$('#change_display_name_success_message').removeClass('fadeInAndOutAgain');
		clearInterval(displayNameAnimationInterval);
	}
	window.display_name_animation_counter++;
}

function resetDisplayNameArea(){
	closeChangeDisplayNameArea();
	resetChangeDisplayNameFormValues();
	removeChangeDisplayNameFormMessages();
}
/************************************************************************************************/

/*****************************************Code for main engage section functions**********************************/


$("#engage_form").on('submit', function(e){
	disableButton("#submit_engage_post", 'Post');
	
	removeMaximumImageMessage('engage_post_feedback_message');
	//this will execute when a post is submitted.
	e.preventDefault(); 
	var engage_post_text  = $('#engage_post_text').val();
	var engage_text_length = engage_post_text.length;

	if(engage_text_length < 2 || engage_text_length == null || engage_text_length > 2000){
		$('#post_feedback_area').fadeIn(100);	
		$('#post_popover_rectangle').html('Posts must be between 2 and 2000 characters.');
		enableButton("#submit_engage_post", 'Post');	
	
	}else{
			if(engagePostImages.length > 0){
				var post_type = 'photo';
			}else{
				var post_type = 'status';
			}
			$('#engage_post_progress_bar').show();
			var token = localStorage.getItem("usertoken");
			var params = {'usertoken': token, 'engage_post_text' : engage_post_text, 'post_type' : post_type};	
				
			$.ajax({
				//do an ajax request passing along the user json web token for validation on server side and also the text that was submitted.
       				url: app_root_url + 'engage/submit_post.php',
       				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
       				success: function(data){
					
					var result = data;
					var token_is_valid = result.token_is_valid;
					if(token_is_valid){
						var text_is_valid = result.text_is_valid;
						var is_valid_encoding = result.is_valid_encoding;	
						//console.log("is_valid_encoding " + is_valid_encoding);
						if(text_is_valid == true){
							var successful_insert = result.successful_insert;

							if(successful_insert){
								if(engagePostImages.length > 0){
									var post_id = result.post_id;
									//user has added images to the post so we need to upload them now.
									uploadImagesForEngagePost(post_id);
								}else{
									//successful insert so remove the text and character count 
									$('#engage_post_progress_bar').hide();
									$('#engage_post_text').val(''); //empty field
									$('#engage_form_characters_remaining').html('');
									//enable post button for more posts to be submitted
									enableButton("#submit_engage_post", 'Post');
									displayEngageFormSuccessMessage('engage_post_feedback_message');
									window.animation_counter = 0;
									animationInterval = setInterval(function(){stopAnimation('engage_post_feedback_message');}, 2500);
									var engagePosts = result.engagePosts;
									var number_of_posts = result.number_of_posts;
									var current_user_privilege = result.userDetails.user_privilege;
									var current_user_id = result.userDetails.userID;
									var total_number_of_comments = result.total_number_of_comments; //the number of posts from the engage section.
							
									var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.
									//user has not added images to the post so we can prepare engage section now
									//call the funtion which prepares the engage section html.
									prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images);
									
									//refresh the listview so that the filter search works.
									$("#engage_post_area").listview('refresh');
								}
							}else{
								enableButton("#submit_engage_post", 'Post');
								$('#engage_post_progress_bar').hide();
								//leave the text and character count there so they can re-submit
								window.animation_counter = 0;
								animationInterval = setInterval(function(){stopAnimation('engage_post_feedback_message');}, 2500);
								displayFormErrorMessage('engage_post_feedback_message', 'We\'re sorry but an error has occured while submitting your post!');
							}
						}else{
							enableButton("#submit_engage_post", 'Post');
							$('#engage_post_progress_bar').hide();
							//leave the text and character count there so they can re-submit
							window.animation_counter = 0;
							animationInterval = setInterval(function(){stopAnimation('engage_post_feedback_message');}, 2500);
								
							displayFormErrorMessage('engage_post_feedback_message', 'Invalid text! Please try again.');

						}
					}else{
						enableButton("#submit_engage_post", 'Post');
						$('#engage_post_progress_bar').hide();
						//leave the text and character count there so they can re-submit
						var error_message = "We\'re sorry but there seems to be an authentication problem!";
						displayFormErrorMessage('engage_post_feedback_message', error_message);
					}
				},
				error: function(xhr, status, error) {
					//leave the text and character count there so they can re-submit
					enableButton("#submit_engage_post", 'Post');
					$('#engage_post_progress_bar').hide();
					
					var error_message = 'There was a problem submitting your post! System error: ' + error;
					
					displayFormErrorMessage('engage_post_feedback_message', error_message);
							
				}
			});
		
	}
});
function addImagesForEngagePost(){
	
	if(deviceIsReady){
	
		if(engagePostImages.length <5){
	
			//this is called when the user chooses to add an image to their contribtution story.
			navigator.camera.getPicture(function(picture) {
					
				var newImage = "<img src='" + $ESAPI.encoder().encodeForHTMLAttribute(picture) + "'>";
				var engage_post_image_row;
				if(engagePostImages.length === 0 || engagePostImages.length === 3 || engagePostImages.length === 6){
					//append a new row

					var image_row_id = engagePostImages.length/3;
					engage_post_image_row = "<div class='image_row' id='engage_post_image_row" + image_row_id + "'></div>";
					$("#engage_post_images_section").append(engage_post_image_row);
				}

				if(engagePostImages.length === 0 || engagePostImages.length === 1 || engagePostImages.length === 2){
				
					$('#engage_post_image_row0').append(newImage);
				}else if(engagePostImages.length === 3 || engagePostImages.length === 4 || engagePostImages.length === 5){
				
					$('#engage_post_image_row1').append(newImage);
				}else if(engagePostImages.length === 6 || engagePostImages.length === 7 || engagePostImages.length === 8){
				
					$('#engage_post_image_row2').append(newImage);
				}
		
				engagePostImages.push(picture);
				$('#remove_engage_images').show();
			}, function(e) {
		
			}, { 
				quality: 50,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				destinationType: Camera.DestinationType.FILE_URI,
				targetWidth: 1100,
				targetHeight: 1100,
				correctOrientation: true 
			});
		}else{
			//alert to the user that they can't exceed the maximum of five images
			navigator.notification.alert("Oops! You've reached the upload limit of 5 images");
			//displayMaximumImageMessage('engage_post_feedback_message');
		}
	}else{
		//phonegap APIs are not ready yet
		alert("Please try again in a few moments");
	}


}
function uploadImagesForEngagePost(post_id){
	//this takes in the postID that will come back from the ajax request after the form is submitted.
	if(deviceIsReady){
		var token = localStorage.getItem("usertoken");		
		var defs = [];
		var imageIndex = 0;
		engagePostImages.forEach(function(i) {
			
			var def = $.Deferred();

			function win(r) {
				
				var result = JSON.parse(r.response);
				var token_is_valid = result.token_is_valid;
				if(!token_is_valid){
					//if token is not valid then inform user there has been a problem
					alert("We're sorry. There has been an authentication problem");
				}
				
				if($.trim(r.response) === "0") {
					//alert("this one failed");
					def.resolve(0);
				} else {
					//alert("this one passed");
					def.resolve(1);
				}
			}

			function fail(error) {
				//if any images fail we should enable the button again 
				enableButton("#submit_engage_post", 'Post');
		   		alert("We're sorry. This image has not been uploaded. Error " + JSON.stringify(error));
				def.resolve(0);
			}

			var uri = encodeURI(app_root_url_for_image_uploads + "engage/upload_engage_post_image.php");

			var options = new FileUploadOptions();
			options.fileKey="file";
			options.mimeType="image/jpeg";
			//params added
			var params = new Object();
			params.post_id = post_id; //must correspond with $_POST['post_id']
			params.usertoken = token; //must correspond with $_POST['usertoken']
			params.imageIndex = imageIndex; //send the index of the image in the params
			params.app_root_url = app_root_url;
			
			options.params = params;
			//end params added


			var ft = new FileTransfer();
			ft.onprogress = function(progressEvent){
   		 		if(progressEvent.lengthComputable){
      					loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
    				}else{	
      					loadingStatus.increment();
    				}
			};

			ft.upload($ESAPI.encoder().encodeForURL(i), uri, win, fail, options);
			defs.push(def.promise());
			imageIndex++;
		});

		$.when.apply($, defs).then(function() {
			displayEngageFormSuccessMessage('engage_post_feedback_message');
			window.animation_counter = 0;
			animationInterval = setInterval(function(){stopAnimation('engage_post_feedback_message');}, 2500);
			//remove engage text and character count and progress bar as the post has been successful

			$('#engage_post_progress_bar').hide();				
			$('#engage_post_text').val(''); //empty field	
			$('#engage_form_characters_remaining').html('');
			//enable post button
			enableButton("#submit_engage_post", 'Post');
			removeEngageFormImages();
			//update engage section
			regenerateEngageData();			
		});	
	}else{
		//phonegap device APIs are not ready yet
		//this should never happen in this case as this method is only called if the previous addContributePicture function executed
		alert("Please try again in a few moments");
	}
}


function submitCommentForm(x, e){
	var submit_comment_button = "#submit_comment" + x;
	disableButton(submit_comment_button, 'Comment');
	e.preventDefault(); 
	var post_id = $('#post_id_of_comment_form' + x).val(); 
	var comment_text = $('#comment_input' + x).val(); 	//this field is required

	var comment_length = comment_text.length;

	if(comment_length < 2 || comment_length == null || comment_length > 2000){
		$('#comment_feedback_area' + x).fadeIn(100);		
		$('#popover_rectangle' + x).html('Comments must be between 2 and 2000 characters.');
		enableButton(submit_comment_button, 'Comment');
	}else{
		
			//console.log('valid comment');
			var token = localStorage.getItem("usertoken");	
			var params = {'usertoken': token, 'comment_text' : comment_text, 'post_id' : post_id};	
		
		
			$.ajax({
       				url: app_root_url + 'engage/submit_comment.php',
				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
       				success: function(data){
					var result = data;
					var token_is_valid = result.token_is_valid;
					if(token_is_valid){
						var text_is_valid = result.text_is_valid;
						var is_valid_encoding = result.is_valid_encoding;	
						//console.log("is_valid_encoding " + is_valid_encoding);

						if(text_is_valid == true){
							//this will be true if it is valid encoding
							var successful_insert = result.successful_insert;
							if(successful_insert == true){
								//we dont need to enable the button again here because the posts and comment forms etc are being generated again
								var engagePosts = result.engagePosts;
								var number_of_posts = result.number_of_posts;
								var current_user_privilege = result.userDetails.user_privilege;
								var current_user_id = result.userDetails.userID;
								var total_number_of_comments = result.total_number_of_comments; //the number of posts from the engage section.
							
								var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.

								//console.log("total_number_of_comments" + total_number_of_comments);
								prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images);
								$("#engage_post_area").listview('refresh');
							}else{
								enableButton(submit_comment_button, 'Comment');
								alert("We're sorry but an error occured submitting your comment.");
							}
						}else{
							enableButton(submit_comment_button, 'Comment');
							alert("Invalid text. Please try again!");
						}
					}else{
						enableButton(submit_comment_button, 'Comment');
						alert("We're sorry but there seems to be an authentication problem");
					}
				},
				error: function(xhr, status, error) {
					//leave the text and character count there so they can re-submit
					enableButton(submit_comment_button, 'Comment');
					
					var error_message = 'There was a problem submitting your comment! System error: ' + error;
					alert(error_message);
					
							
				}
			});
		
	}
}
function addEngageListeners(i){
	//add listeners to the delete buttons on posts and also the comment forms which appear underneath every post
	document.getElementById('comment_form' + i).addEventListener('submit', function(e) { submitCommentForm(i, e);}, false);

	//need to hide all of the popovers as initializing them to display none didnt work
	$('#comment_feedback_area' + i).hide();
	if(document.getElementById('remove_post_button' + i)){
		//check if this element exists
		//this element will exist depending on whether the current user has the user privilege to delete this post
		document.getElementById('remove_post_button' + i).addEventListener('click', function() { removePost(i);}, false);

	}
	
	//hide the popover when the input field is in focus
	$('#comment_input' + i).on('keypress focus', function(){
		$('#comment_feedback_area' + i).hide();

	});
	$('#comment_input' + i).on('keypress keyup keydown', function(){
		var input_text = $('#comment_input' + i).val();
		var length_of_input_text = input_text.length;
		var remaining_characters = 2000-length_of_input_text;
		$('#comment_form_characters_remaining' + i).html(remaining_characters + ' characters remaining');
		//console.log(remaining_characters);
	});
}
function addCommentListeners(i){

	if(document.getElementById('remove_comment_button' + i)){
	//this element will exist depending on whether the current user has the user privilege to delete this comment
		document.getElementById('remove_comment_button' + i).addEventListener('click', function() { removeComment(i);}, false);
	}
}

function removePost(i){
	
	var confirmation_of_delete = confirm("Are you sure you wish to delete this post?");
	if(confirmation_of_delete){
		//get the id value stored in the hiddne input field within the post html with index i
	 
		var id_of_post = $('#id_of_post' + i).val(); 
		
		var token = localStorage.getItem("usertoken");
		var params = {'usertoken': token, 'id_of_post' : id_of_post};
		$.ajax({
       			url: app_root_url + 'engage/delete_post.php',
			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
				var result = data;
				var engagePosts = result.engagePosts;
				var number_of_posts = result.number_of_posts;
				var current_user_privilege = result.userDetails.user_privilege;
				var current_user_id = result.userDetails.userID;
				var total_number_of_comments = result.total_number_of_comments; //the number of posts from the engage section.
						
				var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.

				prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images);
				$("#engage_post_area").listview('refresh');
			},
			error: function(xhr, status, error) {
				
				var error_message = 'There was a problem removing this post! System error: ' + error;
				alert(error_message);
					
							
			}
		});

	}
}


function removeComment(i){
	
	var confirmation_of_delete = confirm("Are you sure you wish to delete this comment?");
	if(confirmation_of_delete){
		//get the id value stored in the hiddne input field within the comment html with index i	 
		var id_of_comment = $('#id_of_comment' + i).val(); 
		

		var token = localStorage.getItem("usertoken");
		var params = {'usertoken': token, 'id_of_comment' : id_of_comment};
		$.ajax({
       			url: app_root_url + 'engage/delete_comment.php',
			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
				var result = data;
				var engagePosts = result.engagePosts;
				var number_of_posts = result.number_of_posts;
				var current_user_privilege = result.userDetails.user_privilege;
				var current_user_id = result.userDetails.userID;
				var total_number_of_comments = result.total_number_of_comments; //the number of posts from the engage section.			
				var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.
				
				prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments,total_number_of_engage_images);
				$("#engage_post_area").listview('refresh');
			},
			error: function(xhr, status, error) {
				
				var error_message = 'There was a problem removing this comment! System error: ' + error;
				alert(error_message);
					
							
			}
		});

	}
}


function generateCommentForm(post_index, post_id){
	//function to generate the comment form html which appears under every post
	var comment_form_area = '<div id="comment_form_area' + post_index + '" class="comment_form_area">'
			+ '<form id="comment_form' + post_index + '" name="comment_form" method="post" action="" >'
			+ '<div class="form_divider">'
			+ '<label for="comment_input' + post_index + '"></label>'
			+ '<textarea id="comment_input' + post_index + '" class="engage_comment_textarea" name="comment_input' + post_index + '" minlength="2" maxlength="2000" placeholder="Write your comment here..."  rows="2" data-role="none" required></textarea>'
			+ '<p id="comment_form_characters_remaining' + post_index + '" class="comment_form_characters_remaining" ></p>'
			+ '<p id="comment_feedback_area' + post_index + '" class="comment_feedback_area"><span id="popover_rectangle' + post_index + '" class="popover_rectangle"></span><span class="popover_triangle"></span></p>'
			+ '</div><!--/form_divider-->'
			+ '<div class="form_divider">'	
								
			+ '<input type="hidden" id="post_id_of_comment_form' + post_index + '" data-role="none" value="' + post_id + '"/>'	//the id of the post to which this comment for belongs to
			+ '<input type="submit" id="submit_comment' + post_index + '" data-role="none" class="button_style narrow_width_button" value="Comment"/>'

			+ '</div><!--/form_divider-->'
			+ '</form></div><!--/comment_form_area-->';
	return comment_form_area;
}
					

function generateComment(comment_id, comment_date_and_time, comment_text, comment_user_data, comment_index, current_user_privilege, current_user_id){
	
	//function to generate the comment html within each post

	//note: instead of encoding the comment text (for html) here, we are using php htmlentities on the server side after retrieving text from database.
	//this is to preserve the emoji symbols, as when I tried using encodeForHTML here on the comment text, the emoji symbols did not display
	//we are also filtering the text (on the server) for line breaks and also youtube video links.

	var profile_image = comment_user_data.profile_image;
	var safe_display_name_for_html = $ESAPI.encoder().encodeForHTML(comment_user_data.display_name);
	var safe_comment_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(comment_id);
	var safe_comment_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(comment_id);

	var safe_comment_user_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(comment_user_data.userID);
	var safe_comment_data_and_time_for_html = $ESAPI.encoder().encodeForHTML(comment_date_and_time);
	var safe_is_facebook_profile_image = $ESAPI.encoder().encodeForJavaScript(comment_user_data.isFacebookProfileImage);
	var safe_current_user_id = $ESAPI.encoder().encodeForJavaScript(current_user_id);
	var safe_current_user_privilege = $ESAPI.encoder().encodeForJavaScript(current_user_privilege);

	
	if(safe_is_facebook_profile_image == 0){
		var safe_picture_for_attribute = app_root_url + $ESAPI.encoder().encodeForHTMLAttribute(profile_image);
	}else{
		var safe_picture_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(profile_image);
		
	}

	var safe_profile_image_html = '<img src="' + safe_picture_for_attribute + '"/>';
	var safe_display_name_html = '<p class="users_name">' + safe_display_name_for_html + '</p>';

	
	var individual_comment_html = '<div id="comment_of_post' + comment_index + '" class="comment_of_post">'
			+ '<input type="hidden" id="id_of_comment' + comment_index + '" data-role="none" value="' + safe_comment_id_for_attribute + '"/>'
			+ '<div>'
			+ '<span class="profile-thumbnail">'
			+ safe_profile_image_html + '</span>'
			+ safe_display_name_html
			+ '<p class="date_of_comment">' + safe_comment_data_and_time_for_html + '</p>';

			if((safe_current_user_privilege == 2) || (safe_current_user_id == safe_comment_user_id_for_javascript)){
				//if the user who is currently logged into the app has a user_privilege of 2 ie is an admin then add a remove_comment button so they 
				//can delete the comment.
				//or if the current user logged in is the same user who created the comment in the first place, then also allow them to delete this comment
				individual_comment_html += '<span id="remove_comment_button' + comment_index + '" class="remove_post_comment_button"><i class="fa fa-times"></i></span>';
			}
	individual_comment_html += '</div>'
			+ '<p class="text_of_comment">' + comment_text + '</p>'
			+ '</div><!--/comment_of_post-->';

	return individual_comment_html;
}

function filterTextForLineBreaks(safe_text, text_type){
	//this function takes in text that has been encoded for html already and inserts a span tag whenever we find a line break in order to display
	//the content correctly.
	var filtered_text = '';
	if(text_type == 'engage_section'){
		//we are not currently using this function for engage section text as we are filtering on server side due to preserving emojis
		var text_array = safe_text.split("&#xa;");
	}else if(text_type == 'read_section'){
		var text_array = safe_text.split("\n");
	}
	text_array.forEach(function(line_of_text) {
		
		if(text_type == 'engage_section'){
			var temp_line_of_text = filterTextForLinks(line_of_text);
		}else if(text_type == 'read_section'){
			var temp_line_of_text = line_of_text;

			//therefore the comments are coming from the read section so we will not display youtube videos.
		}
		filtered_text += temp_line_of_text + '<span class="small_break_between_paragraphs"></span>'; 
		
	});

	
	return filtered_text;
}	

function filterTextForLinks(safe_line_of_text){
	//we are not currently using this function for engage section text as we are filtering on server side (due to preserving emojis)
	var filtered_line_of_text = '';
	var line_of_text_array = safe_line_of_text.split(" ");
	var filtered_line_of_text_array = [];
	line_of_text_array.forEach(function(piece_of_text) {
		if(piece_of_text.toLowerCase().indexOf('https&#x3a;&#x2f;&#x2f;youtu.be&#x2f;') >= 0){
			var youtube_link = piece_of_text;
			
			var youtube_video_id = youtube_link.replace('https&#x3a;&#x2f;&#x2f;youtu.be&#x2f;', '');
			var enable_api_string = '?enablejsapi=1';	
			var video_embed_link = $ESAPI.encoder().encodeForHTMLAttribute('https://www.youtube.com/embed/' + youtube_video_id + enable_api_string);
			var full_video_embed_code = '<div class="video-wrapper"><iframe class="youtube_video_iframe" width="560" height="315" src="' + video_embed_link + '" frameborder="0"></iframe></div>';
			filtered_line_of_text_array.push(full_video_embed_code);
		}else if(piece_of_text.toLowerCase().indexOf('https&#x3a;&#x2f;&#x2f;www.youtube.com&#x2f;watch&#x3f;v&#x3d;') >= 0){ 
			var youtube_link = piece_of_text;
			
			var youtube_video_id = youtube_link.replace('https&#x3a;&#x2f;&#x2f;www.youtube.com&#x2f;watch&#x3f;v&#x3d;', '');
			var enable_api_string = '?enablejsapi=1';	
			var video_embed_link = $ESAPI.encoder().encodeForHTMLAttribute('https://www.youtube.com/embed/' + youtube_video_id + enable_api_string);
			var full_video_embed_code = '<div class="video-wrapper"><iframe class="youtube_video_iframe" width="560" height="315" src="' + video_embed_link + '" frameborder="0"></iframe></div>';
			filtered_line_of_text_array.push(full_video_embed_code);
		
		}else{
			filtered_line_of_text_array.push(piece_of_text);
		}

		
		
	});
	return filtered_line_of_text_array.join(" ");
}
								
function generateEngagecomments(comments_on_post, current_user_privilege, current_user_id){
	//function to generate html for all comments.
	var full_comments_html = '';
	var comment_index = startingIndexForComments;
	comments_on_post.forEach(function(comment) {
		
		full_comments_html += generateComment(comment.commentID, comment.comment_date_and_time, comment.commentText, comment.commentUserData, comment_index, current_user_privilege, current_user_id);
		comment_index++;
	});

	startingIndexForComments = comment_index; //store index in global variable
	
	return full_comments_html;
}									

function generatePostImagesArea(post_images, post_id, index, current_user_privilege, current_user_id, post_userID){
	engagePostImageURLs[index] = [];
	engagePostImageIDs[index] = [];

	var post_images_html = '';
	var image_index = 0;
	post_images.forEach(function(image) {
		var image_url = image.engageImageURL;
		var image_id = image.engageImageID;
		var image_user_id = post_userID;

		engagePostImageURLs[index][image_index] = image_url;
		engagePostImageIDs[index][image_index] = image_id;
		engagePostUserIDs[index] = image_user_id; //user id of the person who created this post

		post_images_html += '<li id="engage_post_image_' + index + '_' + image_index + '" ';	
		if((post_images.length == 2) || (post_images.length == 4)){
			post_images_html += 'class="two_images ';
			
				
				
		}else if(post_images.length == 3){
			post_images_html += 'class="three_images ';
		}else if(post_images.length == 5){
			
				
			if((image_index == 0) || (image_index == 1)){
				
				post_images_html += 'class="two_images ';

			}else if((image_index == 2) || (image_index == 3) || (image_index == 4)){
				
				post_images_html += 'class="three_images ';

			}
		}

		post_images_html += 'engage_post_image"><img src="' + app_root_url + $ESAPI.encoder().encodeForHTMLAttribute(image_url) + '" /></li>';

		image_index++;
		
	});

	return post_images_html;
}									



function createPost(index, post_id, post_type, post_images, post_date_and_time, text_for_post, comments_on_post, current_user_privilege, post_user_data, current_user_id){
	
	//note: instead of encoding the text for html here, we are using php htmlentities on the server side.
	//this is to preserve the emoji symbols, as when I tried using encodeForHTML here on the post text, the emoji symbols did not display
	//we are also filtering the text for line breaks and also youtube video links on the server side.

	var safe_post_type = $ESAPI.encoder().encodeForHTMLAttribute(post_type);
	var safe_is_facebook_profile_image = $ESAPI.encoder().encodeForJavaScript(post_user_data.isFacebookProfileImage);
	var safe_current_user_id = $ESAPI.encoder().encodeForJavaScript(current_user_id);
	var safe_current_user_privilege = $ESAPI.encoder().encodeForJavaScript(current_user_privilege);
	
	var safe_display_name_for_html = $ESAPI.encoder().encodeForHTML(post_user_data.display_name);
	var safe_post_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(post_id);
	var safe_post_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(post_id);
	var safe_post_user_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(post_user_data.userID);
	var safe_post_date_and_time = $ESAPI.encoder().encodeForHTML(post_date_and_time);
	

	if(safe_is_facebook_profile_image == 0){
		var safe_picture_for_attribute = app_root_url + $ESAPI.encoder().encodeForHTMLAttribute(post_user_data.profile_image);

	}else{
		var safe_picture_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(post_user_data.profile_image);
		
	}

	var individual_post_html = '<li data-role="none" id="engage_post' + index + '" class="engage_post_wrapper container_small">'
			+ '<input type="hidden" id="id_of_post' + index + '" data-role="none" value="' + safe_post_id_for_attribute + '"/>'
			+ '<input type="hidden" id="post_type_' + index + '" data-role="none" value="' + safe_post_type + '"/>'
			+ '<div class="main_engage_post">'
			+ '<div>'
			+ '<span class="profile-thumbnail">'
			+ '<img src="' + safe_picture_for_attribute + '"/></span>'
			+ '<p class="users_name">' + safe_display_name_for_html + '</p>'
			+ '<p class="date_of_post">' + safe_post_date_and_time + '</p>';

			if((safe_current_user_privilege == 2) || (safe_current_user_id == safe_post_user_id_for_javascript)){
				//if the user who is currently logged into the app has a user_privilege of 2 ie is an admin then add a remove_post button so they 
				//can delete the post.
				//or if the current user logged in is the same user who owns the post then also allow them to delete the post
				individual_post_html += '<span id="remove_post_button' + index + '" class="remove_post_comment_button"><i class="fa fa-times"></i></span>';
			}

	individual_post_html += '</div>'
			+ '<p class="text_of_post">' + text_for_post + '</p>';
			if(safe_post_type == 'photo'){
				individual_post_html += '<input type="hidden" id="number_of_images_' + index + '" data-role="none" value="' + post_images.length + '"/>';
				individual_post_html += '<ul class="list_of_engage_post_images">' + generatePostImagesArea(post_images, safe_post_id_for_javascript, index, safe_current_user_privilege, safe_current_user_id, safe_post_user_id_for_javascript) + '</ul>';	
				
			}

	individual_post_html += '</div><!--/main_engage_post-->'
			+ generateEngagecomments(comments_on_post, safe_current_user_privilege, safe_current_user_id) 
			+ generateCommentForm(index, safe_post_id_for_javascript) //insert comment form here
			+ '</li><!--/engage_post_wrapper-->';

	return individual_post_html;
}									

								
function generateEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id){
	var full_posts_html = '';
	for(x=0; x < number_of_posts; x++){
		var index = x;
		var post_id = engagePosts[x].postID;
		var post_type = engagePosts[x].post_type;
		var post_date_and_time = engagePosts[x].post_date_and_time;

		var text_for_post = engagePosts[x].textForPost;
		
		var post_user_data = engagePosts[x].post_user_data;
		var comments_on_post = engagePosts[x].comments_on_post; //this will be an array
		var post_images = engagePosts[x].post_images;			
		full_posts_html += createPost(index, post_id, post_type, post_images, post_date_and_time, text_for_post, comments_on_post, current_user_privilege, post_user_data, current_user_id);
	}
	
	return full_posts_html;
}
	
function prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images){
	//everytime we freshly prepare the engage posts we must store the total number of posts and comments into global variables
	original_count_of_posts = number_of_posts;
	original_count_of_comments = total_number_of_comments;
	

	//set the index for the comments on the page to 0.
	//we need a unique id on each comment so that we can add listeners to the delete buttons on the comments. so we create an index which
	//will be concatenated with a string for the unique id
	startingIndexForComments = 0;

	//create html for the engage page of the app and insert it to the DOM.
	var full_posts_html = generateEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id);
	$('#engage_post_area').html(full_posts_html).promise().done(function(){
		pushAnyVideosOntoArray("page-engage");
		//now that we have inserted the engage posts and comments to the DOM we can add listeners to each of the comment forms and posts.
		for(var i=0;i < number_of_posts;i++){
			addEngageListeners(i);
		}
		//add listeners to the comments eg the delete buttons
		for(var i=0;i < total_number_of_comments;i++){
			addCommentListeners(i);
	
		}

		//add listeners to the images in the galleries
		for(var i=0;i < number_of_posts;i++){
			var post_type_selector = '#post_type_' + i;
			var post_type = $(post_type_selector).val();

			var post_id = $('#id_of_post' + i).val();
			
			if(post_type == 'photo'){
				var number_of_images_selector = '#number_of_images_' + i;
				var number_of_images = $(number_of_images_selector).val();
				if(number_of_images > 1){
					for(var x=0;x < number_of_images;x++){
						addImageListeners(post_id, i, x);

					}
				}	
			}
		}
		$('#engage_post_area a:not(.normal_link)').click( function(e) { 
  			e.preventDefault();
			//alert($(this).attr('href'));
			var href = $(this).attr('href');
			var ref = window.open(href, '_blank', 'location=yes');
		});
	});

	//clear the interval first just in case it happens to be still running
	clearInterval(setNewPostsChecker);
	//set interval here to run a continuous ajax request every 5 seconds or so to count the current number of posts and comments in database
	//if it differs to the current amount then we regenerate the engage section html.					
	setNewPostsChecker = setInterval(function(){checkForNewPostsOrComments()}, 1800000); //30 minutes intervals
	

}
function addImageListeners(post_id, post_index, photo_index){
	var engage_post_image_id = 'engage_post_image_' + post_index + '_' + photo_index;

	var engage_post_id = 'id_of_post' + post_index;


	document.getElementById(engage_post_image_id).addEventListener('click', function() { openPhotoGalleryPopup(post_id, post_index, photo_index);}, false);
	
}

function addImageDeleteListeners(post_index,x){
	document.getElementById('delete_engage_image_' + x).addEventListener('click', function() { deleteEngageImage(post_index,x);}, false);
	
}
function deleteEngageImage(post_index, x){

	var confirmation_of_delete = confirm("Are you sure you wish to delete this image?");
	if(confirmation_of_delete){
		//get the id value stored in the hiddne input field within the comment html with index i	 
		var id_of_image_to_delete_selector  = '#id_of_image_to_delete' + x; 
		var id_of_image_to_delete = $(id_of_image_to_delete_selector).val();
		

		var token = localStorage.getItem("usertoken");
		var params = {'usertoken': token, 'id_of_image_to_delete' : id_of_image_to_delete};	

		$.ajax({
       			url: app_root_url + 'engage/delete_image.php',
       			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
				var result = data;
				var engagePosts = result.engagePosts;
				var number_of_posts = result.number_of_posts;
				var current_user_privilege = result.userDetails.user_privilege;
				var current_user_id = result.userDetails.userID;
				var total_number_of_comments = result.total_number_of_comments; //the number of posts from the engage section.
							
				var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.

				
				prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments,total_number_of_engage_images);
				$("#engage_post_area").listview('refresh');
				$("#engage_post_gallery_popup").popup("close");
			},
			error: function(xhr, status, error) {
				
				var error_message = 'There was a problem removing this image! System error: ' + error;
				alert(error_message);
					
							
			}
		});

	}

}
function openPhotoGalleryPopup(post_id, post_index, photo_index){
	ga_storage._trackEvent('Click', 'Engage page photo gallery popup');
	var current_user_privilege = currentUserPrivilege;
	var current_user_id =currentUserID;
	var post_user_id = engagePostUserIDs[post_index];
	
	var safe_current_user_privilege = $ESAPI.encoder().encodeForJavaScript(current_user_privilege);
	var safe_current_user_id = $ESAPI.encoder().encodeForJavaScript(current_user_id);

	var image_gallery_list_html = preparePhotoGalleryPopupHTML(post_id, post_index, photo_index, current_user_privilege, current_user_id, post_user_id);
	//insert the gallery photos to the pop up 
	$('#list_of_engage_photos').html(image_gallery_list_html).promise().done(function(){

		//add listeners to image delete buttons
		var number_of_images = engagePostImageURLs[post_index].length;
		if((safe_current_user_privilege == 2) || (safe_current_user_id == post_user_id)){
			for(var x=0;x < number_of_images;x++){
				addImageDeleteListeners(post_index,x);

			}
		}
		
		$("#engage_post_gallery_popup").popup("open");
		currentIndex = photo_index;
		lastImageIndex = number_of_images-1;
	});
	
}

function preparePhotoGalleryPopupHTML(post_id, post_index, photo_index, current_user_privilege, current_user_id, post_user_id){
	
	var safe_current_user_privilege = $ESAPI.encoder().encodeForJavaScript(current_user_privilege);
	var safe_current_user_id = $ESAPI.encoder().encodeForJavaScript(current_user_id);
	var safe_post_user_id = $ESAPI.encoder().encodeForJavaScript(engagePostUserIDs[post_index]);
	var image_gallery_list_html = '';

	var number_of_images = engagePostImageURLs[post_index].length;
	for(i = 0; i < number_of_images; i++){
		
		if(i == photo_index){
			image_gallery_list_html += '<li id="engage_image_index_' + i + '">';

		}else if(i < photo_index){
			image_gallery_list_html += '<li id="engage_image_index_' + i + '" class="middle_to_left">';
		}else if(i > photo_index){
			image_gallery_list_html += '<li id="engage_image_index_' + i + '" class="middle_to_right">';

		}
		image_gallery_list_html += '<div class="image_container">'
					+ '<img src="' + app_root_url + $ESAPI.encoder().encodeForHTMLAttribute(engagePostImageURLs[post_index][i]) + '" /></div>';

		if((safe_current_user_privilege == 2) || (safe_current_user_id == safe_post_user_id)){
			image_gallery_list_html += '<div id="delete_engage_image_' + i + '" class="delete_engage_image_button">'
						+ '<input type="hidden" id="id_of_image_to_delete' + i + '" value="' + $ESAPI.encoder().encodeForHTMLAttribute(engagePostImageIDs[post_index][i]) + '" />Delete Image</div>';
		}
		image_gallery_list_html += '</li>';			
	}
	return image_gallery_list_html;	
}

function preparePhotoGalleryListeners(){
	//we will call this function when the document initially loads as these IDs already exist in the document.
	$("#engage_post_gallery_popup").on("swipeleft",function(){
    		goToNextImage();		
  	});
	$("#engage_post_gallery_popup").on("swiperight",function(){
    		goToPreviousImage();

  	});
	$("#image_prev").on('click', function(){	
		goToPreviousImage();
		
	});

	$("#image_next").on('click', function(){
		goToNextImage();	
	});
}
function goToPreviousImage(){
	if(currentIndex == 0){
	}else{
		var currentImageSelector = "#engage_image_index_" + currentIndex;
		var prevImageSelector = "#engage_image_index_" + (currentIndex - 1);
		$(currentImageSelector).addClass('middle_to_right');
		$(prevImageSelector).removeClass('middle_to_left');
		currentIndex--;
	}
}
function goToNextImage(){
	if(currentIndex == lastImageIndex){
	}else{	
		var currentImageSelector = "#engage_image_index_" + currentIndex;
		var nextImageSelector = "#engage_image_index_" + (currentIndex + 1);
		$(currentImageSelector).addClass('middle_to_left');	
		$(nextImageSelector).removeClass('middle_to_right');
		currentIndex++;
	}
}


function checkForNewPostsOrComments(){
	
	//we should call this function when the user refreshes the page or "swipes down" in order to update the engage section
	var token = localStorage.getItem("usertoken");	
	var params = {'usertoken': token, 'original_count_of_posts' : original_count_of_posts, 'original_count_of_comments' : original_count_of_comments};		
	$.ajax({
       		url: app_root_url + 'engage/check_for_updates_engage_section.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
			var result = data;
			if(result.change_in_engage_posts_comments){
				//if there has been a change in the amount of engage posts or comments in the database then this code will execute
				var engagePosts = result.engagePosts;
				var current_number_of_posts = result.current_number_of_posts;
				var current_number_of_comments = result.current_number_of_comments;
				var current_user_privilege = result.userDetails.user_privilege;
				var current_user_id = result.userDetails.userID;
				var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.
						
				prepareEngagePosts(engagePosts, current_number_of_posts, current_user_privilege, current_user_id, current_number_of_comments, total_number_of_engage_images);

				//refresh the listview 
				$("#engage_post_area").listview('refresh');

				//check if notification is to be generated. this is currently set as false on server side but is ready to set up for future implementation
				var generate_notification = result.generate_notification;
				if(generate_notification){
					//if there are now more posts than before than generate_notification will be true.
					//so we can display a notification here 
				}
			}else{
				
				//if theres no changes than do nothing
			}
       		} //end success
   	});
}
function regenerateEngageData(){

	var token = localStorage.getItem("usertoken");	
	var params = {'usertoken': token};	
	$.ajax({
       		url: app_root_url + 'engage/get_engage_data.php',
		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
			var result = data;
			if(result.token_is_valid){
				
				var engagePosts = result.engagePosts;
				var number_of_posts = result.number_of_posts;
				var current_user_privilege = result.userDetails.user_privilege;
				var current_user_id = result.userDetails.userID;
				var total_number_of_comments = result.total_number_of_comments; //the number of posts from the engage section.
							
				var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.
				
				prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images);
						
				//refresh the listview 
				$("#engage_post_area").listview('refresh');

			}else{
				alert('We\'re sorry but there has been an authentication problem.');
			}
       		} //end success
		,
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem generating engage data! System error: ' + error;
			alert(error_message);
					
							
		}
   	});
}


/************************************************************************************************/

function prepareAppAfterLogin(result){
	
	//this function does everything thats need to prepare the app after a successful login or registration (including social login etc)
	//this function will also execute in a case where the user is already logged in (ie through detection of json token in local storage) and they open the app
	//we take in the data that comes back from the server side after our ajax request during login or registration process
	//this data will come from the database and will including posts and comments from the engage section of the app from different users
	//it will include porfile information of the user that has just logged in including display name and url for profile image

	var userDetails = result.userDetails;
	var engagePosts = result.engagePosts; //an array of posts
	var current_user_privilege = userDetails.user_privilege;
	var current_user_id = userDetails.userID;
	var number_of_posts = result.number_of_posts; //the number of posts from the engage section.
	var total_number_of_comments = result.total_number_of_comments; //the number of comments from the engage section.
	var total_number_of_engage_images = result.total_number_of_engage_images; //the number of images from the engage section.

	currentUserPrivilege = $ESAPI.encoder().encodeForJavaScript(current_user_privilege);
	currentUserID = $ESAPI.encoder().encodeForJavaScript(current_user_id);

	//need to pass in the current users user_privilege id to prepareEngagePosts so that we know whether to add a delete button beside each post and comment
	prepareEngagePosts(engagePosts, number_of_posts, current_user_privilege, current_user_id, total_number_of_comments, total_number_of_engage_images);

	getReadStoryMenuItems();
	generateUserProfilePage(userDetails);


	transitionToHomePage();
}

/*****************************************User account area functions*********************/
//functions for user account profile page/area

function insertDisplayName(name){
	var safe_display_name_for_html = $ESAPI.encoder().encodeForHTML(name);
	$("#profile_display_name").html(safe_display_name_for_html);
	$("#hidden_input_for_display_name").val(name);
	$("#contribute_input0").val(name);
	$('.user_welcome_message').html('Welcome ' + safe_display_name_for_html);	
	$('#panel_user_name').html(safe_display_name_for_html);
}


function generateUserProfilePage(userDetails){
	var userID = userDetails.userID;
	var display_name = userDetails.display_name;
	var email_address = userDetails.email_address;
	var is_facebook_profile_image = userDetails.isFacebookProfileImage;
	var userHasPassword = userDetails.userHasPassword;

	if(is_facebook_profile_image == 0){
		var safe_profile_image = app_root_url + $ESAPI.encoder().encodeForURL(userDetails.profile_image);

	}else{
		var safe_profile_image = $ESAPI.encoder().encodeForURL(userDetails.profile_image);
		
	}
	if(userHasPassword == 0){
		$('#add_password_button').show();
		$('#change_password_button').hide();	
	}else if(userHasPassword == 1){
		$('#add_password_button').hide();
		$('#change_password_button').show();
	}
	

	$("#panel_profile_image").attr('src',  safe_profile_image);
	$("#profile_pic").attr('src',  safe_profile_image);


	var safe_email_for_html = $ESAPI.encoder().encodeForHTML(email_address);
	$("#profile_email_address").html(safe_email_for_html);

	$("#hidden_input_for_email").val(email_address);
	$("#contribute_input1").val(email_address);

	insertDisplayName(display_name);
}
function removeUserProfileData(){
	$('.user_welcome_message').html('');
	$("#contribute_input0").val('');
	$("#contribute_input1").val('');

	$('#panel_user_name').html('');
	$("#profile_display_name").html('');
	$("#hidden_input_for_display_name").val('');


	$("#profile_pic").attr('src', '');
	$("#panel_profile_image").attr('src',  '');

	$("#profile_email_address").html('');
	$("#hidden_input_for_email").val('');	
}

function logOut(){
	//use navigator plugin for ios		
	navigator.notification.confirm("Are you sure you want to log out?", onConfirmLogOut);

	//var confirmation = confirm("Are you sure you want to log out?");
	//if(confirmation){
	//	onConfirmLogOut(1);
	//}
}
function onConfirmLogOut(buttonIndex){
	
	if(buttonIndex == 1){
		localStorage.clear();
		showLogInForm();
		showRegistrationForm();
		restyleLoginRegistrationPage();
		resetRegistrationFormValues();
		resetRegistrationImage();
		resetLoginFormValues();

		//reset contribution form
		resetAllContributionFormValues();
		resetEngageFormValues();
		resetReadFormValues();

		//reset user account area
		removeUserProfileData();
		resetDisplayNameArea();
		resetChangePasswordArea();
		resetAddPasswordArea();

		clearInterval(setNewPostsChecker);
		stopAllVideos();
		stopAllSoundcloudPlayers();

		//specify transition none because there seems to be a 2 second delay when there is a transition effect so it looks better without 
		$("#container_wrapper").pagecontainer("change", "#page-login", {transition: 'none'});
		closeSideMenu();
		//currentUserPrivilege = '';
		//currentUserID = '';
	}
}

/***************************************************READ SECTION GENERATION************************************************/

/************************************************menu items on main read page*************************************/

function generateReadMenuItem(menu_item_index, category_id, category_name, category_image_url){
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);
	var safe_category_image_url_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_image_url);
	var safe_category_name_for_html = $ESAPI.encoder().encodeForHTML(category_name);

 	var read_menu_item_html = '<li class="read_section_list_item" data-role="none"><a class="read_section_list_item_link normal_link" id="menu_item_' + menu_item_index +'" data-transition="none">'
			+ '<input id="input_field_for_category_id_' + menu_item_index + '" type="hidden" value="' + safe_category_id_for_attribute + '">'
			+ '<img class="read_section_list_item_img" src="' + app_root_url + safe_category_image_url_for_attribute + '" width="200" height="200"/>'
			+ '<span class="title_background"></span>';
			if(safe_category_id_for_javascript == 1797){
				//apply custom styling to text area so that it fits
				read_menu_item_html += '<span class="menu_item_title republic_of_data_style">';

			}else if(safe_category_id_for_javascript == 3071){ 
				//apply custom styling to text area so that it fits
				read_menu_item_html += '<span class="menu_item_title cycle_title_style">';
			}else{
				read_menu_item_html += '<span class="menu_item_title">';
			}
			
	read_menu_item_html += safe_category_name_for_html + '</span>'
			+ '</a></li>';
	return read_menu_item_html;
}


function generateFullReadMenu(number_of_categories, read_menu_data){
	var full_read_page_html = '';
	
	for(x=0; x < number_of_categories; x++){	
		//there are 12 categories

		full_read_page_html += generateReadMenuItem(x, read_menu_data[x].category_id, read_menu_data[x].category_name, read_menu_data[x].category_image_url);
		
		
		
	}
	return full_read_page_html;
}
function getReadStoryMenuItems(){	
	var token = localStorage.getItem("usertoken");
	var params = {'usertoken': token};
	$.ajax({
       		url: app_root_url + 'read/get_read_menu_items.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){

			var result = data;
			var token_is_valid = result.token_is_valid;
			if(token_is_valid){	

				var number_of_categories = result.read_menu_items.number_of_categories; 
				var read_menu_data = result.read_menu_items.read_menu_data; 


				var read_page_menu_items_html = generateFullReadMenu(number_of_categories, read_menu_data);
				$('#read_section_list').html(read_page_menu_items_html).promise().done(function(){ 
				

					for(x = 0; x < number_of_categories; x++){
						//for each category we create a skeleton page.
						//the list of stories will be inserted to these pages later on whenever the user clicks on the category
						//the reason we do this later on and not now is because it would be too much to load ALL data now when the app is initialized
						//and the user may not even want to visit those pages.
						var category_id = read_menu_data[x].category_id;
						var category_name = read_menu_data[x].category_name;
						var category_image_url = read_menu_data[x].category_image_url;

						var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);

						//first check if the jquery mobile page already exists in the document
						var page_selector = '#page-read-category-id-' + safe_category_id_for_javascript;
						if($(page_selector).length){
				
							//this category page already exists in the document so do nothing here
							
						}else{
							//generate skeleton page.
							var display_name = $("#hidden_input_for_display_name").val();
							var read_category_page_html = generateCategoryPage(category_id, category_name, display_name);
						$('#container_wrapper').append(read_category_page_html);
						}
						//add a listener to the menu item
						//when menu item is clicked then generate the list of stories within that category and insert to the list of stories ul
			
						addMenuListeners(x);
		
					}
				});
			}else{
				//token is not valid.
				alert("we're sorry. There seems to be an authentication problem.");

			}
		
		},
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem getting menu items! System error: ' + error;
			alert(error_message);
					
							
		}
	});
}
function getLatestStories(){	
	$('.loading_page_message').html('Loading...');
	$('.loading_page_message').show();
	var token = localStorage.getItem("usertoken");
	var params = {'usertoken': token};
	$.ajax({
       		url: app_root_url + 'read/get_latest_stories.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){

			var result = data;
			var token_is_valid = result.token_is_valid;
			if(token_is_valid){	
				var latest_stories_html = '';
				var category_id = '13'; 
				var read_post_index = 0;
				for(x = 0; x < 12; x++){	
					//loop through each category
					var number_of_latest_stories = result.story_data[x].category_latest_story_data.number_of_latest_stories_in_category;
					if(number_of_latest_stories > 0){	
						//if there are more than zero latest stories in this category then we come here.
						var latest_stories_data = result.story_data[x].category_latest_story_data;
						
						var category_name = result.story_data[x].category_name;
						//add the category name heading to the html and start off a ul tag.
						latest_stories_html += '<div class="intro_section"><h3 class="latest_story_header story_category_header">' + category_name + '</h3></div><ul class="list_of_read_stories list_of_latest_stories">';
						//loop through all latest stories of this category
							
						for(y = 0; y < number_of_latest_stories; y++){	
							var post_title = latest_stories_data[y].post_title;
							console.log("post_title " + post_title);
							var post_excerpt = latest_stories_data[y].post_excerpt;
							var post_date_gmt = latest_stories_data[y].post_date_gmt;
							var post_author_name = latest_stories_data[y].post_author_name;
					
							var object_id = latest_stories_data[y].object_id;
							var post_thumbnail_url = latest_stories_data[y].post_thumbnail_url;
					
							var story_link = latest_stories_data[y].guid;
							
							//generate the list item here
							latest_stories_html += generateStoryListItem(category_id, category_name, read_post_index, object_id, post_title, post_date_gmt, post_author_name ,story_link, post_excerpt, post_thumbnail_url);
							read_post_index++;
						}

						//finish off the ul
						latest_stories_html += '</ul>';
						
					}

				}
				//all of the latest stories uls will have been concatenated together at this stage so we now add them to the document.
				$('#latest_articles_area').html(latest_stories_html).promise().done(function(){ 
					$('.loading_page_message').html('');
					$('.loading_page_message').hide();
					for(x = 0; x < read_post_index; x++){

						var unique_story_index = '13_' + x;
						var category_name = ""; //we do this because in this particular case we have multiple categories
						addStoryListeners(category_id, category_name, unique_story_index); 
					}
				});	
			}else{
				//token is not valid.
				alert("we're sorry. There seems to be an authentication problem.");

			}
		
		},
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem getting latest stories! System error: ' + error;
			alert(error_message);
					
							
		}
	});
}
function addMenuListeners(i){
	$('#menu_item_' + i).on('click', function(){
		getCategoryData(i);
	});
	//document.getElementById("menu_item_" + i).addEventListener('click', function(){getCategoryData(i);}, false);
		
}
/*********************************INDIVIDUAL READ category page generation eg arts desk******************************************************/

function getCategoryData(i){	
	//console.log('clicked');
	$('.read_section_list_item_link').off('click');
	$('.loading_page_message').html('Please wait...');
	$('.loading_page_message').show();
	//we will always need to do the ajax request once a category is chosen as there may be more stories since the last time the page was generated.
	var category_id = $("#input_field_for_category_id_" + i).val();
	var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);

	var load_more_button_area_selector = '#load_more_button_area_' + safe_category_id_for_javascript;
	$(load_more_button_area_selector).html('');
						
	var token = localStorage.getItem("usertoken");
	var params =  {'usertoken': token, 'category_id':category_id};
	
	$.ajax({
       		url: app_root_url + 'read/get_category_data.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
	
			var result = data; //JSON.parse(data);	
			var token_is_valid = result.token_is_valid;
			if(token_is_valid){	
				
				var total_number_of_stories = result.story_data.number_of_stories_in_category
				//number_of_initial_stories_fetched will have a maximum value of 100
				var number_of_initial_stories_fetched = result.story_data.category_story_data.number_of_initial_stories_fetched;
				
				var safe_number_of_stories = $ESAPI.encoder().encodeForJavaScript(result.story_data.number_of_stories_in_category); 
				var id_of_last_object_fetched = result.story_data.category_story_data.id_of_last_object_fetched;
				var limit_of_stories = result.story_data.category_story_data.limit_of_stories;
				

				var category_id = result.story_data.category_id;
				var category_name = result.story_data.category_name;
				var category_story_data = result.story_data.category_story_data;
				var list_of_stories = '';


				var page_id = '#page-read-category-id-' + safe_category_id_for_javascript;
				$("#container_wrapper").pagecontainer("change", page_id, {transition: 'none'});
			
				//prepare the list of stories which will appear on each category page.
				var number_of_stories_to_display = number_of_initial_stories_fetched;
				
				
				var read_post_index = 0;
				for(x= 0; x < number_of_stories_to_display; x++){
				
					var read_story_page = '';
					var post_title = category_story_data[x].post_title;
					var post_excerpt = category_story_data[x].post_excerpt;
					var post_date_gmt = category_story_data[x].post_date_gmt;
					var post_author_name = category_story_data[x].post_author_name;
				
					var object_id = category_story_data[x].object_id;
					var post_thumbnail_url = category_story_data[x].post_thumbnail_url;
					
					var story_link = category_story_data[x].guid;
					//console.log(" new story_link " + story_link);
					list_of_stories += generateStoryListItem(category_id, category_name, read_post_index, object_id, post_title, post_date_gmt, post_author_name ,story_link, post_excerpt, post_thumbnail_url);
					//console.log(" read_post_index " + read_post_index);
					//console.log("object_id " + object_id);
					read_post_index++; 	
				}

				var list_of_read_stories_selector = '#list_of_read_stories_' + safe_category_id_for_javascript;
				var category_header_selector = '#category_header_' + safe_category_id_for_javascript;

				var safe_category_name_for_html = $ESAPI.encoder().encodeForHTML(category_name);
				$(category_header_selector).html(safe_category_name_for_html);
				$(list_of_read_stories_selector).html(list_of_stories).promise().done(function(){
					$('.loading_page_message').html('');
					$('.loading_page_message').hide();
    					//your callback logic 
					for(x= 0; x < number_of_stories_to_display; x++){
						
						var unique_story_index = category_id + '_' + x;
						
						addStoryListeners(category_id, category_name, unique_story_index); 
						
					}
					addDots();
					//check if total number of stories for this category is greater than 100
					//and if so, add a load more button to give the option to load more stories.
					if(total_number_of_stories > limit_of_stories){
						//display load more button
						var ellipsis_dots_html = generateLoadMoreEllipsisDotsHTML(safe_category_id_for_javascript);
					
						var load_more_button_area_selector = '#load_more_button_area_' + safe_category_id_for_javascript;
						$(load_more_button_area_selector).html(ellipsis_dots_html);
						$('#ellipsis_dots_' + safe_category_id_for_javascript).on('click', function(){
							loadMoreStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index);
						});
						//document.getElementById('ellipsis_dots_' + safe_category_id_for_javascript).addEventListener('click', function(){ loadMoreStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index); }, false);
					}else{
						//remove the load more ellipsis as there are no more stories to load
						var load_more_button_area_selector = '#load_more_button_area_' + safe_category_id_for_javascript;
						$(load_more_button_area_selector).html('');
						
					}
					//add listeners back on menu items as we had removed them to prevent double requests.
					for(x = 0; x < 12; x++){
						addMenuListeners(x);

					}
					
				});
			}else{
					$('.loading_page_message').html('');
					$('.loading_page_message').hide();
				//token is not valid.
				alert("we're sorry. There seems to be an authentication problem.");
				//add listeners back on menu items as we had removed them to prevent double requests.
				for(x = 0; x < 12; x++){
					addMenuListeners(x);

				}
			}	
		},
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem getting category data! System error: ' + error;
			alert(error_message);
					
							
		}
	});
}

function addDots(){
	$(".read_story_intro_paragraph").dotdotdot({
						/*	The text to add as ellipsis. */
						ellipsis	: '... ',
 
						/*	How to cut off the text/html: 'word'/'letter'/'children' */
						wrap		: 'word',
 
						/*	Wrap-option fallback to 'letter' for long words */
						fallbackToLetter: true,
 
						/*	jQuery-selector for the element to keep and put after the ellipsis. */
						after		: null,
 
						/*	Whether to update the ellipsis: true/'window' */
						watch		: true,
	
						/*	Optionally set a max-height, can be a number or function.
							If null, the height will be measured. */
						height		: null,
 
						/*	Deviation for the height-option. */
						tolerance	: 0,
 
						/*	Callback function that is fired after the ellipsis is added,
							receives two parameters: isTruncated(boolean), orgContent(string). */
						callback	: function( isTruncated, orgContent ) { },
 
						lastCharacter	: {
 
							/*	Remove these characters from the end of the truncated text. */
							remove		: [ ' ', ',', ';', '.', '!', '?' ],
 
							/*	Don't add an ellipsis if this array contains 
								the last character of the truncated text. */
							noEllipsis	: []
		}
	});


}
function startDotAnimation(category_id){
	
	$('#dot_' + category_id + '_0').addClass('move_animation');
	$('#dot_' + category_id + '_1').addClass('move_animation1');
	$('#dot_' + category_id + '_2').addClass('move_animation2');

}
function loadMoreStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index){
	$('#ellipsis_dots_' + category_id).off("click");
	//console.log(id_of_last_object_fetched);
	ga_storage._trackEvent('Click', 'Load more ' +  category_name + ' stories');
	startDotAnimation(category_id);
	
	var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);
	
	var token = localStorage.getItem("usertoken");
	var params =  {'usertoken': token, 'category_id':category_id, 'id_of_last_object_fetched' : id_of_last_object_fetched};
	
	$.ajax({
       		url: app_root_url + 'read/get_more_stories.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
	
			var result = data; //JSON.parse(data);	
			var token_is_valid = result.token_is_valid;
			if(token_is_valid){
				
				var starting_index_of_stories = read_post_index;
				var list_of_more_stories = '';
				var more_stories = result.more_stories;
				var number_of_more_stories_fetched = more_stories.number_of_more_stories_fetched;
				
				for(x= 0; x < number_of_more_stories_fetched; x++){
				
			
					var post_title = more_stories[x].post_title;
					var post_excerpt = more_stories[x].post_excerpt;
					var post_date_gmt = more_stories[x].post_date_gmt;
					var post_author_name = more_stories[x].post_author_name;
					var object_id = more_stories[x].object_id;
					var post_thumbnail_url = more_stories[x].post_thumbnail_url;
					
					var story_link = more_stories[x].guid;
					
					list_of_more_stories += generateStoryListItem(category_id, category_name, read_post_index, object_id, post_title, post_date_gmt, post_author_name ,story_link, post_excerpt, post_thumbnail_url);
					
					read_post_index++; 	
				}
				var number_of_stories_fetched_so_far = read_post_index;
				var list_of_read_stories_selector = '#list_of_read_stories_' + safe_category_id_for_javascript;
				
			
				$(list_of_read_stories_selector).append(list_of_more_stories).promise().done(function(){
    					//your callback logic 
					for(x= starting_index_of_stories; x < read_post_index; x++){
						
						var unique_story_index = category_id + '_' + x;
						
						addStoryListeners(category_id, category_name, unique_story_index); 
						
					}
					
					addDots();
					//check if total number of stories for this category is greater than number_of_stories_fetched_so_far
					//and if so, add a load more button to give the option to load more stories.
					
					if(total_number_of_stories > number_of_stories_fetched_so_far){
						//display load more ellipsis
						var id_of_last_object_fetched = result.more_stories.id_of_last_object_fetched;
						
						var ellipsis_dots_html = generateLoadMoreEllipsisDotsHTML(safe_category_id_for_javascript);
					
						var load_more_button_area_selector = '#load_more_button_area_' + safe_category_id_for_javascript;	
						$(load_more_button_area_selector).html(ellipsis_dots_html);
						$('#ellipsis_dots_' + safe_category_id_for_javascript).on('click', function(){
							loadMoreStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index);
						});

					}else{
						//remove the load more ellipsis as there are no more stories to load
						var load_more_button_area_selector = '#load_more_button_area_' + safe_category_id_for_javascript;
						$(load_more_button_area_selector).html('');
						
					}
						
					
				});

			}else{
				//token is not valid.
				alert("we're sorry. There seems to be an authentication problem.");
			}	
		},
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem loading more stories! System error: ' + error;
			alert(error_message);
					
							
		}
	});

}

function generateLoadMoreEllipsisDotsHTML(safe_category_id_for_javascript){
	var ellipsis_dots_html = '<div class="ellipsis_dots_area"  id="ellipsis_dots_' + safe_category_id_for_javascript + '">'
			+ '<span class="ellipsis_dot" id="dot_' + safe_category_id_for_javascript + '_0"><i class="fa fa-circle" aria-hidden="true"></i></span>'
			+ '<span class="ellipsis_dot dot1" id="dot_' + safe_category_id_for_javascript + '_1"><i class="fa fa-circle" aria-hidden="true"></i></span>'
			+ '<span class="ellipsis_dot dot2" id="dot_' + safe_category_id_for_javascript + '_2"><i class="fa fa-circle" aria-hidden="true"></i></span></div>';

	return ellipsis_dots_html;
}

function addStoryListeners(category_id, category_name, unique_story_index){
	var safe_unique_story_index_for_javascript = $ESAPI.encoder().encodeForJavaScript(unique_story_index);

	document.getElementById('story_id_' + safe_unique_story_index_for_javascript).addEventListener('click', function(){getStoryContent(category_id, category_name, unique_story_index);}, false);
	
}

$("#search_read_section_form").on('submit', function(e){
	$('.loading_page_message').html('Please wait...');
	$('.loading_page_message').show();
	//console.log('search');
	$('#submit_search').attr('disabled','disabled');
	e.preventDefault(); 
	var search_input_text  = $('#search_read_section_input_field').val();
	var search_text_length = search_input_text.length;

	if(search_text_length < 3 || search_text_length == null || search_text_length > 160){
		
		var isSearchQueryValid = false;
	}else{
		//length is valid
		var isSearchQueryValid = true;		
	}

	if(!isSearchQueryValid){
		//search query is not valid
		$('.search_feedback_area').fadeIn(100); 
		$('#submit_search').removeAttr('disabled');
			$('.loading_page_message').html('');
					$('.loading_page_message').hide();
	}else{
		//search query contains more than 3 characters and all characters are valid
		getSearchData(search_input_text);
	}
});


function getSearchData(search_input_text){	
	var search_query = search_input_text; 
	var category_id = '0';
	var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);

	var load_more_button_area_selector = '#load_more_button_area_' + category_id;
	$(load_more_button_area_selector).html('');
						
	var token = localStorage.getItem("usertoken");
	var params = {'usertoken': token, 'search_query':search_query};

	$.ajax({
       		url: app_root_url + 'read/get_search_data.php',
		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
			var result = data;
			var token_is_valid = result.token_is_valid;
			if(token_is_valid){	
				var required_fields_set = result.required_fields_set;
			
				if(required_fields_set){
					var query_text_is_valid = result.query_text_is_valid;

					if(query_text_is_valid){
						var clean_search_query = result.clean_search_query;
						
						var total_number_of_stories = result.total_number_of_search_stories; 
						var story_data = result.search_data.story_data; 
				
						var number_of_initial_stories_fetched = result.search_data.number_of_initial_stories_fetched;
						var limit_of_stories = result.search_data.limit_of_stories;
				
				
						var safe_total_number_of_stories = $ESAPI.encoder().encodeForJavaScript(total_number_of_stories); 

						var id_of_last_object_fetched = result.search_data.id_of_last_object_fetched;
			
						var category_name = 'Search Results';
					
				
						//prepare the list of stories which will appear on each category page.
						var number_of_stories_to_display = number_of_initial_stories_fetched;
				
						var list_of_stories = '';
						var read_post_index = 0;


						for(x= 0; x < number_of_stories_to_display; x++){
					
							var post_title = story_data[x].post_title;
					
							var post_excerpt = story_data[x].post_excerpt;
							var post_date_gmt = story_data[x].post_date_gmt;
							var post_author_name = story_data[x].post_author_name;
							var object_id = story_data[x].object_id;
					
							var individual_category_name = story_data[x].category_name;
					
							var post_thumbnail_url = story_data[x].post_thumbnail_url;
							var story_link = story_data[x].guid;
							list_of_stories += generateStoryListItem(category_id, individual_category_name, read_post_index, object_id, post_title, post_date_gmt, post_author_name ,story_link, post_excerpt, post_thumbnail_url);
					

							read_post_index++; 	
						}
				
						var display_name = $("#hidden_input_for_display_name").val();
						var search_page_template_html = generateCategoryPage('0', 'Search Results',display_name);
						$('#container_wrapper').append(search_page_template_html);
						//console.log("search_page_template_html " + search_page_template_html);

						var list_of_read_stories_selector = '#list_of_read_stories_' + category_id;
						var category_header_selector = '#category_header_' + category_id;
				
						$(category_header_selector).html('"' + clean_search_query + '"');
						$("#intro_paragraph_" + category_id).html(total_number_of_stories + ' search results found');
			
						$(list_of_read_stories_selector).html(list_of_stories).promise().done(function(){
    							//your callback logic 
							for(x= 0; x < number_of_stories_to_display; x++){
					
								var unique_story_index = category_id + '_' + x;
						
								addStoryListeners(category_id, '', unique_story_index); 
						
							}
							addDots();
							var page_id = '#page-read-category-id-' + category_id;
							$("#container_wrapper").pagecontainer("change", page_id, {transition: 'none'});
							//check if total number of stories for this category is greater than the limit we fetched
							//and if so, add a load more button to give the option to load more stories.
							if(total_number_of_stories > limit_of_stories){
								//display load more button
								var ellipsis_dots_html = generateLoadMoreEllipsisDotsHTML(category_id);
					
						
								$('#load_more_button_area_' + category_id).html(ellipsis_dots_html);
								$('#ellipsis_dots_' + safe_category_id_for_javascript).on('click', function(){
									loadMoreSearchStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index, search_input_text);
								});
								//document.getElementById('ellipsis_dots_' + category_id).addEventListener('click', function(){ loadMoreSearchStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index, search_input_text); }, false);
				
							}else{
								//remove the load more ellipsis as there are no more stories to load
								$('#load_more_button_area_' + category_id).html('');
						
							}
							$('#submit_search').removeAttr('disabled');
							$('.loading_page_message').html('');
							$('.loading_page_message').hide();
						});
					}else{
						$('#submit_search').removeAttr('disabled');
						$('.loading_page_message').html('');
						$('.loading_page_message').hide();
						//query text is not valid.
						alert("Error. Search query is invalid.");
					}	


				}else{
					$('.loading_page_message').html('');
					$('.loading_page_message').hide();
					$('#submit_search').removeAttr('disabled');	
					alert("Unexpected error. Please contact support.");
				}	


			}else{
				$('.loading_page_message').html('');
				$('.loading_page_message').hide();
				$('#submit_search').removeAttr('disabled');
				//token is not valid.
				alert("we're sorry. There seems to be an authentication problem.");
			}	
		},
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem getting search data! System error: ' + error;
			alert(error_message);
					
							
		}
	});
}
function loadMoreSearchStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index, search_input_text){
	$('#ellipsis_dots_' + category_id).off("click");
	startDotAnimation(category_id);
	//console.log('more search');
	//console.log("id_of_last_object_fetched " + id_of_last_object_fetched);
	var search_query = search_input_text; 
	//console.log("id_of_last_object_fetched " + id_of_last_object_fetched);
	//console.log("category_id " + category_id);
	var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	

	//var load_more_button_area_selector = '#load_more_button_area_' + category_id;								
	//$(load_more_button_area_selector).html('');
	
	var token = localStorage.getItem("usertoken");
	var params =  {'usertoken': token, 'search_query':search_query, 'id_of_last_object_fetched' : id_of_last_object_fetched};
	
	$.ajax({
       		url: app_root_url + 'read/get_more_search_stories.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
			//console.log(JSON.stringify(data));
			var result = data; //JSON.parse(data);	
			var token_is_valid = result.token_is_valid;
			var story_data = result.more_search_stories.story_data;

			//console.log(JSON.stringify(story_data));
			if(token_is_valid){
				//console.log("now" + result.more_search_stories.id_of_last_object_fetched);
				var starting_index_of_stories = read_post_index;
				//console.log("starting_index_of_stories " + starting_index_of_stories);
				var list_of_more_search_stories = '';
				var story_data = result.more_search_stories.story_data;
				var number_of_more_stories_fetched = result.more_search_stories.number_of_more_stories_fetched;
				//console.log("0 number_of_more_stories_fetched " + number_of_more_stories_fetched);
				for(x= 0; x < number_of_more_stories_fetched; x++){
				
			
					var post_title = story_data[x].post_title;
					var post_excerpt = story_data[x].post_excerpt;
					var post_date_gmt = story_data[x].post_date_gmt;
					var post_author_name = story_data[x].post_author_name;
					var object_id = story_data[x].object_id;
					var post_thumbnail_url = story_data[x].post_thumbnail_url;

				

					var story_link = story_data[x].guid;

					

					list_of_more_search_stories += generateStoryListItem(category_id, category_name, read_post_index, object_id, post_title, post_date_gmt, post_author_name ,story_link, post_excerpt, post_thumbnail_url);
					//console.log("list_of_more_search_stories " + list_of_more_search_stories);
					//console.log("object_id" + object_id);
					read_post_index++; 	
				}
				
				var number_of_stories_fetched_so_far = read_post_index;
				var list_of_read_stories_selector = '#list_of_read_stories_' + category_id;
				//console.log("list_of_more_search_stories " + list_of_more_search_stories);
			
				$(list_of_read_stories_selector).append(list_of_more_search_stories).promise().done(function(){
    					//your callback logic 
					for(x= starting_index_of_stories; x < read_post_index; x++){
						

							
						var unique_story_index = category_id + '_' + x;
						
						addStoryListeners(category_id, '', unique_story_index); 
						
					}
					addDots();
					//check if total number of stories for this category is greater than number_of_stories_fetched_so_far
					//and if so, add a load more button to give the option to load more stories.
					//console.log("1 number_of_stories_fetched_so_far " +  number_of_stories_fetched_so_far);
					if(total_number_of_stories > number_of_stories_fetched_so_far){
						//display load more button
						var id_of_last_object_fetched = result.more_search_stories.id_of_last_object_fetched;

						var ellipsis_dots_html = generateLoadMoreEllipsisDotsHTML(category_id);
					
						$('#load_more_button_area_' + category_id).html(ellipsis_dots_html);
						$('#ellipsis_dots_' + safe_category_id_for_javascript).on('click', function(){
							loadMoreSearchStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index, search_input_text);
						});
						
						//document.getElementById('ellipsis_dots_' + category_id).addEventListener('click', function(){ loadMoreSearchStories(category_id, category_name, id_of_last_object_fetched, total_number_of_stories, read_post_index, search_input_text); }, false);
				
					}else{
						//remove the load more ellipsis as there are no more stories to load
						$('#load_more_button_area_' + category_id).html('');
						
					}
					
					
				});

			}else{
				//token is not valid.
				alert("we're sorry. There seems to be an authentication problem.");
			}	
		},
		error: function(xhr, status, error) {
				
			var error_message = 'There was a problem loading more stories! System error: ' + error;
			alert(error_message);
					
							
		}
	});

}

function generateCategoryPage(category_id, category_name, display_name){
	var safe_display_name_for_html = $ESAPI.encoder().encodeForHTML(display_name);
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);

	var read_category_page_html = '<div data-role="page" id="page-read-category-id-' + safe_category_id_for_attribute + '" class="container read_category_page">'
			+ '<div data-role="content">'
			+ '<div class="content-primary">'
			+ '<div class="intro_section"><h2 id="category_header_' + safe_category_id_for_attribute + '" class="section_header"></h2>'
			+ '<p id="intro_paragraph_' + safe_category_id_for_attribute + '" ></p></div>'		
			+ '<ul id="list_of_read_stories_' + safe_category_id_for_attribute + '" class="list_of_read_stories">'
			+ '</ul><!-- load more button goes here--><div class="load_more_button_area" id="load_more_button_area_' + safe_category_id_for_attribute + '" ></div></div>'
			+ '</div><!--/content-->'	
			+ '</div><!--/page-read-->';
	return read_category_page_html;

}				

	
					
function generateStoryListItem(category_id, category_name, read_post_index, object_id, post_title, post_date_gmt, post_author,story_link, post_excerpt, post_thumbnail_url){
	//this function takes in category id of the read section
	//and also the wordpress object id of this particular post.
	//in each story list item we want to generate a link to the page where the story is displayed.
	//instead of using a href we will add a click event listener to the id of the element so that we can also call a function and do an ajax request

	
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	var safe_object_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(object_id);
	var safe_post_title_for_html = $ESAPI.encoder().encodeForHTML(post_title);
	var safe_post_thumbnail_url_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(post_thumbnail_url);

	//console.log("search safe_category_id_for_attribute " + safe_category_id_for_attribute);
	//console.log("search safe_category_id_for_javascript " + safe_category_id_for_javascript);
	if(post_excerpt.length > 0){
		//we wont use encodeForHTML on this because we are using filter_sanitize on the post_content on the server side 
		//for when a post excerpt doesnt exist so it would be then double encoded if we encoded it here also.
		var post_excerpt_for_html = post_excerpt;

	}else{
		var post_excerpt_for_html = '';

	}
	
	var unique_story_index = safe_category_id_for_attribute + '_' + read_post_index;

	var read_story_list_item_html = '<li class="read_story_list_item" id="story_id_' + unique_story_index +'">'
			+ '<input id="input_field_for_story_id_' + unique_story_index + '" type="hidden" value="' + safe_object_id_for_attribute + '">'
			+ '<h3 class="read_story_headline">' + safe_post_title_for_html + '</h3>'
			+ '<div class="read_story_img_intro_wrapper">'
			+ '<div class="read_story_list_item_image"><img src="' + safe_post_thumbnail_url_for_attribute + '" width="300" height="200" alt="Story featured image"/></div>'
			+ '<p class="read_story_intro_paragraph">' + post_excerpt_for_html + '</p>'
			+ '</div>'
			+ '</li>';
	return read_story_list_item_html;
	
}



function generateStoryPage(audio_exists, audio_embed_code, video_exists, video_embed_code, category_id, category_name, object_id, post_title, post_date_gmt, post_author,story_link, post_thumbnail_url, post_content, post_image_credit, comments_on_post,post_author_description, post_author_photo, display_name, subscriber_comments){
	
	var safe_story_link = $ESAPI.encoder().encodeForURL(story_link);
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	var safe_category_name_for_html = $ESAPI.encoder().encodeForHTML(category_name);
	
	var safe_object_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(object_id);
	var safe_display_name_for_html = $ESAPI.encoder().encodeForHTML(display_name);

	var safe_post_thumbnail_url_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(post_thumbnail_url);
	//console.log("post_thumbnail_url " + post_thumbnail_url);
	if(post_image_credit.length > 0){
		
		var safe_post_image_credit_for_html = $ESAPI.encoder().encodeForHTML(post_image_credit);

	}else{
		var safe_post_image_credit_for_html = '';

	}
	var safe_post_title_for_html = $ESAPI.encoder().encodeForHTML(post_title);
	var safe_post_author_for_html = $ESAPI.encoder().encodeForHTML(post_author);
	var safe_post_date_for_html = $ESAPI.encoder().encodeForHTML(post_date_gmt);

	if(post_author_photo.length > 0){
		//if post author photo string is not empty
		var safe_post_author_photo_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(post_author_photo);

	}else{
		var safe_post_author_photo_for_attribute = app_root_url + 'images/profile_images/blank-avatar.png';

	}
	if(post_author_description.length > 0){
		
		var safe_post_author_description_for_html = $ESAPI.encoder().encodeForHTML(post_author_description);

	}else{
		var safe_post_author_description_for_html = '';

	}

	var read_story_page_html = '<div data-role="page" id="page-read-' + safe_category_id_for_attribute + '-' + safe_object_id_for_attribute + '" class="container read_story_page">'
			+ '<div data-role="content">'
			+ '<div class="content-primary">'
			+ '<div class="intro_section"><h2 class="section_header story_category_header">' + category_name + '</h2>'

			+ '</div>'

			+ '<div class="story_container">';

			if(video_exists){
				read_story_page_html += '<div class="video-wrapper">' + video_embed_code + '</div>';	
			}else if(audio_exists){

				read_story_page_html += '<div class="video-wrapper">' + audio_embed_code + '</div>';	
			}else{
				read_story_page_html += '<img class="read_story_main_image" src="' + post_thumbnail_url + '" alt="Story featured image"/>';	
			}	

			if(audio_exists){
				read_story_page_html += '<div class="share_container"><p class="story_image_credit"> ' + safe_post_image_credit_for_html + ' </p></div>';


			}else{

	read_story_page_html += '<div class="share_container"><p class="story_image_credit"> ' + safe_post_image_credit_for_html + ' </p>'
			+ '<span id="share_button_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="share_button"><i class=" fa fa-share-alt"></i></span>'
			+ '<ul id="sharing_list_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="sharing_list">'
			
			+ '<li id="share_on_twitter_button_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '">'
			+ '<i class="fa fa-twitter"></i>'
			+ '<span class="social_sharing_text"> Twitter</span></li>'

			+ '<li id="close_share_list_button_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="close_share_list_button"><i class=" fa fa-times"></i></li>'
			+ '</ul>'
			+ '</div>';

			}
	read_story_page_html += '<h3 class="read_story_headline">' + safe_post_title_for_html + '</h3>'							
			+ '<p class="story_author_date_area"> ' + safe_post_author_for_html + '<span class="lower_case">  x  </span>' + safe_post_date_for_html + ' </p>'
			+ '<div id="story_content_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="story_content">' + post_content + '</div>'

			+ '<div class="about_author_area" >'

			+ '<div class="author_picture_area" >'
			+ '<div class="author_picture_frame" ><img src="' + safe_post_author_photo_for_attribute + '" width="150" height="150" alt="Author image"/></div>'
			+ '</div><!--/author_picture_area-->'

			+ '<div class="author_description_area" >'
			+ '<p class="author_name">' + safe_post_author_for_html + '</p>'
			+ '<p class="author_description">' + safe_post_author_description_for_html + '</p>'
			+ '</div><!--/author_description_area-->'
			+ '</div><!--/about_author_area-->'


			+ '<div id="full_comments_area_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="full_comments_area" >'
			+ generateFullCommentsArea(category_id, object_id, comments_on_post, subscriber_comments)
			+ '</div><!--/full_comments_area-->'
			+ '</div><!--/story_container-->'
			+ '</div><!--/content-primary-->'
			+ '</div><!--/content-->'	
			+ '</div><!--/page-read-->';

	
	return read_story_page_html;
	
}


function generateFullCommentsArea(category_id, object_id, comments_on_post, subscriber_comments){
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	var safe_object_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(object_id);
	if(comments_on_post.length > 1){
		var response_string = ' Responses';
	}else{
		var response_string = ' Response';

	}
	if(subscriber_comments.length > 0){
		if(subscriber_comments.length > 1){
			var subscriber_response_string = subscriber_comments.length + ' Subscriber Responses';
		}else{
			var subscriber_response_string = subscriber_comments.length + ' Subscriber Response';

		}
	}else{
		var subscriber_response_string = '';

	}
	var full_comments_html = '';

			if(comments_on_post.length > 0){
				full_comments_html += '<div class="original_comments_area" >'
						+ '<h4 class="original_news_comments_heading" >' + comments_on_post.length + response_string + '</h4>'
						+ '<ul data-role="none">'
						+ generateOriginalNewsComments(comments_on_post) 
						+ '</ul></div>';
			}
			
	full_comments_html += '<div class="subscriber_comments_area" >'
			+ '<h4 id="subscriber_comments_heading' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="original_news_comments_heading" >' + subscriber_response_string + '</h4>'
			+ '<ul id="subscribers_comments_area_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" data-role="none">';				
			
			if(subscriber_comments.length > 0){
				full_comments_html += generateSubscriberNewsComments(subscriber_comments, object_id);

			}
	full_comments_html += '</ul><div class="refresh_subscribers_comments_wrapper" >'
			+ '<span class="refresh_subscribers_comments_area" id="refresh_subscribers_comments_area' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" ><i class="fa fa-refresh"></i></span>'
			+ '</div>'
			+ '</div><!--/subscriber_comments_area-->';

			
	full_comments_html += '<div class="read_comment_box_area">'
			+ '<form id="read_comment_box_form_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" name="read_comment_box_form_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" method="post" action="">'
			
			+ '<div class="form_divider">'
			
			+ '<label class="original_news_comments_heading" for="read_comment_textarea_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '">Leave a comment</label>'
			+ '<input id="input_field_for_read_comment_object_id_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" type="hidden" value="' + safe_object_id_for_attribute + '">'	
			+ '<textarea id="read_comment_textarea_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="read_comment_textarea" name="read_comment_textarea_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" minlength="2" maxlength="2000" placeholder="Write your comment here..."  rows="2" data-role="none" required></textarea>'
			+ '<p id="read_comment_box_feedback_area_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="read_comment_box_feedback_area post_feedback_area"><span id="read_comment_box_popover_rectangle_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="popover_rectangle"></span><span class="popover_triangle"></span></p>'
			+ '<p id="read_comment_form_characters_remaining_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" class="comment_form_characters_remaining" ></p>'
			+ '<p class="tiny_text align_left"><i>Note: Your comment will appear within the app only (not on our website).</i></p>'
			+ '</div><!--/form_divider-->'
			
			+ '<div class="form_divider">'					
			+ '<div class="button_wrapper">'
			+ '<input type="submit" id="submit_read_comment_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute + '" data-role="none" class="button_style wide_button" value="Post comment"/>'
			+ '</div><!--/button_wrapper-->'
			+ '</div><!--/form_divider-->'
				
			+ '</form>'
			+ '</div><!--/read_comment_box_area-->';


	return full_comments_html;

}
function generateSubscriberNewsComments(subscriber_comments, object_id){

	var subscriber_news_comments_html = '';
	var index = 0;
	subscriber_comments.forEach(function(subscriber_comment_data) {
		
		subscriber_news_comments_html += createSubscriberNewsComment(subscriber_comment_data, index, object_id);
		index++;
	});
	return subscriber_news_comments_html;
}



function createSubscriberNewsComment(subscriber_comment_data, index, object_id){
	
	var safe_comment_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(subscriber_comment_data.readCommentID);
	
	var safe_comment_author_for_html = $ESAPI.encoder().encodeForHTML(subscriber_comment_data.readCommentUserData.display_name);
	var safe_comment_date_for_html = $ESAPI.encoder().encodeForHTML(subscriber_comment_data.readCommentDateAndTime);
	var safe_comment_user_id_for_javascript = $ESAPI.encoder().encodeForHTML(subscriber_comment_data.readCommentUserData.userID);
	var current_user_id = currentUserID;
	var current_user_privilege = currentUserPrivilege;
	


	var news_comment = '<li data-role="none" id="subscriber_news_comment' + object_id + '_' + index + '" class="original_news_comment_wrapper">'
			+ '<input type="hidden" id="id_of_subscriber_read_comment' + object_id + '_' + index + '" data-role="none" value="' + safe_comment_id_for_attribute + '"/>'
			+ '<div class="main_original_news_comment">'
			+ '<div>'
			+ '<span class="profile-thumbnail">';

			if(subscriber_comment_data.readCommentUserData.isAvatarImage == 1){
				news_comment += '<img src="' + app_root_url + 'images/profile_images/blank-avatar.png" alt="Avatar image"/>';
			}else{	
				var safe_user_photo_link_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(subscriber_comment_data.readCommentUserData.profile_image);
				news_comment += '<img src="' + app_root_url + safe_user_photo_link_for_attribute + '" alt="Profile image"/>';
			}

	news_comment += '</span><!--/profile_thumbnail-->'
			+ '<p class="users_name">' + safe_comment_author_for_html + '</p>'
			+ '<p class="date_of_post">' + safe_comment_date_for_html + '</p>';

			if((current_user_privilege == 2) || (current_user_id == safe_comment_user_id_for_javascript)){
				//if the user who is currently logged into the app has a user_privilege of 2 ie is an admin then add a remove_comment button so they 
				//can delete the comment.
				//or if the current user logged in is the same user who created the comment in the first place, then also allow them to delete this comment
			
				news_comment += '<button type="button" id="remove_read_comment_button' + object_id + '_' + index + '" class="remove_read_comment_button remove_post_comment_button"><i class="fa fa-times"></i></button>';
			}
			news_comment += '</div>'
			+ '<p class="text_of_post">' + filterTextForLineBreaks(subscriber_comment_data.readCommentText, 'read_section') + '</p>'
			+ '</div><!--/main_original_news_comment-->'
		
			+ '</li>';
	return news_comment;

}

function generateOriginalNewsComments(comments_on_post){

	var original_news_comments_html = '';
	var index = 0;
	comments_on_post.forEach(function(comment_data) {
		
		original_news_comments_html += createOriginalNewsComment(comment_data, index);
		index++;
	});
	return original_news_comments_html;
}

function createOriginalNewsComment(comment_data, index){
	
	var safe_comment_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(comment_data.comment_ID);
	
	var safe_comment_author_for_html = $ESAPI.encoder().encodeForHTML(comment_data.comment_author);
	var safe_comment_date_for_html = $ESAPI.encoder().encodeForHTML(comment_data.comment_date_gmt);


	var news_comment = '<li data-role="none" id="original_news_comment' + index + '" class="original_news_comment_wrapper">'
			+ '<input type="hidden" id="id_of_comment' + index + '" data-role="none" value="' + safe_comment_id_for_attribute + '"/>'
			+ '<div class="main_original_news_comment">'
			+ '<div>'
			+ '<span class="profile-thumbnail">';

			if(comment_data.user_id == 0){
				news_comment += '<img src="' + app_root_url + 'images/profile_images/blank-avatar.png" alt="Avatar image"/>';
			}else{	
				var safe_user_photo_link_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(comment_data.user_photo_link);
				news_comment += '<img src="' + safe_user_photo_link_for_attribute + '" alt="Profile image"/>';
			}

	news_comment += '</span><!--/profile_thumbnail-->'
			+ '<p class="users_name">' + safe_comment_author_for_html + '</p>'
			+ '<p class="date_of_post">' + safe_comment_date_for_html + '</p>'
			+ '</div>'
			+ '<p class="text_of_post">' + filterTextForLineBreaks(comment_data.comment_content, 'read_section') + '</p>'
			+ '</div><!--/main_original_news_comment-->'
			+ generateOriginalNewsCommentReplies(comment_data.first_level_replies, 'first')
			+ '</li>';
	return news_comment;

}

function generateOriginalNewsCommentReplies(replies, level){

	var original_news_comment_replies_html = '';
	var index = 0;
	replies.forEach(function(reply) {
		
		original_news_comment_replies_html += createOriginalNewsCommentReply(reply, index, level);
		index++;
	});


	return original_news_comment_replies_html;
}


function createOriginalNewsCommentReply(reply, index, level){
	var safe_reply_author_for_html = $ESAPI.encoder().encodeForHTML(reply.comment_author);	
	var safe_reply_date_for_html = $ESAPI.encoder().encodeForHTML(reply.comment_date_gmt);
	
	if(level == 'first'){
	var news_comment_reply = '<div class="original_news_comment_reply">';
	}else if(level == 'second'){
	var news_comment_reply = '<div class="second_level_reply">';
	}else if(level == 'third'){
	var news_comment_reply = '<div class="third_level_reply">';
	}else if(level == 'fourth'){
	var news_comment_reply = '<div class="fourth_level_reply">';
	}else if(level == 'fifth'){
	var news_comment_reply = '<div class="fifth_level_reply">';
	}

	news_comment_reply += '<div>'
			+ '<span class="profile-thumbnail">';

			if((reply.user_id == 0) || (!reply.user_photo_link.length)){
				news_comment_reply += '<img src="' + app_root_url + 'images/profile_images/blank-avatar.png" alt="Avatar image"/>';
			}else{
				var safe_user_photo_link_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(reply.user_photo_link);
				news_comment_reply += '<img src="' + safe_user_photo_link_for_attribute + '" alt="Profile image" />';
			}

	news_comment_reply += '</span><!--/profile_thumbnail-->'
			+ '<p class="users_name">' + safe_reply_author_for_html + '</p>'
			+ '<p class="date_of_comment">' + safe_reply_date_for_html + '</p>'
			+ '</div>'
			+ '<p class="text_of_comment">' + filterTextForLineBreaks(reply.comment_content, 'read_section') + '</p>'
			+ '</div><!--/original_news_comment_reply-->';

			if(level == 'first'){
				
				news_comment_reply += generateOriginalNewsCommentReplies(reply.second_level_replies, 'second');
			}else if(level == 'second'){
				
				news_comment_reply += generateOriginalNewsCommentReplies(reply.third_level_replies, 'third');
			}else if(level == 'third'){
				
				news_comment_reply += generateOriginalNewsCommentReplies(reply.fourth_level_replies, 'fourth');
			}else if(level == 'fourth'){
				
				news_comment_reply += generateOriginalNewsCommentReplies(reply.fifth_level_replies, 'fifth');
			}
	return news_comment_reply;

}

function getStoryContent(category_id, category_name, unique_story_index){
	$('.loading_page_message').html('Please wait...');
	
	$('.loading_page_message').show();
	//console.log("getStoryContent");
	//need to send the id of the object/post/story over to server side to do a request to the database to get the content for this story.

	var safe_category_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(category_id);
	var safe_unique_story_index_for_javascript = $ESAPI.encoder().encodeForJavaScript(unique_story_index);
	var read_story_id = $('#input_field_for_story_id_' + safe_unique_story_index_for_javascript).val();
				
	var safe_read_story_id_for_javascript = $ESAPI.encoder().encodeForJavaScript(read_story_id);
	
					
	//get the content for this story
	var page_selector = "#page-read-" + safe_category_id_for_javascript + "-" + safe_read_story_id_for_javascript;

	var token = localStorage.getItem("usertoken");
	var params = {'usertoken' : token, 'read_story_id' : safe_read_story_id_for_javascript};
	if($(page_selector).length){
		//this story page already exists in document so we just need to do an ajax request for the comments in case there are any new ones.
		
		$.ajax({
			url: app_root_url + 'read/get_original_story_comments.php',
       			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
			var result = data;
				var token_is_valid = result.token_is_valid;
				if(token_is_valid){	
					
					var object_id = read_story_id;
					var safe_object_id_for_javascript = safe_read_story_id_for_javascript;
					var comments_on_post = result.comments_on_post;
					
					var subscriber_comments = result.subscriber_comments;
					
					var number_of_subscriber_comments = subscriber_comments.length;
					
					var full_comments_html = generateFullCommentsArea(category_id, object_id, comments_on_post, subscriber_comments);
					
					$('#full_comments_area_' +  safe_category_id_for_javascript + '_' + safe_object_id_for_javascript).html(full_comments_html).promise().done(function(){
						$('#read_comment_textarea_' + category_id + '_' + object_id).on('keypress keyup keydown', function(){
							var input_text = $('#read_comment_textarea_' + category_id + '_' + object_id).val();
							var length_of_input_text = input_text.length;
							var remaining_characters = 2000-length_of_input_text;	
							$('#read_comment_form_characters_remaining_' + category_id + '_' + object_id).html(remaining_characters + ' characters remaining');
							
						});

						//hide the popover when the input field is in focus
						$('#read_comment_textarea_' + category_id + '_' + object_id).on('keypress focus', function(){
							$('#read_comment_box_feedback_area_' + category_id + '_' + object_id).hide();

						});
						for(x = 0; x < number_of_subscriber_comments; x++){
	
							addReadCommentListeners(x, category_id,object_id);
	

						}
						$('#refresh_subscribers_comments_area' + category_id + '_' + object_id).on('click', function(){
							$('#refresh_subscribers_comments_area' + category_id + '_' + object_id).addClass('fa-spinning'); 
							//refresh the subscriber read comments area for this story
							getSubscriberComments(category_id, object_id);
							
						});	
						$('#full_comments_area_' +  safe_category_id_for_javascript + '_' + safe_object_id_for_javascript + ' a:not(.normal_link)').click( function(e) { 
  							e.preventDefault();
							
							var href = $(this).attr('href');
							var ref = window.open(href, '_blank', 'location=yes,resizable=1,width=750,height=650');
						});
						
						document.getElementById('read_comment_box_form_' + safe_category_id_for_javascript + '_' + safe_object_id_for_javascript).addEventListener('submit', function(e) { submitReadCommentForm(category_id, object_id, e);}, false);
						$("#container_wrapper").pagecontainer("change", page_selector, {transition: 'none'});
						$('.loading_page_message').html('');
						$('.loading_page_message').hide();
					});
				}
			},
			error: function(xhr, status, error) {
				
				var error_message = 'There was a problem getting story content! System error: ' + error;
				alert(error_message);
					
							
			}	
		});	
	}else{
		//this story page does not exist yet so we need to do an ajax request to get the story content.
		$.ajax({
       			url: app_root_url + 'read/get_story_content.php',

			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
			var result = data;
				var token_is_valid = result.token_is_valid;
				if(token_is_valid){
					var read_story_page = '';
					var post_title = result.story_data.post_title;
					var post_content = result.story_data.post_content;
					var post_date_gmt = result.story_data.post_date_gmt;
					var post_author_id = result.story_data.post_author;
				
					var post_author_name = result.story_data.post_author_name;
					var post_author_description = result.story_data.post_author_description;
					var post_author_photo = result.story_data.post_author_photo;
					var object_id = result.story_data.object_id;
					var post_thumbnail_url = result.story_data.post_thumbnail_url;
					
					var post_image_credit = result.story_data.photo_credit;
					var story_link = result.story_data.guid;
					var video_exists = result.story_data.video_exists;
					var audio_exists = result.story_data.audio_exists;
					var comments_on_post = result.story_data.comments_on_post;		

					var subscriber_comments = result.subscriber_comments;
					
					var number_of_subscriber_comments = subscriber_comments.length;
					

		
					//we get the number of wordpress soundcloud players after filtering the content on server side for [soundcloud tags.
					//we also filtered the content for <iframe tags that were also soundcloud players and that is why we have two totals here
					var number_of_soundcloud_players = result.story_data.number_of_soundcloud_players;
					var number_of_soundcloud_iframes = result.story_data.number_of_soundcloud_iframes;
					
					var page_id = "page-read-" + safe_category_id_for_javascript + "-" + safe_read_story_id_for_javascript;
					var page_id_selector = "#" + page_id;
					
				
					if(audio_exists){
						var audio_embed_code = result.story_data.audio_embed_code;	
					}else{
						var audio_embed_code = "";
					}

					if(video_exists){
						var video_embed_code = result.story_data.video_embed_code;
						
					}else{
						var video_embed_code = "";
					}
					//console.log(video_embed_code);
					//console.log(audio_embed_code);
					var display_name = $("#hidden_input_for_display_name").val();	
					read_story_page = generateStoryPage(audio_exists, audio_embed_code, video_exists, video_embed_code, category_id, category_name, object_id, post_title, post_date_gmt, post_author_name, story_link, post_thumbnail_url, post_content, post_image_credit, comments_on_post,post_author_description,post_author_photo, display_name, subscriber_comments);
						
					//insert our new story page to the page container in the DOM
					$('#container_wrapper').append(read_story_page).promise().done(function(){
						$('.loading_page_message').html('');
				
						$('#read_comment_textarea_' + category_id + '_' + object_id).on('keypress keyup keydown', function(){
							var input_text = $('#read_comment_textarea_' + category_id + '_' + object_id).val();
							var length_of_input_text = input_text.length;
							var remaining_characters = 2000-length_of_input_text;	
							$('#read_comment_form_characters_remaining_' + category_id + '_' + object_id).html(remaining_characters + ' characters remaining');
							//console.log(remaining_characters);
						});
						//hide the popover when the input field is in focus
						$('#read_comment_textarea_' + category_id + '_' + object_id).on('keypress focus', function(){
							$('#read_comment_box_feedback_area_' + category_id + '_' + object_id).hide();

						});
						for(x = 0; x < number_of_subscriber_comments; x++){
	
							addReadCommentListeners(x, category_id, object_id);
	

						}
						$('#refresh_subscribers_comments_area' + category_id + '_' + object_id).on('click', function(){
							$('#refresh_subscribers_comments_area' + category_id + '_' + object_id).addClass('fa-spinning'); 
							//refresh the subscriber read comments area for this story
							getSubscriberComments(category_id, object_id);
							
						});

						//now that all the html for this page is inserted into the DOM we can target IDs of elements.
						//if audio or video exists then we need to add listeners to stop these from playing on page change
						if(audio_exists){
							//if this post is a soundcloud podcast post then we come here
							//for audio posts we inserted an ID on the server side so we can target that now
							var audio_ID = "soundcloud_widget_" + object_id;
							stopAudioOnPageChange(audio_ID, soundcloud_widgets);
					
						}
						//stop any internal soundcloud players on page change.
						stopInternalSoundcloudPlayersOnPageChange(number_of_soundcloud_players, object_id);
				
						stopInternalSoundcloudIframesOnPageChange(number_of_soundcloud_iframes, object_id);

						pushAnyVideosOntoArray(page_id);
						$('.infogram_anchor_tag').html('');
						$(page_id_selector + ' .insert_story_link_here').attr('href', story_link);
						
						//console.log($(page_id_selector).html());
							$(page_id_selector + ' a:not(.normal_link)').click( function(e) { 
  								e.preventDefault();
								//alert($(this).attr('href'));
								var href = $(this).attr('href');
								var ref = window.open(href, '_blank', 'location=yes,resizable=1');
							});
						
						document.getElementById('read_comment_box_form_' + safe_category_id_for_javascript + '_' + safe_read_story_id_for_javascript).addEventListener('submit', function(e) { submitReadCommentForm(category_id, object_id, e);}, false);
						$('.loading_page_message').html('');
						$('.loading_page_message').hide();
					});


					//go to this page now.
					
					$("#container_wrapper").pagecontainer("change", page_id_selector, {transition: 'none'});
					addSocialSharingListListeners(category_id, object_id);
					
					prepareTwitterShareButton(category_id, category_name, object_id, story_link, post_title);
					
				}else{
					$('.loading_page_message').html('');
					$('.loading_page_message').hide();
					//token is not valid.
					alert("we're sorry. There seems to be an authentication problem.");
				}
			},
			error: function(xhr, status, error) {
				
				var error_message = 'There was a problem getting story content! System error: ' + error;
				alert(error_message);
					
							
			}		
		});
	}
}


function getSubscriberComments(category_id, object_id){
	var token = localStorage.getItem("usertoken");
	var params = {'usertoken' : token, 'object_id' : object_id};
	$.ajax({
		url: app_root_url + 'read/get_subscriber_comments.php',
       		data: JSON.stringify(params), 
		type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
			var result = data;
				var token_is_valid = result.token_is_valid;
				if(token_is_valid){	
				
					var subscriber_comments = result.subscriber_comments;
					
					var number_of_subscriber_comments = subscriber_comments.length;
					var subscriber_comments_html = generateSubscriberNewsComments(subscriber_comments, object_id);
					$('#subscribers_comments_area_' + category_id + '_' + object_id).html(subscriber_comments_html).promise().done(function(){
						//add listeners to the remove buttons	
						for(x = 0; x < number_of_subscriber_comments; x++){
							
							addReadCommentListeners(x, category_id, object_id);
	

						}
						$('#refresh_subscribers_comments_area' + category_id + '_' + object_id).removeClass('fa-spinning'); 
					});	
					//update the subscriber responses heading to reflect the new number.
					if(number_of_subscriber_comments > 1){
						var subscriber_response_string = ' Subscriber Responses';
					}else{
						var subscriber_response_string = ' Subscriber Response';

					}
					if(number_of_subscriber_comments > 0){
						$('#subscriber_comments_heading' + category_id + '_' + object_id).html(number_of_subscriber_comments + subscriber_response_string);
					}else{
						$('#subscriber_comments_heading' + category_id + '_' + object_id).html('');
				

					}	
						
				}
			},
			error: function(xhr, status, error) {
				
				var error_message = 'There was a problem getting comments! System error: ' + error;
				alert(error_message);
					
							
			}		
	});	


}

function addReadCommentListeners(x, category_id, object_id){


	if(document.getElementById('remove_read_comment_button' + object_id + '_' + x)){
	//this element will exist depending on whether the current user has the user privilege to delete this comment
		document.getElementById('remove_read_comment_button' + object_id + '_' + x).addEventListener('click', function() { removeSubscriberComment(x, category_id, object_id);}, false);
	
	}


}
function removeSubscriberComment(x, category_id, object_id){
	
	var remove_comment_button = '#remove_read_comment_button' + object_id + '_' + x;
	disableButton(remove_comment_button, '<i class="fa fa-times"></i>');
	//console.log(x);
	var confirmation_of_delete = confirm("Are you sure you wish to delete this comment?");
	if(confirmation_of_delete){
		//get the id value stored in the hiddne input field within the comment html with index i
		var comment_id = $("#id_of_subscriber_read_comment" + object_id + "_" + x).val();
		
		var token = localStorage.getItem("usertoken");
		var params = {'usertoken': token, 'comment_id' : comment_id, 'object_id' : object_id};
		$.ajax({
       			url: app_root_url + 'read/delete_read_comment.php',
			data: JSON.stringify(params), 
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
       			success: function(data){
				var result = data;
				var token_is_valid = result.token_is_valid;
				if(token_is_valid){
					var unexpected_error = result.unexpected_error;
					if(unexpected_error == true){
						alert("Unexpected error. Please contact support");
						enableButton(remove_comment_button, '<i class="fa fa-times"></i>');
					}else{
						var successful_delete = result.successful_delete;
						if(successful_delete){
							var subscriber_comments = result.subscriber_comments;
							var number_of_subscriber_comments = subscriber_comments.length;
					
							//insert new subscriber comments into the html
							var subscriber_comments_html = generateSubscriberNewsComments(subscriber_comments, object_id);
							$('#subscribers_comments_area_' + category_id + '_' + object_id).html(subscriber_comments_html).promise().done(function(){
								//add listeners to the remove buttons	
								for(x = 0; x < number_of_subscriber_comments; x++){
						
									addReadCommentListeners(x, category_id, object_id);
	

								}
							});	

							//update the subscriber responses heading to reflect the new number.
							if(number_of_subscriber_comments > 1){
								var subscriber_response_string = ' Subscriber Responses';
							}else{
								var subscriber_response_string = ' Subscriber Response';

							}
							if(number_of_subscriber_comments > 0){
								$('#subscriber_comments_heading' + category_id + '_' + object_id).html(number_of_subscriber_comments + subscriber_response_string);
							}else{
								$('#subscriber_comments_heading' + category_id + '_' + object_id).html('');
				

							}
						}else{
							enableButton(remove_comment_button, '<i class="fa fa-times"></i>');
							alert("We're sorry but there was a problem submitting your comment");
						}
					}	
				}else{
					enableButton(remove_comment_button, '<i class="fa fa-times"></i>');
					alert("We're sorry but there seems to be an authentication problem");

				}					
			},
        		error: function(xhr, status, error) {

				enableButton(remove_comment_button, '<i class="fa fa-times"></i>');
			
				alert("We're sorry but an unexpected error occurred while removing this comment. Error message: " + error);
							
			}
		});

	}else{

		enableButton(remove_comment_button, '<i class="fa fa-times"></i>');
	}
}
function submitReadCommentForm(category_id, object_id, e){
	e.preventDefault(); 
	var submit_comment_button = '#submit_read_comment_' + category_id + '_' + object_id;
	disableButton(submit_comment_button, 'Posting...');
	var comment_text = $("#read_comment_textarea_" + category_id + "_" + object_id).val();
	var comment_length = comment_text.length;
	
	
	if(comment_length < 2 || comment_length == null || comment_length > 2000){
		$('#read_comment_box_feedback_area_' + category_id + '_' + object_id).fadeIn(100);		
			
		$('#read_comment_box_popover_rectangle_' + category_id + '_' + object_id).html('Comments must be between 2 and 2000 characters.');
		enableButton(submit_comment_button, 'Post comment');
	}else{
		
		
			var token = localStorage.getItem("usertoken");
			var params = {'usertoken' : token, 'object_id' : object_id, 'comment_text' : comment_text};
			$.ajax({
				url: app_root_url + 'read/submit_read_comment.php',
       				data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
       				success: function(data){
					var result = data;
					var token_is_valid = result.token_is_valid;
					if(token_is_valid){
						var text_is_valid = result.text_is_valid;
						var is_valid_encoding = result.is_valid_encoding;	
						//alert("is_valid_encoding " + is_valid_encoding);

						if(text_is_valid == true){
							//this will be true if encoding is valid
							var successful_insert = result.successful_insert;
							if(successful_insert == true){
								var subscriber_comments = result.subscriber_comments;
								
								var number_of_subscriber_comments = subscriber_comments.length;
								
								$('#read_comment_textarea_' + category_id + '_' + object_id).val(''); //empty field	
								enableButton(submit_comment_button, 'Post comment'); //enable submit comment button again
								$('#read_comment_form_characters_remaining_' + category_id + '_' + object_id).html('');
								var subscriber_comments_html = generateSubscriberNewsComments(subscriber_comments, object_id);
								$('#subscribers_comments_area_' + category_id + '_' + object_id).html(subscriber_comments_html).promise().done(function(){

									//add listeners to the remove buttons	
									for(x = 0; x < number_of_subscriber_comments; x++){
										//console.log("added after submit" + x);
										addReadCommentListeners(x, category_id, object_id);
	

									}
								});
								
								//update the subscriber responses heading to reflect the new number.
								if(number_of_subscriber_comments > 1){
									var subscriber_response_string = ' Subscriber Responses';
								}else{
									var subscriber_response_string = ' Subscriber Response';

								}

								$('#subscriber_comments_heading' + category_id + '_' + object_id).html(number_of_subscriber_comments + subscriber_response_string);
							}else{
								enableButton(submit_comment_button, 'Post comment');
								alert("We're sorry but an error occured submitting your comment.");
							}
						
						}else{
							enableButton(submit_comment_button, 'Post comment');
							alert("Invalid text. Please try again!");
						}
					}else{
						enableButton(submit_comment_button, 'Post comment');
						//token invalid
						alert("We're sorry there seems to be an authentication problem.");

					}
				},
        			error: function(xhr, status, error) {

					//enable submit comment button
					enableButton(submit_comment_button, 'Post comment');
			
					alert("We're sorry but an unexpected error occurred while submitting your comment. Error message: " + error);
							
				}	
			});
			
	}

}

function addSocialSharingListListeners(category_id, object_id){
		
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	var safe_object_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(object_id);
	

	var share_buttonID = '#share_button_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute;
	var close_share_list_button = '#close_share_list_button_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute;
	var sharing_list = '#sharing_list_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute;

	$(share_buttonID).on('click', function(){
		if($(sharing_list).hasClass('opened_before')){
			if($(sharing_list).hasClass('is_open')){
				$(sharing_list).removeClass('is_open');	
			}else{
				$(sharing_list).addClass('is_open');	
			}
		}else{
			//this is the first time the share button has been pressed so we
			//need to first display it as it is set to display: none. 
			$(sharing_list).slideDown("20", function(){
        			$(sharing_list).addClass('is_open');	
    			});	
			$(sharing_list).addClass('opened_before');					
		}	
	});
	$(close_share_list_button).on('click', function(){
		$(sharing_list).removeClass('is_open');																																																		
	});
				
}
function prepareFacebookShareButton(category_id, category_name, object_id, story_link, post_title){
	var safe_category_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(category_id);
	var safe_object_id_for_attribute = $ESAPI.encoder().encodeForHTMLAttribute(object_id);
	
	var safe_story_link = $ESAPI.encoder().encodeForURL(story_link);
	var facebook_share_button = '#share_on_facebook_button_' + safe_category_id_for_attribute + '_' + safe_object_id_for_attribute;

		$(facebook_share_button).on('click', function(){
			if(story_link.toLowerCase().indexOf('dublininquirer') >= 0){
				//only allow this code to execute if the link contains dublininquirer otherwise the link might have been generated by a hacker.
				
				ga_storage._trackEvent('Click', 'Share on facebook: ' + category_name + '- ' + post_title);
				
				facebookConnectPlugin.getLoginStatus(function(response_login) {
					if (response_login.status === 'connected') {
						facebookConnectPlugin.showDialog(
						{
   				 			method: "feed",
    							link: story_link,
    							caption: post_title
						}, 
						function (response) {},
						function (response) {});
					}else{
						facebookConnectPlugin.login(["public_profile"], function(response2) {
							if (response2.status === 'connected') {
								facebookConnectPlugin.showDialog(
								{
   				 					method: "feed",
    									link: story_link,
    									caption: post_title
								}, 
								function (response) {},
								function (response) {});
							}
						}, 
						function(error){
        						//alert("FB login Failed: " + error);
    						});
					}
				});
			}else{
				alert("invalid sharing link");
			}

		});
	
}

function prepareTwitterShareButton(category_id, category_name, object_id, story_link, post_title){
	
	$('#share_on_twitter_button_' + category_id + '_' + object_id).on('click', function(){
		ga_storage._trackEvent('Click', 'Share on twitter: ' + category_name + '- ' + post_title);
		
		var encodedStoryLink = encodeURIComponent(story_link);
		var encodedPostTitle = encodeURIComponent(post_title);	
		var ref = window.open('http://twitter.com/share?url=' + encodedStoryLink + '&text=' + encodedPostTitle + '&hashtags=dublin,dublininquirer&related=DublinInquirer&', 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	
	});
}

/*****************************Code for contribute section************************************/
	
function addContributePicture(){
	if(deviceIsReady){
		//first clear any feedback messages we had on a previous form submission
		removeContributeFeedbackMessages();

		if(images.length <5){
	
		//this is called when the user chooses to add an image to their contribtution story.
		navigator.camera.getPicture(function(f) {
				
			var newImage = "<img src='" + $ESAPI.encoder().encodeForHTMLAttribute(f) + "'>";
			var image_row;
			if(images.length === 0 || images.length === 3 || images.length === 6){
				//append a new row
				var image_row_id = images.length/3;
				image_row = "<div class='image_row' id='image_row" + image_row_id + "'></div>";
				$("#images").append(image_row);
				
			}
			if(images.length === 0 || images.length === 1 || images.length === 2){
				
				$('#image_row0').append(newImage);
			}else if(images.length === 3 || images.length === 4 || images.length === 5){
				
				$('#image_row1').append(newImage);
			}else if(images.length === 6 || images.length === 7 || images.length === 8){
				
				$('#image_row2').append(newImage);
			}
		
			images.push(f);
			$('#remove_contribute_images').show();
		}, function(e) {
		
		}, { 
			quality: 75,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType: Camera.DestinationType.FILE_URI,
			targetWidth: 1500,
			targetHeight: 1500,
			correctOrientation: true 
		});
		}else{
			//alert to the user that they can't exceed the maximum of five images
			navigator.notification.alert("Oops! You've reached the upload limit of 5 images");
			//displayMaximumImageMessage('contribute_feedback_message');
		}
	}else{
		//phonegap APIs are not ready yet
		alert("Please try again in a few moments");
	}

}

function uploadPics(storyID) {
	//this takes in the storyID that will come back from the ajax request after the form is submitted.
	if(deviceIsReady){
		var token = localStorage.getItem("usertoken");		
		var defs = [];
		var imageIndex = 0;
		images.forEach(function(i) {
			
			var def = $.Deferred();

			function win(r) {
				var result = JSON.parse(r.response);
				var token_is_valid = result.token_is_valid;
				if(!token_is_valid){
					//if token is not valid then inform user there has been a problem
					alert("We're sorry. There has been an authentication problem");
				}
				
				if($.trim(r.response) === "0") {
					//alert("this one failed");
					def.resolve(0);
				} else {
					//alert("this one passed");
					def.resolve(1);
				}
			}

			function fail(error) {
		   		alert("We're sorry. There was a problem with one of the images. Please contact support. Error " + JSON.stringify(error));
				enableButton("#submit_story", "Submit");
				enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
				enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");

				def.resolve(0);
			}

			var uri = encodeURI(app_root_url_for_image_uploads + "contribute/upload_contribution_story_image.php");

			var options = new FileUploadOptions();
			options.fileKey="file";
			options.mimeType="image/jpeg";

			//params added
			var params = new Object();
			params.storyID = storyID; //must correspond with $_POST['storyID']
			params.usertoken = token; //must correspond with $_POST['usertoken']
			params.imageIndex = imageIndex; //send the index of the image in the params
			
			options.params = params;
			//end params added


			var ft = new FileTransfer();
			ft.onprogress = function(progressEvent){
   		 		if(progressEvent.lengthComputable){
      					loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
    				}else{	
      					loadingStatus.increment();
    				}
			};

			ft.upload($ESAPI.encoder().encodeForURL(i), uri, win, fail, options);
			defs.push(def.promise());
			imageIndex++;
		});

		$.when.apply($, defs).then(function() {

			//now that the story information (including all images), is in a database, do an ajax request to send this as an email to admin
			
			sendContributionFormByEmail(token, storyID);
			

		});	
	}else{
		//phonegap device APIs are not ready yet
		//this should never happen in this case as this method is only called if the previous addContributePicture function executed
		alert("Please try again in a few moments");
	}
}

function submitContributeStory(e){
	//console.log('pressed');
	e.preventDefault();
	
		var story_subject = $('#contribute_input3').val();  
		var story_message = $('#contribute_input4').val();  
		var contribute_email_address = $("#contribute_input1").val();
		var contribute_full_name = $("#contribute_input0").val();
		var contribute_phone = $("#contribute_input2").val();


		var fullNameIsValid = validateInput(contribute_full_name, fullNameRegex); //max 50

		var subject_length = story_subject.length; //were imposing only a length restriction on the story_subject field
		if(subject_length < 2 || subject_length == null || subject_length > 150){
			var subjectIsValid = false; 
		}else{
			var subjectIsValid = true; 
		}
		var email_length = contribute_email_address.length; 
		//console.log(email_length);
		if(email_length < 2 || email_length == null || email_length > 254){
			var emailIsValid = false; 
		}else{
			var emailIsValid = validateInput(contribute_email_address, emailRegex); 
		}
		var story_length = story_message.length; //were only imposing a length restriction on the message field
		if(story_length < 20 || story_length == null || story_length > 7000){
			var messageIsValid = false; 
		}else{
			var messageIsValid = true; 
		}

		if(contribute_phone == "" || contribute_phone == null){
			//this is valid as phone number is not required so it can be null.
			var phoneNumberIsValid = true;
		}else{
			//if phone number is filled in then we need to check to see how many characters it is
			var phone_number_length = contribute_phone.length; 
			
			if(phone_number_length < 7 || phone_number_length > 20){
				var phoneNumberIsValid = false;
			}else{	
				var phoneNumberIsValid = validateInput(contribute_phone, phoneNumberRegex); // max 20
			}
		}


		if((story_subject == "" || story_subject == null) || 
			(story_message == "" || story_message == null) || 
			(contribute_email_address == "" || contribute_email_address == null) ||
			(contribute_full_name == "" || contribute_full_name == null)){
			//enable submit button
			enableButton("#submit_story", "Submit");
			enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
			enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
			//add class for making text red

			$("#contribute_feedback_message").addClass('error'); 
			displayError('contribute_feedback_message', 'Please fill in the required fields! Note: Required fields are marked with an asterisk.');
		}else if((!subjectIsValid) || (!emailIsValid) || (!phoneNumberIsValid) || (!messageIsValid) || (!fullNameIsValid)){
			if(!subjectIsValid){
				$("#contribute_feedback_message").addClass('error'); 
				displayError('contribute_feedback_message', 'Subject must be 2 to 150 characters');			

			}else if(!phoneNumberIsValid){
				$("#contribute_feedback_message").addClass('error'); 
				displayError('contribute_feedback_message', 'Phone number must only contain numbers and must be between 7 and 20 digits.');		
			}else if(!emailIsValid){
				$("#contribute_feedback_message").addClass('error'); 
				displayError('contribute_feedback_message', 'The email address entered is not valid');
			}else if(!fullNameIsValid){
				$("#contribute_feedback_message").addClass('error'); 
				displayError('contribute_feedback_message', 'Full name is not valid. It must be 3 to 50 characters and contain only letters, numbers and the following special symbols .,\'-');
			
			}else if(!messageIsValid){
				//message is not a valid length
				$("#contribute_feedback_message").addClass('error'); 
				displayError('contribute_feedback_message', 'Message must be 20 to 7000 characters.');
			}
			//enable submit button
			enableButton("#submit_story", "Submit");
			enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
			enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
		}else{
			$("#progress_bar").show();
			var token = localStorage.getItem("usertoken");		
   			//send the story details to story_form_handler which will store the details in a database temporarily 
			//so that we can then send over the image files separately.
			var params = {'usertoken': token, 'story_subject': story_subject, 'story_message':story_message, 'contribute_full_name':contribute_full_name, 'contribute_email_address':contribute_email_address, 'contribute_phone':contribute_phone};                                    	
       				
    			$.ajax({
				
       				url: app_root_url + 'contribute/story_form_handler.php',
               	 		data: JSON.stringify(params), 
				type: "POST",
				dataType: "json",
				contentType: "application/json;charset=utf-8",
       				success: function(data){
					var result = data;
					var token_is_valid = result.token_is_valid;
					

					if(token_is_valid){
						var required_fields_set = result.required_fields_set;
						if(required_fields_set){
							var is_valid_encoding = result.is_valid_encoding;
							if(is_valid_encoding){
								//console.log(" is_valid_encoding " +  is_valid_encoding);	
								var fields_are_valid = result.fields_are_valid;
								if(fields_are_valid){
									var storyID = result.story_id;
									//console.log("fields_are_valid " + fields_are_valid);	

									if(images.length > 0){
										//if the images array is greater than 0 this means the user has chosen some pics to upload.
										//therefore call uploadPics which will transfer the image files to the server 
										uploadPics(storyID);
									}else{
										//the user has submitted the form but not uploaded any images
										//do an ajax request to send the story as an email to admin
										sendContributionFormByEmail(token, storyID);
							
									}
								}else{
									//enable submit button
									enableButton("#submit_story", "Submit");
									enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
									enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
									displayContributionErrorMessage('Error. Invalid form data! Please try again');
									 
								}
							}else{
								//enable submit button
								enableButton("#submit_story", "Submit");
								enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
								enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
								displayContributionErrorMessage('Error. Invalid encoding. Please contact support!'); 
							}
						}else{
							//enable submit button
							enableButton("#submit_story", "Submit");
							enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
							enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
							//fields are not set unexpected error
							displayContributionErrorMessage('Unexpected error. Please contact support!'); 
					
						}
					}else{
						//enable submit button
						enableButton("#submit_story", "Submit");
						enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
						enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
						//token not valid.
						displayContributionErrorMessage('Oops! There was an authentication error when sending the form. Please contact support!'); 
					}
       				},
        			error: function(xhr, status, error) {

					//enable submit button
					enableButton("#submit_story", "Submit");
					enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
					enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
					//message didnt send. leave the input as it is so the user can press submit button again and it could go through next time
					displayContributionErrorMessage("Error message :" + error);
							
				}
   			});
		}


}
function sendContributionFormByEmail(token, storyID){
	var params = { 'usertoken' : token, 'storyID' : storyID};
	$.ajax({
		url: app_root_url + 'contribute/send_story_by_email.php',
       		data: JSON.stringify(params), 
		type: "POST",
		dataType: "json",
		contentType: "application/json;charset=utf-8",
       		success: function(data){
			var result = data;
			var token_is_valid = result.token_is_valid;
			if(token_is_valid){
				if(result.message_sent){
					//reset all values of the form including images array.
					resetContributionFormValues(); 
					//display success message
					
					enableButton("#submit_story", "Submit");
					enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
					enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
					$("#container_wrapper").pagecontainer("change", "#page-contribution-confirmation", {transition: 'none'});
									
				}else{
					enableButton("#submit_story", "Submit");
					enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
					enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
					//message didnt send. leave the input as it is so the user can press submit button again and it could go through next time
					displayContributionErrorMessage('Oops! There was an error when sending the form. Please try again'); 
				}
			}else{
				enableButton("#submit_story", "Submit");
				enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
				enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
				displayContributionErrorMessage('Oops! There was an authentication error when sending the form. Please contact support!'); 
			}
		},
        	error: function(xhr, status, error) {

			//enable submit button

			enableButton("#submit_story", "Submit");
			enableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
			enableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");	
			displayContributionErrorMessage("Error message :" + error);
							
		}

   	});//end ajax
}
$('#submit_story').click(function(e) {
	blurContributionFields();
	disableButton("#submit_story", "Submitting...");
	disableButton("#remove_contribute_images", "<i class='fa fa-times'></i> Remove Images");
	disableButton("#add_contribute_picture", "<i class='fa fa-camera'></i>  Upload");
	submitContributeStory(e);
}); 
/*****************************Code for registration picture************************************/

function addRegistrationPicture(){
	//remove display name popover
	removePopover('#registration_display_name_feedback_area');
	if(deviceIsReady){
		navigator.camera.getPicture(function(f){
			var newProfileImage = $ESAPI.encoder().encodeForURL(f);
			$("#registration_pic").attr('src', newProfileImage);
	

			var success = function(status) {
				//if the cache was cleared successfully then insert the new image to registration pic area
           			$("#registration_pic").attr('src', newProfileImage);
        		}

        		var error = function(status) {
           			//dont need to do anything here as it just means image may not show straight away
        		}

			//clear the cache so the image appears 
			window.cache.clear(success, error);

        		//set the isAvatar boolean to false. this value will be entered to the database in upload_registration_pic.php
			registrationAvatar = 0;
			registrationImage = f;
		
		}, function(e){
			//alert("Error message: " + e);
		}, { 
			quality: 50,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType: Camera.DestinationType.FILE_URI,
			targetWidth: 700,
			targetHeight: 700,
			correctOrientation: true 
		});
	}else{
		//phonegap device APIs are not ready yet
		alert("Please try again in a few moments");
	}
}



function uploadRegistrationPic(userID, token){
	//this will only be called if registrationAvatar is 0
	//regsitration avatar will be 0 if the function addRegistrationPicture() was exectued above
	var defs = [];
	var def = $.Deferred();
	function win(r) {	
		var result = JSON.parse(r.response);
		var token_is_valid = result.token_is_valid;
		if(token_is_valid){
			var profile_image = result.userDetails.profile_image;
		
           		var profile_image_link = app_root_url + $ESAPI.encoder().encodeForURL(profile_image);
			$("#profile_pic").attr("src", profile_image_link);
			$("#panel_profile_image").attr('src',  profile_image_link);
			
        	}else{

			alert("Sorry! There has been an authentication error");
		}

		if($.trim(r.response) === "0") {
			alert("Sorry! we have encountered an error");
			def.resolve(0);
		}else{
			
			def.resolve(1);		
		}
	}		
	function fail(error) {
		//upload of pic failed.
		resetRegistrationImage();
		alert("Sorry! we have encountered an error");
		def.resolve(0);
	}
	var uri = encodeURI(app_root_url_for_image_uploads + "login_registration/upload_registration_pic.php");

	var options = new FileUploadOptions();
	options.fileKey="registration_image_file";
	options.mimeType="image/jpeg";
	//added
	var params = new Object();
	params.usertoken = token; //must correspond with $_POST['usertoken'] on server side
	params.userID = userID;
	params.app_root_url = app_root_url;
	options.params = params;
	//end added

	var ft = new FileTransfer();
	ft.onprogress = function(progressEvent){
   		if(progressEvent.lengthComputable){
      			loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
    		}else{
      			loadingStatus.increment();
    		}
	};

	ft.upload($ESAPI.encoder().encodeForURL(registrationImage), uri, win, fail, options);
	defs.push(def.promise());

	$.when.apply($, defs).then(function() {	
		//alert('done');
		resetRegistrationImage();
		
	});	
}
/*****************************Code for changing profile picture************************************/

function chooseProfilePicture(){
	ga_storage._trackEvent('Click', 'Change profile picture');
	if(deviceIsReady){
		
		navigator.camera.getPicture(function(picture){
			var newProfileImage = $ESAPI.encoder().encodeForURL(picture);
			$("#new_profile_pic").attr('src', newProfileImage);	
			$("#profile_pic_popup").popup("open");

			var success = function(status) {
				//if the cache was cleared successfully then insert the new image
           			$("#new_profile_pic").attr('src', newProfileImage);
				
        		}

        		var error = function(status) {
           			//dont need to do anything here as it just means image may not show straight away
        		}

			//clear the cache so the image appears 
			window.cache.clear(success, error);

			profileImage = picture;
		
		}, function(e){
			profileImage = '';
			//alert("Error message: " + e);
		}, { 
			quality: 50,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType: Camera.DestinationType.FILE_URI,
			targetWidth: 700,
			targetHeight: 700,
			correctOrientation: true 
		});
	}else{
		//phonegap device APIs are not ready yet
		alert("Please try again in a few moments");
	}
}



function uploadProfilePic(){
	disableButton("#confirm_profile_pic_upload", "Please wait...");
	disableButton("#choose_profile_pic_button", "Browse");
	disableButton("#cancel_profile_pic_upload", "<i class='fa fa-times'></i>");
	var token = localStorage.getItem("usertoken");		
	var defs = [];
	var def = $.Deferred();
	function win(r) {	
		var result = JSON.parse(r.response);
		var token_is_valid = result.token_is_valid;
		var profile_image = result.userDetails.profile_image;
		var profile_image_is_set = result.profile_image_is_set;
		if(profile_image_is_set){

       			var success = function(status) {
           			var profile_image_link = app_root_url + $ESAPI.encoder().encodeForURL(profile_image);
				$("#profile_pic").attr("src", profile_image_link);
				$("#panel_profile_image").attr('src',  profile_image_link);
		
				//alert(profile_image);
        		}

        		var error = function(status) {
           			//alert('Error: ' + status);
        		}
        		window.cache.clear(success, error);
		}else{
			//image not set.
			alert('Unexpected error: profile image URL not set');

		}

		if($.trim(r.response) === "0") {
			alert("Sorry! We have encountered an error");
			def.resolve(0);
		}else{
			
			def.resolve(1);		
		}
	}		
	function fail(error) {
		enableButton("#confirm_profile_pic_upload", "Confirm");
		enableButton("#choose_profile_pic_button", "Browse");
		enableButton("#cancel_profile_pic_upload", "<i class='fa fa-times'></i>");
		
		//upload of pic failed.
		alert("Sorry! We have encountered an error: " + JSON.stringify(error));
		def.resolve(0);
	}
	var uri = encodeURI(app_root_url_for_image_uploads + "user_profile/update_profile_pic.php");

	var options = new FileUploadOptions();
	options.fileKey="profile_pic_image_file";
	options.mimeType="image/jpeg";
	//added
	var params = new Object();
	params.usertoken = token; //must correspond with $_POST['usertoken'] on server side
	params.app_root_url = app_root_url;
	options.params = params;
	//end added

	var ft = new FileTransfer();
	ft.onprogress = function(progressEvent){
   		if(progressEvent.lengthComputable){
      			loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
    		}else{
      			loadingStatus.increment();
    		}
	};

	ft.upload($ESAPI.encoder().encodeForURL(profileImage), uri, win, fail, options);
	defs.push(def.promise());

	$.when.apply($, defs).then(function() {	
		enableButton("#confirm_profile_pic_upload", "Confirm");
		enableButton("#choose_profile_pic_button", "Browse");
		enableButton("#cancel_profile_pic_upload", "<i class='fa fa-times'></i>");
		$("#profile_pic_popup").popup("close");
		profileImage = '';
		
	});	
}	

function cancelProfilePicUpload(){

	document.getElementById("new_profile_pic").src = app_root_url + 'images/profile_images/blank-avatar.png';	
	profileImage = '';
}

/*************************Code for when the phonegap device is ready including facebook login code************************************/
function onDeviceReady() {
	//this is necessary to do as part of a phonegap build
	//device APIs are now available
	
	//set boolean to true. used in other functions	
	deviceIsReady = true;	
 	
	//add listeners to buttons which rely on phonegap device APIs 
	document.getElementById("upload_profile_picture_button").addEventListener('click', addRegistrationPicture, false);
	
	document.getElementById("add_contribute_picture").addEventListener('click', addContributePicture, false);
	document.getElementById("change_profile_picture_button").addEventListener('click', chooseProfilePicture, false);
	document.getElementById("choose_profile_pic_button").addEventListener('click', chooseProfilePicture, false);
	document.getElementById("confirm_profile_pic_upload").addEventListener('click', uploadProfilePic, false);

	document.getElementById("cancel_profile_pic_upload").addEventListener('click', cancelProfilePicUpload, false);
 									
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	function onPause() {
  		clearInterval(setNewPostsChecker);
		stopAllVideos();
		stopAllSoundcloudPlayers();

	}
	function onResume() {
		
		enableAllButtons();
		//clear interval just in case onPause wasnt called.
  		clearInterval(setNewPostsChecker);
		setNewPostsChecker = setInterval(function(){checkForNewPostsOrComments()}, 1800000); //30 minutes intervals
		
	}

}//end device ready function


/*********************************************general functions for Jquery styling************************************/

$('.side_menu_link:not(.login)').click(function(){
	//close the side menu when any link on the side is clicked.	
	closeSideMenu();
});
$('#side_menu_account_link').click(function(){
	//close the side menu when the user clicks on their account name in the panel header. We have created a href to their account page	
	closeSideMenu();
});


function styleHeaderIcons(id_of_page, id_of_header_link){
	//this function takes in the id or class of the page we are monitoring and styles the header menu icons
	//whenever we change to the read, engage or contribute pages
	$(document).on("pageshow",id_of_page,function(){
		$('.header_menu_link').removeClass('current');
		$(id_of_header_link).addClass('current');			
		
	});
	$(document).on("pagehide",id_of_page,function(){
		$('.header_menu_link').removeClass('current');
		
	});
}

styleHeaderIcons('#page-engage', '#engage_header_link');
styleHeaderIcons('#page-contribute', '#contribute_header_link');
styleHeaderIcons('#page-read', '#read_header_link');

//we want the read icon to be white while were in the read section so we call the style function on the read category pages and story pages as follows
styleHeaderIcons('.read_category_page', '#read_header_link');
styleHeaderIcons('.read_story_page', '#read_header_link')

$(document).on("pageshow",'#page-read',function(){
	getLatestStories();				
		
});
	
$('#open_in_app_browser').on('click', function(){
	if(deviceIsReady){
		var ref = window.open('http://www.dublininquirer.com/', '_blank', 'location=yes');
		ga_storage._trackEvent('Click', 'Open our website: Dublin Inquirer');
		//ref.addEventListener('loadstart', function(event) { alert('start: ' + event.url); });
		//ref.addEventListener('loaderror', function(event) { alert('error: ' + event.message); });
		//ref.addEventListener('exit', function(event) { alert(event.type); });
	}else{
		//phonegap device ready has not fired yet
		alert('Please try again in a few moments!');
	}		
});
	
}); //end document ready


function storeNewToken(result){
	var token = result.usertoken;
	localStorage.setItem('usertoken', token);	//store JSON Web token that we generated on the server side in local storage.
}
function enableSwipe(){
//create swiping functionality on main containers. on swipe left open the side menu. open swipe right, close it.
	//console.log("enable");
	$("#container_wrapper").on("swipeleft",function(){
    		openSideMenu();
  	});
	$("#panel_area").on("swiperight",function(){
    		closeSideMenu();
  	});
	$("#container_wrapper").on("swiperight",function(){

	    	closeSideMenu();
		
  	});
}
function disableSwipe(){
//the purpose of this function is to disable swiping functionality on main containers. 
//this is so that when a user logs out or is not logged in yet, they cannot open the side menu by swiping 
	$("#container_wrapper").off("swipeleft");
	$("#panel_area").off("swiperight");
	$("#container_wrapper").off("swiperight");
}


	
function openSideMenu(){
//this is called in enableSwipe
	$(".navicon").addClass('is_open');	
	$("#container_wrapper").addClass('menu_open').addClass('swipe_left');
	$(".header_nav").addClass('swipe_left');
	$('.navicon_header_link').addClass('current');
}

function closeSideMenu(){
//this is called in enableSwipe and also whenever a user clicks a side menu link.
	$(".navicon").removeClass('is_open');
	$("#container_wrapper").removeClass('swipe_left').removeClass('menu_open');
	$(".header_nav").removeClass('swipe_left');	
	$('.navicon_header_link').removeClass('current');
	
}

function toggleSideMenu(){
//this function is called when a user presses the navicon on the top right of screen
	if($("#container_wrapper").hasClass('menu_open')){
		//if the navicon is pressed and the menu is already open then close the menu
		closeSideMenu();
		
	}else{
		//otherwise if the navicon is pressed and the menu is currently closed then open the menu
		openSideMenu();	
		
		
	}	
}


function restyleLoginRegistrationPage(){
	$('.header_nav').hide();
	disableSwipe();
}	

function transitionToHomePage(){
	//this function is called when a user logs in or registers and they are allowed access to the app.
	//we then enable the side menu to open and swipe and also show the header
      	$('.header_nav').fadeIn();
	enableSwipe();
	$("#container_wrapper").pagecontainer("change", "#page-home", {transition: 'none'});
}



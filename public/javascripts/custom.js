 var interviewData;

 ;
 (function($) {

     function notEmpty(elem, helperMsg) {
         if (elem.value.length == 0) {
             elem.focus(); // set the focus to this input
             return false;
         }
         $('.adminpwd-alert').hide();
         return true;
     };

     function emailValidator(elem, helperMsg) {
         var emailExp = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
         if (elem.value.match(emailExp)) {
             $('.email-alert').hide();
             $('.adminemail-alert').hide();
             return true;
         } else {
             elem.focus();
             return false;
         }
     };

     function lengthRestriction(elem, min) {
         var uInput = elem.value;
         if (uInput.length >= min) {
             $('.name-alert').hide();
             $('.adminname-alert').hide();
             return true;
         } else {
             elem.focus();
             return false;
         }
     }

     //Handling upload file
     $('#uploadForm').on('submit', function(e) {
         $('#success').hide();
         e.preventDefault();
         var formData = new FormData($(this)[0]),
             ext = $('#fileInput').val().split('.').pop().toLowerCase(),
             email = document.getElementById('inputemail'),
             username = document.getElementById('inputname');

         //hiding all the alerts:
         $('.name-alert, .email-alert, #alert').hide();

         if (lengthRestriction(username, 3)) {
             if (emailValidator(email)) {
                 if ($.inArray(ext, ['csv']) !== -1) {
                     $('#alert').hide();

                     $.ajax({
                         url: '/api/upload',
                         type: 'POST',
                         data: formData,
                         async: false,
                         cache: false,
                         contentType: false,
                         processData: false,
                         success: function(data, status) {
                             data = JSON.parse(data);
                             console.log(data);
                             interviewData = data;

                             $('#success').html('Your file uploaded successfully and will receive a confirmation message to your inbox.').show(300);
                         },
                         error: function(data, error) {
                             console.log(error);
                         }
                     })
                 } else {
                     $('#alert').show();
                 }

             } else {
                 $('.email-alert').show();
             }
         } else {

             $('.name-alert').show();
         }

     });

 })(jQuery);
